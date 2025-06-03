// src/index.ts - Fixed Express server with proper SSR handling
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { routes } from './routes';
import { ssrRoutes } from './routes/ssr'; // Direct import

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            "img-src": ["'self'", "data:", "https:"],
        },
    },
}));

app.use(morgan("combined"));

app.use(cors({
    origin: [
        'https://localhost:5173',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://api.ieduguide.com',
        'https://ieduguide.com',
        'https://www.ieduguide.com',
        'https://edu-text-phi.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes - HIGHEST PRIORITY
app.use('/api', routes);

// SSR Routes - Mount directly for bot requests
app.use((req, res, next) => {
    const userAgent = req.get('User-Agent') || '';

    // Check if this is a bot/crawler
    const isBot = /facebookexternalhit|twitterbot|whatsapp|telegram|linkedin|slack|discord|googlebot|bingbot|prerender|postman|insomnia|chrome-lighthouse/i.test(userAgent);

    if (isBot) {
        // Let SSR routes handle it
        return ssrRoutes(req, res, next);
    }

    // Not a bot, continue to static files
    next();
});

// Static file serving for Express API's own frontend
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Catch-all route - API frontend (MUST BE LAST)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Express API frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`SSR enabled for social media bots and crawlers`);
});