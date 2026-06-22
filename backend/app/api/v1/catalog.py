from app.api.deps import AdminUser, OwnerAdminUser
from app.utils.pagination import slugify
from app.schemas.content import BlogIn, BlogOut, HeroIn, HeroOut
from fastapi import status
from app.core.exceptions import Forbidden, NotFound
from app.models.enums import Role
import uuid
from app.api.deps import DbDep
from fastapi import APIRouter
from typing import Any
from app.models.content import Hero
from sqlalchemy import select
from app.core.responses import ok

from app.schemas.hotel import (
    CityIn,
    CityOut,
    FacilityIn,
    FacilityOut,
    PolicyIn,
    PolicyOut,
    ServiceIn,
    ServiceOut,
)
from app.models.location import City
from app.models.hotel import Hotel, Service, Facility, Policy
from app.models.content import Blog

# ============================================================================
# CITIES
# ============================================================================

cities_router = APIRouter(prefix="/cities", tags=["cities"])


@cities_router.get("")
async def city_list(db: DbDep) -> dict[str, Any]:
    rows = (
        (await db.execute(select(City).order_by(City.created_at.desc())))
        .scalars()
        .all()
    )
    return ok([CityOut.model_validate(c).model_dump(mode="json") for c in rows])


@cities_router.get("/{city_id}")
async def city_get(item_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    c = (await db.execute(select(City).where(City.id == item_id))).scalar_one_or_none()
    if not c:
        raise NotFound("City not found")
    return ok(CityOut.model_validate(c).model_dump(mode="json"))


@cities_router.post("/add", status_code=status.HTTP_201_CREATED)
async def city_create(body: CityIn, me: AdminUser, db: DbDep) -> dict[str, Any]:
    city = City(**body.model_dump(), slug=slugify(body.name))
    db.add(city)
    await db.commit()
    await db.refresh(city)
    return ok(CityOut.model_validate(city).model_dump(mode="json"))


@cities_router.put("/edit/{city_id}")
async def city_update(
    item_id: uuid.UUID, body: CityIn, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    c = (await db.execute(select(City).where(City.id == item_id))).scalar_one_or_none()
    if not c:
        raise NotFound("City not found")
    # Update ONLY fields that were sent
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)  # Dynamic field assignment!
    await db.commit()
    return ok(CityOut.model_validate(c).model_dump(mode="json"))


@cities_router.delete("/delete/{city_id}")
async def city_delete(item_id: uuid.UUID, _: AdminUser, db: DbDep) -> dict[str, Any]:
    c = (await db.execute(select(City).where(City.id == item_id))).scalar_one_or_none()
    if not c:
        raise NotFound("City not found")
    await db.delete(c)
    await db.commit()
    return ok({"message": "City deleted successfully"})


# ============================================================================
# FACILITIES
# ============================================================================

# Create router
facilities_router = APIRouter(prefix="/facilities", tags=["facilities"])


# List all facilities
@facilities_router.get("")
async def facility_list(db: DbDep) -> dict[str, Any]:
    rows = (
        (await db.execute(select(Facility).order_by(Facility.created_at.desc())))
        .scalars()
        .all()
    )
    return ok([FacilityOut.model_validate(f).model_dump(mode="json") for f in rows])


# Create facility
@facilities_router.post("/add", status_code=status.HTTP_201_CREATED)
async def facility_create(body: FacilityIn, me: AdminUser, db: DbDep) -> dict[str, Any]:
    facility = Facility(**body.model_dump())
    db.add(facility)
    await db.commit()
    await db.refresh(facility)
    return ok(FacilityOut.model_validate(facility).model_dump(mode="json"))


# Get single facility
@facilities_router.get("/{facility_id}")
async def facility_get(facility_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    f = (
        await db.execute(select(Facility).where(Facility.id == facility_id))
    ).scalar_one_or_none()
    if not f:
        raise NotFound("Facility not found")
    return ok(FacilityOut.model_validate(f).model_dump(mode="json"))


# Update facility
@facilities_router.put("/edit/{facility_id}")
async def facility_update(
    facility_id: uuid.UUID,
    body: FacilityIn,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    f = (
        await db.execute(select(Facility).where(Facility.id == facility_id))
    ).scalar_one_or_none()
    if not f:
        raise NotFound("Facility not found")

    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(f, k, v)

    await db.commit()
    return ok(FacilityOut.model_validate(f).model_dump(mode="json"))


# Delete facility
@facilities_router.delete("/delete/{facility_id}")
async def facility_delete(
    facility_id: uuid.UUID,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    f = (
        await db.execute(select(Facility).where(Facility.id == facility_id))
    ).scalar_one_or_none()
    if not f:
        raise NotFound("Facility not found")

    await db.delete(f)
    await db.commit()
    return ok({"message": "Facility deleted successfully"})


# ============================================================================
# SERVICES
# ============================================================================
services_router = APIRouter(prefix="/services", tags=["services"])


# list of services
@services_router.get("")
async def service_list(db: DbDep) -> dict[str, Any]:
    rows = (
        (await db.execute(select(Service).order_by(Service.created_at.desc())))
        .scalars()
        .all()
    )
    return ok([ServiceOut.model_validate(s).model_dump(mode="json") for s in rows])


# create service
@services_router.post("/add", status_code=status.HTTP_201_CREATED)
async def service_create(body: ServiceIn, _: AdminUser, db: DbDep) -> dict[str, Any]:
    service = Service(**body.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return ok(ServiceOut.model_validate(service).model_dump(mode="json"))


@services_router.get("/{service_id}")
async def service_get(service_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    s = (
        await db.execute(select(Service).where(Service.id == service_id))
    ).scalar_one_or_none()
    if not s:
        raise NotFound("Service not found")
    return ok(ServiceOut.model_validate(s).model_dump(mode="json"))


@services_router.put("/edit/{service_id}")
async def service_update(
    service_id: uuid.UUID,
    body: ServiceIn,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    s = (
        await db.execute(select(Service).where(Service.id == service_id))
    ).scalar_one_or_none()
    if not s:
        raise NotFound("Service not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    await db.commit()
    return ok(ServiceOut.model_validate(s).model_dump(mode="json"))


@services_router.delete("/delete/{service_id}")
async def service_delete(
    service_id: uuid.UUID,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    s = (
        await db.execute(select(Service).where(Service.id == service_id))
    ).scalar_one_or_none()
    if not s:
        raise NotFound("Service not found")
    await db.delete(s)
    await db.commit()
    return ok({"message": "Service deleted successfully"})


# ============================================================================
# HEROES
# ============================================================================

heroes_router = APIRouter(prefix="/heroes", tags=["heroes"])


@heroes_router.get("")
async def heroes_list(db: DbDep) -> dict[str, Any]:
    rows = (await db.execute(select(Hero).order_by(Hero.order))).scalars().all()
    return ok([HeroOut.model_validate(h).model_dump(mode="json") for h in rows])


# create heros
@heroes_router.post("/add", status_code=status.HTTP_201_CREATED)
async def heroes_create(body: HeroIn, me: AdminUser, db: DbDep) -> dict[str, Any]:
    hero = Hero(**body.model_dump())
    db.add(hero)
    await db.commit()
    await db.refresh(hero)
    return ok(HeroOut.model_validate(hero).model_dump(mode="json"))


# edit heroes
@heroes_router.put("/edit/{hero_id}")
async def heroes_update(
    hero_id: uuid.UUID,
    body: HeroIn,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    h = (await db.execute(select(Hero).where(Hero.id == hero_id))).scalar_one_or_none()
    if not h:
        raise NotFound("Hero not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(h, k, v)
    await db.commit()
    return ok(HeroOut.model_validate(h).model_dump(mode="json"))


@heroes_router.delete("/delete/{hero_id}")
async def heroes_delete(
    hero_id: uuid.UUID,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    h = (await db.execute(select(Hero).where(Hero.id == hero_id))).scalar_one_or_none()
    if not h:
        raise NotFound("Hero not found")
    await db.delete(h)
    await db.commit()
    return ok({"message": "Hero deleted successfully"})


# ============================================================================
# POLICIES (admin-only; supports legacy /update/:id path)
# ============================================================================

policies_router = APIRouter(prefix="/policies", tags=["policies"])


@policies_router.get("")
async def policies_list(db: DbDep) -> dict[str, Any]:
    rows = (await db.execute(select(Policy))).scalars().all()
    return ok([PolicyOut.model_validate(p).model_dump(mode="json") for p in rows])


@policies_router.get("/{policy_id}")
async def policies_get(policy_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    p = (
        await db.execute(select(Policy).where(Policy.id == policy_id))
    ).scalar_one_or_none()
    if not p:
        raise NotFound("Policy not found")
    return ok(PolicyOut.model_validate(p).model_dump(mode="json"))


async def _verify_policy_hotel(db, me, hotel_id):
    if me.role != Role.admin and hotel_id:
        hotel = (
            await db.execute(select(Hotel).where(Hotel.id == hotel_id))
        ).scalar_one_or_none()
        if not hotel or hotel.owner_id != me.id:
            raise Forbidden("Not your hotel")


@policies_router.post("/add", status_code=status.HTTP_201_CREATED)
async def policy_create(
    body: PolicyIn, me: OwnerAdminUser, db: DbDep
) -> dict[str, Any]:
    await _verify_policy_hotel(db, me, body.hotel_id)
    p = Policy(**body.model_dump())
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return ok(PolicyOut.model_validate(p).model_dump(mode="json"))


@policies_router.put("/edit/{policy_id}")
async def policy_update(
    policy_id: uuid.UUID,
    body: PolicyIn,
    me: OwnerAdminUser,
    db: DbDep,
) -> dict[str, Any]:
    p = (
        await db.execute(select(Policy).where(Policy.id == policy_id))
    ).scalar_one_or_none()
    if not p:
        raise NotFound("Policy not found")
    await _verify_policy_hotel(db, me, p.hotel_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    await db.commit()
    return ok(PolicyOut.model_validate(p).model_dump(mode="json"))


@policies_router.delete("/delete/{policy_id}")
async def policy_delete(
    policy_id: uuid.UUID,
    me: OwnerAdminUser,
    db: DbDep,
) -> dict[str, Any]:
    p = (
        await db.execute(select(Policy).where(Policy.id == policy_id))
    ).scalar_one_or_none()
    if not p:
        raise NotFound("Policy not found")
    await _verify_policy_hotel(db, me, p.hotel_id)
    await db.delete(p)
    await db.commit()
    return ok({"message": "Policy deleted successfully"})


# ============================================================================
# BLOGS  (slug auto-generated)
# ============================================================================

blogs_router = APIRouter(prefix="/blogs", tags=["blogs"])


@blogs_router.get("")
async def blog_list(db: DbDep) -> dict[str, Any]:
    rows = (
        (await db.execute(select(Blog).order_by(Blog.created_at.desc())))
        .scalars()  # ← List of User objects
        .all()
    )
    return ok([BlogOut.model_validate(b).model_dump(mode="json") for b in rows])


@blogs_router.get("/{blog_id}")
async def blog_get(blog_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    b = (await db.execute(select(Blog).where(Blog.id == blog_id))).scalar_one_or_none()
    if not b:
        raise NotFound("Blog not found")
    b.view_count += 1
    await db.commit()
    return ok(BlogOut.model_validate(b).model_dump(mode="json"))


@blogs_router.post("/add", status_code=status.HTTP_201_CREATED)
async def blog_create(body: BlogIn, me: AdminUser, db: DbDep) -> dict[str, Any]:
    blog = Blog(
        **body.model_dump(),
        slug=f"{slugify(body.title)}-{uuid.uuid4().hex[:6]}",
        image="",  # populated separately via upload
        author_id=me.id,
    )

    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return ok(BlogOut.model_validate(blog).model_dump(mode="json"))


# ===============================
# setattr(b, k, v)
# This is the key innovation - it dynamically updates ONLY the fields that were sent in the request.
# ===============================


@blogs_router.put("/edit/{blog_id}")
async def blogs_update(
    blog_id: uuid.UUID, body: BlogIn, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    b = (await db.execute(select(Blog).where(Blog.id == blog_id))).scalar_one_or_none()
    if not b:
        raise NotFound("Blog not found")

    # Update ONLY fields that were sent
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(b, k, v)  # Dynamic field assignment!
    await db.commit()
    return ok(BlogOut.model_validate(b).model_dump(mode="json"))


@blogs_router.delete("/{blog_id}")
async def blogs_delete(
    blog_id: uuid.UUID,
    _: AdminUser,
    db: DbDep,
) -> dict[str, Any]:
    b = (await db.execute(select(Blog).where(Blog.id == blog_id))).scalar_one_or_none()
    if not b:
        raise NotFound("Blog not found")

    await db.delete(b)
    await db.commit()

    return ok({"message": "Blog deleted successfully"})
