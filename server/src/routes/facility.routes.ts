import { Router } from 'express';
import { facilityController } from '../controllers/facility.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { namedItemSchema } from '../validations/misc.validation';

const router = Router();

router.get('/', facilityController.getAll);
router.get('/:id', facilityController.getById);
router.post('/add', authenticate, authorize('admin'), validate(namedItemSchema), facilityController.create);
router.put('/edit/:id', authenticate, authorize('admin'), validate(namedItemSchema.partial()), facilityController.update);
router.delete('/delete/:id', authenticate, authorize('admin'), facilityController.delete);

export default router;
