"""
Seed the database with a realistic Nepali dataset.

Run:
    python -m scripts.seed
or in docker:
    docker compose run --rm web python -m scripts.seed

Credentials created:
  admin@yatra.com  /  admin1234
  owner1@yatra.com /  owner1234
  owner2@yatra.com /  owner1234
"""

from __future__ import annotations

import asyncio
import random
import uuid
from datetime import datetime, time, timedelta, timezone

from sqlalchemy import select

from app.core.database import db_session
from app.core.security import hash_password
from app.models.booking import Coupon
from app.models.content import Blog, Hero
from app.models.enums import (
    CancellationPolicy,
    DifficultyLevel,
    DiscountType,
    HotelStatus,
    HotelType,
    Role,
    RoomType,
    TravelPackageStatus,
)
from app.models.hotel import Facility, Hotel, Policy, Service
from app.models.location import City
from app.models.room import Room
from app.models.travel import TravelPackage
from app.models.user import User

CITIES = [
    ("Kathmandu", "Capital city, temples, and Thamel nightlife", 27.7172, 85.3240),
    ("Pokhara", "Lakeside views and trekking gateway", 28.2096, 83.9856),
    ("Chitwan", "Jungle safari and Tharu culture", 27.5291, 84.3542),
    ("Lumbini", "Birthplace of the Buddha", 27.4833, 83.2767),
    ("Nagarkot", "Sunrise views of the Himalayas", 27.7156, 85.5208),
]

FACILITIES = [
    "Free WiFi",
    "Swimming Pool",
    "Spa",
    "Gym",
    "Parking",
    "Restaurant",
    "Bar",
    "Room Service",
    "Concierge",
    "Airport Shuttle",
    "Laundry",
    "Pet Friendly",
    "Family Rooms",
    "Conference Room",
    "Garden",
]

SERVICES = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Airport pickup",
    "Tour booking",
    "Bike rental",
    "Luggage storage",
    "Currency exchange",
    "Wake-up call",
    "Trek guide",
]

POLICY_TITLES = [
    "Quiet hours 10pm–6am",
    "Smoking only in designated areas",
    "Check-in requires valid ID",
    "Pets allowed with prior approval",
    "No outside food in restaurant",
]


HERO_SLIDES = [
    (
        "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=2000&q=80",
        "Discover Nepal",
        "Find your perfect stay",
        "From Himalayan lodges to lakeside resorts — book it all on Yatra.",
        "/hotels",
    ),
    (
        "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=2000&q=80",
        "Trek the unknown",
        "Curated travel packages",
        "Hand-picked itineraries with local guides and best-priced lodging.",
        "/travel-packages",
    ),
]

BLOG_SEED = [
    ("Top 10 hotels in Pokhara", "Lake views, infinity pools, and budget gems."),
    (
        "A 7-day Annapurna circuit guide",
        "Permits, lodges, packing — everything you need.",
    ),
    ("Why visit Lumbini once in your life", "The sacred birthplace of the Buddha."),
]


async def _seed_users(db) -> dict[str, User]:
    accounts = {
        "admin": ("admin@yatra.com", "Yatra Admin", "Nepal@123", Role.admin),
        "owner1": ("owner1@yatra.com", "Anil Sharma", "owner1234", Role.owner),
        "owner2": ("owner2@yatra.com", "Sita Gurung", "owner1234", Role.owner),
        "user": ("user@yatra.com", "Test Traveler", "user1234", Role.user),
    }
    out: dict[str, User] = {}
    for key, (email, name, password, role) in accounts.items():
        existing = (
            await db.execute(select(User).where(User.email == email))
        ).scalar_one_or_none()
        if existing:
            out[key] = existing
            continue
        u = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            is_email_verified=True,
        )
        db.add(u)
        await db.flush()
        out[key] = u
    print(f"  ✓ users: {', '.join(u.email for u in out.values())}")
    return out


