// src/routes/index.ts - Updated with exercise routes
import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";
import { dynamicRoutes } from "./dynamics";
import { postRoutes } from "./posts";
import { imageRoutes } from "./cloudinary";
import { teacherProfileRoutes } from "./teacherProfiles";
import { exerciseRoutes } from "./exercises";
import { exercisePackageRoutes } from './exercisePackages';
import { pageConfigRoutes } from './pageConfig';
import { packageDifficultyBoxRoutes } from './packageDifficultyBox';
import { configSettingRoutes } from './configSetting';

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);
router.use('/posts', postRoutes);
router.use('/dynamics', dynamicRoutes);
router.use('/images', imageRoutes);
router.use('/teacher-profiles', teacherProfileRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/exercise-packages', exercisePackageRoutes);
router.use('/page-config', pageConfigRoutes);
router.use('/package-difficulty-boxes', packageDifficultyBoxRoutes);
router.use('/config-settings', configSettingRoutes);

export { router as routes };