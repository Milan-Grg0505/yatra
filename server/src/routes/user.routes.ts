import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { uploadUser } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateUserSchema } from "../validations/user.validation";

const router = Router();

// Admin / publiclist
router.get('/', userController.getAll);

// Admin actions
router.post('/add', authenticate, authorize('admin'), uploadUser.single('image'), userController.adminAdd);
router.put('/edit/:id', authenticate, authorize('admin'), validate(updateUserSchema), userController.adminUpdate);
router.delete('/delete/:id', authenticate, authorize('admin'), userController.adminDelete);
router.get('/:id', userController.getById);



export default router;
