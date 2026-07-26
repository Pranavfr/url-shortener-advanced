"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cppInvoker_1 = require("./utils/cppInvoker");
const prisma_1 = require("./utils/prisma");
const auth_1 = __importDefault(require("./routes/auth"));
const url_1 = __importDefault(require("./routes/url"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const redirect_1 = __importDefault(require("./routes/redirect"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/url', url_1.default);
app.use('/api/analytics', analytics_1.default);
// Redirect Route
app.use('/', redirect_1.default);
const PORT = process.env.PORT || 5000;
// Initialize C++ Process and Load existing URLs
const initCpp = async () => {
    try {
        const urls = await prisma_1.prisma.url.findMany({ select: { originalUrl: true, shortCode: true } });
        for (const u of urls) {
            await cppInvoker_1.cppInvoker.insertExisting(u.originalUrl, u.shortCode);
        }
        console.log('Loaded existing URLs into C++ Hash Table');
    }
    catch (err) {
        console.error('Failed to init C++ Hash Table:', err);
    }
};
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initCpp();
});
// Cleanup on exit
process.on('SIGINT', () => {
    cppInvoker_1.cppInvoker.stopProcess();
    process.exit();
});
//# sourceMappingURL=index.js.map