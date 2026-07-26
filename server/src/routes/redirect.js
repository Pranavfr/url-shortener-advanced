"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redirectController_1 = require("../controllers/redirectController");
const router = (0, express_1.Router)();
router.get('/:shortCode', redirectController_1.redirectUrl);
exports.default = router;
//# sourceMappingURL=redirect.js.map