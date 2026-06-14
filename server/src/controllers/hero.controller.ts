import { deleteCloudinaryAsset } from "../config/cloudinary";
import { Hero } from "../models/hero.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const heroController = {
  getAll: asyncHandler(async (req, res) => {
    const heroes = await Hero.find({ active: true }).sort({ order: 1, createdAt: -1 });
    return ApiResponse.ok(res, heroes);
  }),

  getById: asyncHandler(async (req, res) => {
    const hero = await Hero.findById(req.params.id);
    if (!hero) throw ApiError.notFound();
    return ApiResponse.ok(res, hero);
  }),

  create: asyncHandler(async (req, res) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) throw ApiError.badRequest("Hero image is required");
    const hero = await Hero.create({ ...req.body, image: file.path })
    return ApiResponse.created(res, hero);
  }),

  update: asyncHandler(async (req, res) => {
    const hero = await Hero.findById(req.params.id);
    if (!hero) throw ApiError.notFound();

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file?.path) {
      if (hero.image) await deleteCloudinaryAsset
        (hero.image)
      hero.image = file.path;
    }

    Object.assign(hero, req.body);
    await hero.save();
    return ApiResponse.ok(res, hero, "Hero updated successfully");
  }),

  delete: asyncHandler(async (req, res) => {
    const hero = await Hero.findById(req.params.id);
    if (!hero) throw ApiError.notFound();
    if (hero.image) await deleteCloudinaryAsset(hero.image);
    await hero.deleteOne();
    return ApiResponse.ok(res, undefined, "Hero deleted successfully");
  })
}