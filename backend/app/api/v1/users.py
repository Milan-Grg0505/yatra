from app.schemas.user import AdminUpdateUser
from app.core.exceptions import Conflict
from app.schemas.user import AdminCreateUser
from app.core.exceptions import NotFound
from app.models import ActivityLog
import uuid
from sqlalchemy import select
from app.models import Hotel
from app.utils.cloudinary_util import delete_image, upload_image
from app.core.exceptions import BadRequest
from app.core.security import verify_password
from app.schemas.auth import ChangePasswordRequest
from app.schemas.user import PreferencesUpdate
from app.schemas.user import ProfileUpdate
from typing import Any
from app.api.deps import CurrentUser
from app.schemas.user import UserOut
from fastapi import APIRouter, File, UploadFile, status

from app.core.responses import ok
from app.api.deps import DbDep
from app.core.security import hash_password
from app.api.deps import AdminUser
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------------------------
# Self endpoints
# ---------------------------------------------------------------------------
@router.get("/me")
async def me(me: CurrentUser) -> dict[str, Any]:
    return ok(UserOut.model_validate(me).model_dump(mode="json"))


@router.put("/me")
async def update_profile(
    body: ProfileUpdate, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(me, k, v)
    await db.commit()
    return ok(UserOut.model_validate(me).model_dump(mode="json"))


@router.put("/me/preferences")
async def update_preferences(
    body: PreferencesUpdate, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    data = body.model_dump(exclude_unset=True)
    travel_style = data.pop(
        "travel_style", None
    )  # emoves the travel_style key from data and returns its value
    if travel_style is not None:
        me.travel_style = [s.value if hasattr(s, "value") else s for s in travel_style]
    if data:
        me.preferences = {**(me.preferences or {}), **data}
    await db.commit()
    return ok(UserOut.model_validate(me).model_dump(mode="json"))


@router.put("/me/change-password")
async def change_password(
    body: ChangePasswordRequest, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    if not me.password_hash or not verify_password(body.old_password, me.password_hash):
        raise BadRequest("Current password is incorrect")
    me.password_hash = hash_password(body.new_password)
    await db.commit()
    return ok(message="Password changed")


@router.post("/me/upload-avatar")
async def upload_avatar(
    me: CurrentUser, db: DbDep, image: UploadFile = File(...)
) -> dict[str, Any]:
    if image.content_type and not image.content_type.startswith("image/"):
        raise BadRequest("File must be an image")
    contents = await image.read()
    result = await upload_image(contents, folder="yatra/avatars")

    # CLean up old image if exists
    if me.image_public_id:
        await delete_image(me.image_public_id)
    me.image = result["url"]
    me.image_public_id = result["public_id"]
    await db.commit()
    return ok({"image": me.image})


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------
@router.get("/me/wishlist")
async def get_wishlist(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    if not me.wishlist:
        me.wishlist = []
    rows = (
        await db.execute(select(Hotel).where(Hotel.id.in_(me.wishlist))).scalars().all()
    )
    # Avoid leaking sensitive fields — keep it light here
    return ok(
        [
            {
                "id": str(h.id),
                "name": h.name,
                "logo": h.logo,
                "city_id": str(h.city_id) if h.city_id else None,
            }
            for h in rows
        ]
    )


@router.post("/me/wishlist/{hotel_id}")
async def add_wishlist(
    hotel_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    if hotel_id not in (me.wishlist or []):
        me.wishlist = [*(me.wishlist or []), hotel_id]
        await db.commit()
    return ok(message="Hotel added to wishlist")


@router.delete("/me/wishlist/{hotel_id}")
async def remove_wishlist(
    hotel_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    me.wishlist = [h for h in (me.wishlist or []) if h != hotel_id]
    await db.commit()
    return ok(message="Removed from wishlist")


@router.post("/me/favorite/{hotel_id}")
async def toggle_favorite(
    hotel_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    favs = list(me.favorite_hotels or [])
    if hotel_id in favs:
        favs.remove(hotel_id)
        favorited = False
    else:
        favs.append(hotel_id)
        favorited = True
    me.favorite_hotels = favs
    await db.commit()
    return ok({"favorited": favorited})


# ---------------------------------------------------------------------------
# Activity / GDPR
# ---------------------------------------------------------------------------
@router.get("/me/activity")
async def my_activity(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(ActivityLog)
                .where(ActivityLog.user_id == me.id)
                .order_by(ActivityLog.timestamp.desc())
                .limit(50)
            )
        )
        .scalars()
        .all()
    )
    return ok(
        [
            {
                "id": str(r.id),
                "action": r.action,
                "type": r.action_type,
                "timestamp": r.timestamp,
            }
            for r in rows
        ]
    )


@router.delete("/me/delete-account")
async def delete_my_account(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    me.is_deleted = True
    from datetime import datetime, timezone

    me.deleted_at = datetime.now(tz=timezone.utc)
    await db.commit()
    return ok(message="Account deactivated")


# download personal data
@router.get("/me/data/export")
async def export_my_data(me: CurrentUser) -> dict[str, Any]:
    return ok({"user": UserOut.model_validate(me).model_dump(mode="json")})


# ---------------------------------------------------------------------------
# Admin CRUD
# ---------------------------------------------------------------------------


@router.get("")
async def list_users(_: AdminUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(User)
                .where(User.is_deleted == False)
                .order_by(User.created_at.desc())
            )
        )
        .scalars()
        .all()
    )
    return ok([UserOut.model_validate(u).model_dump(mode="json") for u in rows])


@router.get("/{user_id}")
async def admin_get_user(user_id: uuid.UUID, _: AdminUser, db: DbDep) -> dict[str, Any]:
    user = (
        await db.execute(select(User).where(User.id == user_id))
    ).scalar_one_or_none()
    if not user:
        raise NotFound("User not found")
    return ok(UserOut.model_validate(user).model_dump(mode="json"))


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def admin_add_user(
    body: AdminCreateUser, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    if (
        await db.execute(select(User).where(User.email == body.email))
    ).scalar_one_or_none():
        raise Conflict("Email already in use")
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        phone=body.phone,
        role=body.role,
        is_email_verified=True,
    )
    db.add(user)
    await db.commit()
    return ok(UserOut.model_validate(user).model_dump(mode="json"))


@router.put("/edit/{user_id}")
async def admin_edit_user(
    user_id: uuid.UUID, body: AdminUpdateUser, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    user = (
        await db.execute(select(User).where(User.id == user_id))
    ).scalar_one_or_none()
    if not user:
        raise NotFound("User not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    await db.commit()
    return ok(UserOut.model_validate(user).model_dump(mode="json"))


@router.delete("/delete/{user_id}")
async def admin_delete_user(
    user_id: uuid.UUID, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    user = (
        await db.execute(select(User).where(User.id == user_id))
    ).scalar_one_or_none()
    if not user:
        raise NotFound("User not found")
    user.is_deleted = True
    from datetime import datetime, timezone

    user.deleted_at = datetime.now(tz=timezone.utc)
    await db.commit()
    return ok(message="User deleted")
