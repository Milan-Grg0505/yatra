import { Facility } from "../models/facility.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const facilityController = {
  // get all active facilities
  getAll: asyncHandler(async (_req, res) => ApiResponse.ok(res, await Facility.find({ active: true }), "Facilities fetched successfully")),

  // get facility by id
  getById: asyncHandler(async (req, res) => {
    const item = await Facility.findById(req.params.id);
    if (!item) throw ApiError.notFound("Facility not found");
    return ApiResponse.ok(res, item, "Facility fetched successfully");
  }),

  // create facility
  create: asyncHandler(async (req, res) => ApiResponse.created(res, await Facility.create(req.body), "Facility created successfully")),

  // update facility
  update: asyncHandler(async (req, res) => {
    const item = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw ApiError.notFound("Facility not found");
    return ApiResponse.ok(res, item, "Facility updated successfully");
  }),

  // delete facility
  delete: asyncHandler(async (req, res) => {
    const item = await Facility.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound("Facility not found");
    return ApiResponse.ok(res, undefined, 'Facility deleted successfully');
  }),
}