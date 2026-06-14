import { City } from '../models/city.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteCloudinaryAsset } from '../config/cloudinary';

export const cityController = {
  getAll: asyncHandler(async (_req, res) => {
    const cities = await City.find().sort({ name: 1 });
    return ApiResponse.ok(res, cities);
  }),
  getById: asyncHandler(async (req, res) => {
    const city = await City.findById(req.params.id);
    if (!city) throw ApiError.notFound();
    return ApiResponse.ok(res, city);
  }),
  create: asyncHandler(async (req, res) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    const city = await City.create({ ...req.body, image: file?.path });
    return ApiResponse.created(res, city);
  }),
  update: asyncHandler(async (req, res) => {
    const city = await City.findById(req.params.id);
    if (!city) throw ApiError.notFound();
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file?.path) {
      if (city.image) await deleteCloudinaryAsset(city.image);
      city.image = file.path;
    }
    Object.assign(city, req.body);
    await city.save();
    return ApiResponse.ok(res, city);
  }),
  delete: asyncHandler(async (req, res) => {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) throw ApiError.notFound();
    if (city.image) await deleteCloudinaryAsset(city.image);
    return ApiResponse.ok(res, undefined, 'Deleted');
  }),
};
