import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { cppInvoker } from './utils/cppInvoker';
import { prisma } from './utils/prisma';
import { connectRedis } from './utils/redis';

import authRoutes from './routes/auth';
import urlRoutes from './routes/url';
import analyticsRoutes from './routes/analytics';
import redirectRoutes from './routes/redirect';
import apiKeyRoutes from './routes/apiKeys';
import metadataRoutes from './routes/metadata';
import bioRoutes from './routes/bio';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/meta', metadataRoutes);
app.use('/api/bio', bioRoutes);

// Redirect Route
app.use('/', redirectRoutes);

const PORT = process.env.PORT || 5000;

// Initialize C++ Process and Load existing URLs
const initCpp = async () => {
    try {
        const urls = await prisma.url.findMany({ select: { originalUrl: true, shortCode: true } });
        for (const u of urls) {
            await cppInvoker.insertExisting(u.originalUrl, u.shortCode);
        }
        console.log('Loaded existing URLs into C++ Hash Table');
    } catch (err) {
        console.error('Failed to init C++ Hash Table:', err);
    }
};

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectRedis();
    await initCpp();
});

// Cleanup on exit
process.on('SIGINT', () => {
    cppInvoker.stopProcess();
    process.exit();
});
