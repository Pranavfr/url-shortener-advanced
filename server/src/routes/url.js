"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const urlController_1 = require("../controllers/urlController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.authMiddleware, urlController_1.createUrl);
router.get('/', authMiddleware_1.authMiddleware, urlController_1.getUrls);
router.put('/:id', authMiddleware_1.authMiddleware, urlController_1.updateUrl);
router.delete('/:id', authMiddleware_1.authMiddleware, urlController_1.deleteUrl);
router.get('/qr/:id', authMiddleware_1.authMiddleware, urlController_1.generateQR);
router.post('/unlock/:shortCode', urlController_1.unlockUrl); // Public endpoint
exports.default = router;
//# sourceMappingURL=url.js.map