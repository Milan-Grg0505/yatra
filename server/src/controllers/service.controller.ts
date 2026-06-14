import { Service } from "../models/service.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const serviceController = {
  // get all services
  getAll: asyncHandler(async (_req, res) => ApiResponse.ok(res, await Service.find({ active: true }), "Services Fetched Successfully")),

  // get service by id
  getById: asyncHandler(async (req, res) => {
    const item = await Service.findById(req.params.id);
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, item, "Service Fetched Successfully");
  }),

  // create service
  create: asyncHandler(async (req, res) => ApiResponse.created(res, await Service.create(req.body), "Service Created Successfully")),

  // update service
  update: asyncHandler(async (req, res) => {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, item, "Service Updated Successfully");
  }),
  //delete servicea
  delete: asyncHandler(async (req, res) => {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound();
    return ApiResponse.ok(res, undefined, 'Service Deleted Successfully');
  }),
};
