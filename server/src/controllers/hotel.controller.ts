import { Types } from "mongoose";
import { deleteCloudinaryAsset, deleteCloudinaryAssets } from "../config/cloudinary";
import { Hotel } from "../models/hotel.model";
import { Photo, PropertyPhoto } from "../models/photo.model";
import { Policy } from "../models/policy.model";
import { Room } from "../models/room.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginationMeta, parsePagination } from "../utils/helper";

export const hotelController = {
  /* -------- Listing -------- */
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {
      status: 'approved', deleted_at: null
    };

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .populate('city_id', 'name image')
        .populate('facilities')
        .populate('rooms')
        .sort({ popularity_score: -1, average_review_rating: 1 })
        .skip(skip)
        .limit(limit),
      Hotel.countDocuments(filter)
    ]);
    return ApiResponse.ok(res, hotels, undefined,
      buildPaginationMeta(total, page, limit)
    );
  }),

  /** get single hotel by id */
  getById: asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id)
      .populate('city_id')
      .populate('facilities')
      .populate('rooms')
      .populate('photos');

    if (!hotel || hotel.deleted_at) throw ApiError.notFound('Hotel not found');

    // increment view_count (fire & forget)
    Hotel.updateOne({ _id: hotel._id }, { $inc: { view_count: 1, popularity_score: 0.1 } }).catch(() => { });
    const policies = await Policy.find({ hotel_id: hotel._id });
    return ApiResponse.ok(res, { ...hotel.toJSON(), policies });
  }),

  /**create hotel */
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized('User not  found');
    const files = (req as any).files as { logo?: Express.Multer.File[]; photos?: Express.Multer.File[] } | undefined;

    const hotel = await Hotel.create({
      ...req.body,
      owner_id: req.user?._id,
      logo: files?.logo?.[0]?.path || '',
      location_coordinates:
        req.body.latitude !== undefined && req.body.longitude !== undefined
          ? {
            type: 'point',
            coordinates: [Number(req.body.longitude), Number(req.body.latitude)]
          }
          : undefined
    });

    // store photos
    if (files?.photos?.length) {
      await PropertyPhoto.insertMany(files.photos.map((f) => ({ url: f.path, hotel_id: hotel._id })));
    }

    return ApiResponse.created(res, hotel, 'Hotel created (pending approval)');
  }),

  /**update hotel */
  update: asyncHandler(async (req, res) => {

    if (!req.user) throw ApiError.unauthorized();
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) throw ApiError.notFound();
    // owner can only edit their own hotel
    if (req.user.role === 'owner' && hotel.owner_id?.toString() !== req.user.id) {
      throw ApiError.forbidden();
    }

    const files = (req as any).files as { logo?: Express.Multer.File[]; photos?: Express.Multer.File[] } | undefined;
    if (files?.logo?.[0]) {
      if (hotel.logo) await deleteCloudinaryAsset(hotel.logo);
      hotel.logo = files.logo[0].path;
    }

    Object.assign(hotel, req.body);
    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      hotel.location_coordinates = {
        type: 'Point',
        coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
      };
    }
    await hotel.save();
    return ApiResponse.ok(res, hotel, 'Hotel updated');
  }),


  /* ---------- Delete Hotel  -----------*/
  delete: asyncHandler(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) throw ApiError.notFound();

    const photos = await Photo.find({ hotel_id: hotel._id });
    const props = await PropertyPhoto.find({ hotel_id: hotel._id });
    const urls = [...photos.map((p) => p.url), ...props.map((p) => p.url), ...(hotel.logo ? [hotel.logo] : [])];
    await deleteCloudinaryAssets(urls as string[]);

    await Promise.all([
      Photo.deleteMany({ hotel_id: hotel._id }),
      PropertyPhoto.deleteMany({ hotel_id: hotel._id }),
      Room.deleteMany({ hotel_id: hotel._id }),
      Policy.deleteMany({ hotel_id: hotel._id }),
      hotel.deleteOne(),
    ]);

    return ApiResponse.ok(res, undefined, 'Hotel deleted');
  }),

  /**update hotel status */
  updateStatus: asyncHandler(async (req, res) => {
    const { status } = req.body as { status: 'approved' | 'pending' | 'rejected' };
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!hotel) throw ApiError.notFound("Hotel not found for status");
    return ApiResponse.ok(res, hotel, `Hotel ${status}`);
  }),

  /**get pending hotels */
  getPendingHotels: asyncHandler(async (_req, res) => {
    const hotels = await Hotel.find({ status: 'pending', deleted_at: null }).populate('city_id', 'name');
    if (!hotels) throw ApiError.notFound("Pending hotels not found");
    return ApiResponse.ok(res, hotels, "Pending hotels fetched successfully");
  }),

  /* -------- Price prediction (owner) -------- */



  /* -------- Owner: hotels I own -------- */
  getMyHotels: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const hotels = await Hotel.find({
      $or: [{ owner_id: req.user.id }, { _id: req.user.hotel ? new Types.ObjectId(req.user.hotel) : undefined }],
      deleted_at: null,
    }).populate('city_id');
    return ApiResponse.ok(res, hotels);
  }),
};


