import { throwDeprecation } from "node:process";
import { Room } from "../models/room.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../models/booking.model";
import { deleteCloudinaryAssets } from "../config/cloudinary";

export const roomController = {
  getAll: asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = {};
    if (req.query.hotel_id) filter.hotel_id = req.query.hotel_id;;
    const rooms = await Room.find(filter).
      populate("hotel_id", "name").populate('services');
    return ApiResponse.ok(res, rooms, "rooms fetched successfully");
  }),

  getById: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id).
      populate('hotel_id').populate('services');
    return ApiResponse.ok(res, room, "room fetched successfully");
  }),

  /**
  * Available rooms for given hotel between dates.
  * Returns rooms with `available_count` computed.
  */
  getAvailableRooms: asyncHandler(async (req, res) => {
    const { hotel_id, check_in, check_out } = req.query as Record<string, string>;
    if (!hotel_id || !check_in || !check_out) {
      throw ApiError.badRequest('hotel_id,check_in,check_out are required');
    }

    const rooms = await Room.find({ hotel_id });
    const cIn = new Date(check_in);
    const cOut = new Date(check_out);
    const result = await Promise.all(
      rooms.map(async (r) => {
        const booked = await Booking.aggregate([
          { $match: { hotel_id: r.hotel_id, room: r._id, status: { $ne: 'canceled' }, check_in: { $lt: cOut }, check_out: { $gt: cIn } } },
          { $group: { _id: null, total: { $sum: '$num' } } },
        ]);
        const used = booked[0]?.total ?? 0;
        return { ...r.toJSON(), available_count: Math.max(0, r.numberOf_rooms - used) };

      }),
    );
    return ApiResponse.ok(res, result, "Available rooms fetched successfully");
  }),

  // create rooms 
  create: asyncHandler(async (req, res) => {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const room = await Room.create({
      ...req.body,
      images: files?.map((f) => f.path) ?? [],
    });
    return ApiResponse.ok(res, room, "room created successfully");
  }),

  //update rooms
  update: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw ApiError.notFound("Room not found");
    }
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (files?.length) {
      room.images = [...room.images, ...files.map((f) => f.path)];
    }
    Object.assign(room, req.body);
    await room.save();
    return ApiResponse.ok(res, room, "room updated successfully");
  }),

  // deleted room
  delete: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
      throw ApiError.notFound("Room not found");
    }
    await room.deleteOne();
    return ApiResponse.ok(res, null, "room deleted successfully");
  }),

  // remove Image
  /**
   * removeImage function is created to allow deleting individual images from a room's image gallery without deleting the entire room or all its images
   * 
   */
  removeImage: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { url } = req.body as { url: string };
    await deleteCloudinaryAssets([url]);
    const room = await Room.findByIdAndUpdate(id, { $pull: { images: url } }, // $pull removes specific item from array
      { new: true });
    return ApiResponse.ok(res, room, 'Image removed');
  }),


};