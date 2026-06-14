import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginationMeta, parsePagination } from "../utils/helper";
import "multer";

export const userController = {
  /* -------- Admin: all users -------- */
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const [users, total] = await Promise.all([
      User.find({
        delete_at: null
      }).
        sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({
        delete_at: null
      }),
    ]);

    return ApiResponse.ok(res, users, 'Users fetched', buildPaginationMeta(total, page, limit));
  }),


  // getById
  getById: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user || user.deleted_at) throw ApiError.notFound('User not found');
    return ApiResponse.ok(res, user);
  }),

  /* -------- Self profile -------- */
  // getMyProfile:asyncHandler(async (req,res) =>{
  //   if(!req.user) throw ApiError.unauthorized();
  //   const user = await User.findById(req.user.id);
  //   return ApiResponse.ok(res,user);
  // }),

  // update
  adminUpdate: asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) throw ApiError.notFound();
    return ApiResponse.ok(res, user, 'User updated successfully');
  }),

  // delete
  adminDelete: asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id);
    if (!user) throw ApiError.notFound();
    //  if (user.image) await deleteCloudinaryAsset(user.image);
    await user.deleteOne();
    return ApiResponse.ok(res, user, 'User deleted successfully');
  }),

  // add user
  adminAdd: asyncHandler(async (req, res) => {
    const file = (req as any).file as Express.Multer.File | undefined;
    const user = await User.create({ ...req.body, image: file?.path });
    return ApiResponse.ok(res, user, 'User created successfully');
  })

}