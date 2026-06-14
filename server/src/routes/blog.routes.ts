import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { uploadBlog } from "../middleware/upload.middleware";
import { blogCreateSchema, blogUpdateSchema } from "../validations/misc.validation";


const router = Router();

router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);

router.post('/add', authenticate, authorize('admin'), uploadBlog.single('image'), validate(blogCreateSchema), blogController.create);

router.put('/edit/:id', authenticate, authorize('admin'), uploadBlog.single('image'), validate(blogUpdateSchema), blogController.update);
router.delete('/delete/:id', authenticate, authorize('admin'), blogController.delete);

export default router;
