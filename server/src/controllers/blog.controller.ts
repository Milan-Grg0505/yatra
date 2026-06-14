import { deleteCloudinaryAsset } from "../config/cloudinary";
import { Blog } from "../models/blog.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginationMeta, parsePagination } from "../utils/helper";

export const blogController = {
  // get all blogs
  getAll: asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const [blogs, total] = await Promise.all([
      Blog.find({ published: true })
        .populate('author_id', 'name email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments({
        published: true
      }),
    ]);
    return ApiResponse.ok(res, blogs, undefined, buildPaginationMeta(total, page, limit))
  }),

  // get blog by id
  getById: asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('author_id', 'name image');
    if (!blog) throw ApiError.notFound();
    Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } }).catch(() => { });
    return ApiResponse.ok(res, blog);
  }),

  // create blog
  create: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) throw ApiError.badRequest("Blog cover is required!");
    const blog = await Blog.create({ ...req.body, image: file.path, author_id: req.user?.id });
    return ApiResponse.created(res, blog);
  }),

  // update blog
  update: asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw ApiError.notFound();

    const file = (req as any).file as Express.Multer.File | undefined;
    if (file?.path) {
      if (blog.image) await deleteCloudinaryAsset(blog.image);
      blog.image = file.path;
    }
    Object.assign(blog, req.body);
    await blog.save();
    return ApiResponse.ok(res, blog);

  }),

  // delete blog
  delete: asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) throw ApiError.notFound();
    if (blog.image) await deleteCloudinaryAsset(blog.image);
    await blog.deleteOne();
    return ApiResponse.ok(res, undefined, 'Blog deleted successfully');
  }),
}