async def _seed_catalog(db) -> tuple[dict[str, City], list[Facility], list[Service]]:
    cities: dict[str, City] = {}
    for name, desc, lat, lng in CITIES:
        existing = (
            await db.execute(select(City).where(City.name == name))
        ).scalar_one_or_none()
        if existing:
            cities[name] = existing
            continue
        c = City(
            name=name, country="Nepal", description=desc, latitude=lat, longitude=lng
        )
        db.add(c)
        await db.flush()
        cities[name] = c

    facilities = []
    for f_name in FACILITIES:
        existing = (
            await db.execute(select(Facility).where(Facility.name == f_name))
        ).scalar_one_or_none()
        if existing:
            facilities.append(existing)
            continue
        f = Facility(name=f_name, icon=f_name.lower().split()[0])
        db.add(f)
        await db.flush()
        facilities.append(f)

    services = []
    for s_name in SERVICES:
        existing = (
            await db.execute(select(Service).where(Service.name == s_name))
        ).scalar_one_or_none()
        if existing:
            services.append(existing)
            continue
        s = Service(name=s_name)
        db.add(s)
        await db.flush()
        services.append(s)

    print(
        f"  ✓ catalog: {len(cities)} cities, {len(facilities)} facilities, {len(services)} services"
    )
    return cities, facilities, services


async def _seed_hotels(db, cities, facilities, services, users) -> list[Hotel]:
    if (await db.execute(select(Hotel))).first():
        print("  • hotels already exist — skipping")
        return (await db.execute(select(Hotel))).scalars().all()

    hotel_specs = [
        (
            "Hotel Yak & Yeti",
            "Kathmandu",
            HotelType.hotel,
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400",
        ),
        (
            "Temple Tree Resort",
            "Pokhara",
            HotelType.resort,
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400",
        ),
        (
            "Club Himalaya",
            "Nagarkot",
            HotelType.resort,
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400",
        ),
        (
            "Tiger Tops Tharu Lodge",
            "Chitwan",
            HotelType.resort,
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400",
        ),
        (
            "Lumbini Buddha Garden Hotel",
            "Lumbini",
            HotelType.hotel,
            "https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=400",
        ),
        (
            "Pokhara Lakeside Homestay",
            "Pokhara",
            HotelType.homestay,
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400",
        ),
        (
            "Backpackers Hostel Thamel",
            "Kathmandu",
            HotelType.hostel,
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400",
        ),
    ]

    hotels: list[Hotel] = []
    for i, (name, city, h_type, logo) in enumerate(hotel_specs):
        owner = users["owner1"] if i % 2 == 0 else users["owner2"]
        h = Hotel(
            name=name,
            email=f"{name.lower().replace(' ', '').replace('&', '')}@example.com",
            phone="9800000000",
            description=f"Welcome to {name}, a wonderful place to stay in {city}.",
            type=h_type,
            status=HotelStatus.approved,
            city_id=cities[city].id,
            owner_id=owner.id,
            address=f"{name}, {city}",
            logo=logo,
            check_in_time=time(14, 0),
            check_out_time=time(12, 0),
            cancellation_policy=CancellationPolicy.flexible,
            tax_percentage=13.0,
            service_charge_percentage=10.0,
            rating=round(random.uniform(3.8, 4.9), 1),
            average_review_rating=round(random.uniform(3.8, 4.9), 1),
            total_reviews=random.randint(10, 500),
            booking_count=random.randint(20, 400),
        )
        h.facilities = random.sample(facilities, k=random.randint(4, 8))
        db.add(h)
        await db.flush()

        # 2-3 room types per hotel
        for rt, price in [
            (RoomType.double, 80),
            (RoomType.deluxe, 130),
            (RoomType.suite, 220),
        ]:
            r = Room(
                hotel_id=h.id,
                room_type=rt,
                room_name=f"{rt.value.title()} Room",
                number_of_rooms=random.randint(3, 12),
                base_price=price + random.randint(-20, 50),
                max_guest=2 if rt != RoomType.suite else 4,
                amenities=(
                    ["WiFi", "TV", "AC"] if rt != RoomType.double else ["WiFi", "TV"]
                ),
                has_wifi=True,
                has_ac=rt != RoomType.double,
                has_tv=True,
            )
            r.services = random.sample(services, k=3)
            db.add(r)

        hotels.append(h)

    print(f"  ✓ hotels: {len(hotels)}")
    return hotels


