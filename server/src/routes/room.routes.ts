import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadRoom } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { createRoomSchema, updateRoomSchema } from '../validations/room.validation';

const router = Router();

router.get('/', roomController.getAll);
router.get('/available', roomController.getAvailableRooms);
router.get('/:id', roomController.getById);
router.post(
  '/add',
  authenticate,
  authorize('owner', 'admin'),
  uploadRoom.array('images', 10),
  validate(createRoomSchema),
  roomController.create,
);
router.put(
  '/edit/:id',
  authenticate,
  authorize('owner', 'admin'),
  uploadRoom.array('images', 10),
  validate(updateRoomSchema),
  roomController.update,
);
router.delete('/delete/:id', authenticate, authorize('owner', 'admin'), roomController.delete);
router.post('/remove-image/:id', authenticate, authorize('owner', 'admin'), roomController.removeImage);

export default router;
