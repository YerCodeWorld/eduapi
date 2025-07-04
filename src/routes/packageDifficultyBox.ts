import { Router } from 'express';
import { packageDifficultyBoxController } from "../controllers/packageDifficultyBox";

const router: Router = Router();

// GET /api/package-difficulty-boxes - Get all difficulty boxes (with optional packageId filter)
router.get('/', packageDifficultyBoxController.getAllDifficultyBoxes);

// GET /api/package-difficulty-boxes/:id - Get difficulty box by ID
router.get('/:id', packageDifficultyBoxController.getDifficultyBoxById);

// GET /api/package-difficulty-boxes/package/:packageId - Get all difficulty boxes for a package
router.get('/package/:packageId', packageDifficultyBoxController.getDifficultyBoxesByPackage);

// GET /api/package-difficulty-boxes/package/:packageId/difficulty/:difficulty - Get specific difficulty box
router.get('/package/:packageId/difficulty/:difficulty', packageDifficultyBoxController.getDifficultyBoxByPackageAndLevel);

// POST /api/package-difficulty-boxes - Create a new difficulty box
router.post('/', packageDifficultyBoxController.createDifficultyBox);

// POST /api/package-difficulty-boxes/bulk - Create multiple difficulty boxes for a package
router.post('/bulk', packageDifficultyBoxController.bulkCreateDifficultyBoxes);

// PUT /api/package-difficulty-boxes/:id - Update difficulty box
router.put('/:id', packageDifficultyBoxController.updateDifficultyBox);

// DELETE /api/package-difficulty-boxes/:id - Delete difficulty box
router.delete('/:id', packageDifficultyBoxController.deleteDifficultyBox);

export { router as packageDifficultyBoxRoutes };