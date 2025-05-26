// src/routes/index.ts - Updated to include dynamics route
import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";
import { postRoutes } from "./posts";
import { imageRoutes } from "./cloudinary";
import { dynamicRoutes } from "./dynamics";

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);
router.use('/posts', postRoutes);
router.use('/images', imageRoutes);
router.use('/dynamics', dynamicRoutes); // New dynamics route

export { router as routes };