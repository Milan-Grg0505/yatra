import { Router } from "express";
import userRoutes from "./user.routes"
import blogRoutes from "./blog.routes"
import authRoutes from "./auth.routes"
import facilityRoutes from "./facility.routes"
import serviceRoutes from "./service.routes"
import roomRoutes from "./room.routes"

const router = Router();


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/facilities', facilityRoutes);
router.use('/services', serviceRoutes);
router.use('/rooms', roomRoutes);


export default router;