async def _seed_misc(db, cities) -> None:
    # Travel packages
    if not (await db.execute(select(TravelPackage))).first():
        packages = [
            (
                "Annapurna Base Camp Trek",
                "11-day classic trek to ABC at 4,130m",
                11,
                10,
                1100,
                DifficultyLevel.challenging,
            ),
            (
                "Kathmandu Heritage Tour",
                "3-day cultural tour of UNESCO sites",
                3,
                2,
                280,
                DifficultyLevel.easy,
            ),
            (
                "Chitwan Jungle Safari",
                "4-day wildlife adventure",
                4,
                3,
                420,
                DifficultyLevel.easy,
            ),
        ]
        for name, desc, days, nights, price, diff in packages:
            from app.utils import slugify

            p = TravelPackage(
                name=name,
                slug=f"{slugify(name)}-{uuid.uuid4().hex[:6]}",
                description=desc,
                duration_days=days,
                duration_nights=nights,
                price_per_person=price,
                difficulty_level=diff,
                inclusions=["Accommodation", "Meals", "Guide"],
                exclusions=["Flights", "Personal expenses"],
                itinerary=[
                    {
                        "day": d,
                        "title": f"Day {d}",
                        "description": "Activities and exploration",
                    }
                    for d in range(1, days + 1)
                ],
                status=TravelPackageStatus.active,
                featured_image="https://images.unsplash.com/photo-1554629947-334ff61d85dc?auto=format&fit=crop&w=800",
                total_bookings=random.randint(10, 80),
                average_rating=round(random.uniform(4.3, 4.9), 1),
            )
            db.add(p)
        print("  ✓ travel packages: 3")

    # Heroes
    if not (await db.execute(select(Hero))).first():
        for i, (img, title, subtitle, desc, link) in enumerate(HERO_SLIDES):
            db.add(
                Hero(
                    image=img,
                    title=title,
                    sub_title=subtitle,
                    description=desc,
                    link=link,
                    order=i,
                    active=True,
                )
            )
        print(f"  ✓ heroes: {len(HERO_SLIDES)}")

    # Blogs
    if not (await db.execute(select(Blog))).first():
        from app.utils import slugify

        for title, desc in BLOG_SEED:
            db.add(
                Blog(
                    title=title,
                    slug=f"{slugify(title)}-{uuid.uuid4().hex[:6]}",
                    image="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800",
                    description=desc,
                    content=f"# {title}\n\n{desc}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit...",
                    tags=["travel", "nepal", "tips"],
                    published=True,
                )
            )
        print(f"  ✓ blogs: {len(BLOG_SEED)}")

    # Policies
    if not (await db.execute(select(Policy))).first():
        for title in POLICY_TITLES:
            db.add(Policy(title=title, description=f"{title} — applies to all guests."))
        print(f"  ✓ policies: {len(POLICY_TITLES)}")

    # Sample coupon
    if not (await db.execute(select(Coupon))).first():
        db.add(
            Coupon(
                code="WELCOME10",
                description="10% off your first booking",
                discount_type=DiscountType.percentage,
                discount_value=10,
                min_booking_amount=50,
                max_discount_amount=20,
                valid_from=datetime.now(tz=timezone.utc),
                valid_until=datetime.now(tz=timezone.utc) + timedelta(days=365),
                usage_limit=1000,
                active=True,
            )
        )
        print("  ✓ coupons: 1")


async def main() -> None:
    print("🌱 Seeding Yatra database…\n")
    async with db_session() as db:
        users = await _seed_users(db)
        cities, facilities, services = await _seed_catalog(db)
        await _seed_hotels(db, cities, facilities, services, users)
        await _seed_misc(db, cities)
    print("\n✅ Seed complete.")
    print("\nLogin credentials:")
    print("  admin@yatra.com  /  admin1234")
    print("  owner1@yatra.com /  owner1234")
    print("  user@yatra.com   /  user1234")


if __name__ == "__main__":
    asyncio.run(main())
