import { Router } from 'express';
import { exercisePackagesController } from '../controllers/exercisePackages';

const router: Router = Router();

// GET routes
router.get('/', exercisePackagesController.getAllPackages);
router.get('/search', exercisePackagesController.searchPackagesByExercises);
router.get('/:id', exercisePackagesController.getPackage);
router.get('/slug/:slug', exercisePackagesController.getPackageBySlug);
router.get('/:id/exercises', exercisePackagesController.getPackageExercises);
router.get('/:id/progress', exercisePackagesController.getUserProgress);

// POST routes
router.post('/', exercisePackagesController.createPackage);
router.post('/:id/exercises', exercisePackagesController.addExerciseToPackage);
router.post('/:id/complete', exercisePackagesController.markExerciseComplete);

// PUT routes
router.put('/:id', exercisePackagesController.updatePackage);

// DELETE routes
router.delete('/:id', exercisePackagesController.deletePackage);
router.delete('/:id/exercises/:exerciseId', exercisePackagesController.removeExerciseFromPackage);

export { router as exercisePackageRoutes };