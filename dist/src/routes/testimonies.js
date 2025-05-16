"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testimonyRoutes = void 0;
const express_1 = require("express");
const testimonies_1 = require("../controllers/testimonies");
const router = (0, express_1.Router)();
exports.testimonyRoutes = router;
router.get('/', testimonies_1.testimonyController.getAllTestimonies);
router.get('/featured', testimonies_1.testimonyController.getFeaturedTestimonies);
router.get('/user/:email', testimonies_1.testimonyController.getTestimonyByEmail);
router.post('/', testimonies_1.testimonyController.createTestimony);
//# sourceMappingURL=testimonies.js.map