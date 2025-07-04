import { Router } from 'express';
import { configSettingController } from "../controllers/configSetting";

const router: Router = Router();

// GET /api/config-settings - Get all config settings (with optional filters)
router.get('/', configSettingController.getAllConfigSettings);

// GET /api/config-settings/public - Get public config settings only
router.get('/public', configSettingController.getPublicConfigSettings);

// GET /api/config-settings/category/:category - Get settings by category
router.get('/category/:category', configSettingController.getConfigSettingsByCategory);

// GET /api/config-settings/:id - Get config setting by ID
router.get('/:id', configSettingController.getConfigSettingById);

// GET /api/config-settings/key/:key - Get config setting by key
router.get('/key/:key', configSettingController.getConfigSettingByKey);

// POST /api/config-settings - Create a new config setting
router.post('/', configSettingController.createConfigSetting);

// POST /api/config-settings/bulk - Create multiple config settings
router.post('/bulk', configSettingController.bulkCreateConfigSettings);

// PUT /api/config-settings/:id - Update config setting by ID
router.put('/:id', configSettingController.updateConfigSetting);

// PUT /api/config-settings/key/:key - Update config setting by key
router.put('/key/:key', configSettingController.updateConfigSettingByKey);

// DELETE /api/config-settings/:id - Delete config setting by ID
router.delete('/:id', configSettingController.deleteConfigSetting);

// DELETE /api/config-settings/key/:key - Delete config setting by key
router.delete('/key/:key', configSettingController.deleteConfigSettingByKey);

export { router as configSettingRoutes };