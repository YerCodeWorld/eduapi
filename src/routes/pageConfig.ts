import { Router } from 'express';
import { pageConfigController } from "../controllers/pageConfig";

const router: Router = Router();

// GET /api/page-config - Get current page configuration
router.get('/', pageConfigController.getPageConfig);

// GET /api/page-config/public - Get public-safe page configuration
router.get('/public', pageConfigController.getPublicConfig);

// POST /api/page-config - Create page configuration (singleton)
router.post('/', pageConfigController.createPageConfig);

// PUT /api/page-config/:id - Update page configuration
router.put('/:id', pageConfigController.updatePageConfig);

// POST /api/page-config/:id/reset - Reset configuration to defaults
router.post('/:id/reset', pageConfigController.resetToDefaults);

export { router as pageConfigRoutes };