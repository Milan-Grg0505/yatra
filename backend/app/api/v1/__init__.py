from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    catalog,
    hotels,
    rooms,
    travel,
    reviews,
    notifications,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(hotels.router)
api_router.include_router(rooms.router)
api_router.include_router(travel.router)
api_router.include_router(reviews.router)
api_router.include_router(notifications.router)


# Catalog (each is a small router)
api_router.include_router(catalog.blogs_router)
api_router.include_router(catalog.cities_router)
api_router.include_router(catalog.facilities_router)
api_router.include_router(catalog.services_router)
api_router.include_router(catalog.heroes_router)
api_router.include_router(catalog.policies_router)
