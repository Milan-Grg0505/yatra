import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { namedItemSchema } from '../validations/misc.validation';

const router = Router();

router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);
router.post('/add', authenticate, authorize('admin'), validate(namedItemSchema), serviceController.create);
router.put('/edit/:id', authenticate, authorize('admin'), validate(namedItemSchema.partial()), serviceController.update);
router.delete('/delete/:id', authenticate, authorize('admin'), serviceController.delete);

export default router;
