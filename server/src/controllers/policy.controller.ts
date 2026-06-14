import { Policy } from '../models/policy.model';
import { Hotel } from '../models/hotel.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const policyController = {
  /**
   * Owner sees policies for their hotel; admin sees all.
   */
  getAll: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    let filter: Record<string, unknown> = {};
    if (req.user.role === 'owner') {
      const hotel = await Hotel.findOne({ owner_id: req.user.id });
      if (hotel) filter = { hotel_id: hotel._id };
    } else if (req.query.hotel_id) {
      filter = { hotel_id: req.query.hotel_id };
    }
    const policies = await Policy.find(filter);
    return ApiResponse.ok(res, policies);
  }),
  getById: asyncHandler(async (req, res) => {
    const item = await Policy.findById(req.params.id);
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, item);
  }),
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    let hotel_id = req.body.hotel_id;
    if (req.user.role === 'owner' && !hotel_id) {
      const hotel = await Hotel.findOne({ owner_id: req.user.id });
      hotel_id = hotel?._id;
    }
    if (!hotel_id) throw ApiError.badRequest('hotel_id required');
    const policy = await Policy.create({ ...req.body, hotel_id });
    return ApiResponse.created(res, policy);
  }),
  update: asyncHandler(async (req, res) => {
    const item = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, item);
  }),
  delete: asyncHandler(async (req, res) => {
    const item = await Policy.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, undefined, 'Deleted');
  }),
};
