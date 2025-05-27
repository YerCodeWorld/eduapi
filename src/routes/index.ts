// src/routes/index.ts - Updated with teacher profiles
import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";
import { dynamicRoutes } from "./dynamics";
import { postRoutes } from "./posts";
import { imageRoutes } from "./cloudinary";
import { teacherProfileRoutes } from "./teacherProfiles";

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);
router.use('/posts', postRoutes);
router.use('/dynamics', dynamicRoutes);
router.use('/images', imageRoutes);
router.use('/teacher-profiles', teacherProfileRoutes);

export { router as routes };
