// src/index.ts - Fixed Express server with proper SSR handling
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { routes } from './routes';
import { createSSRRouter } from './routes/ssr'; // Updated import

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
        'https://www.ieduguide.com'
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

// Static file serving for Express API's own frontend
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SSR middleware - ONLY for bots and crawlers on specific routes
const ssrRouter = createSSRRouter();
app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip SSR for API calls, static files, and API frontend
    if (req.path.startsWith('/api') ||
        req.path.includes('.') || // Skip files with extensions
        req.path === '/' && req.hostname.includes('api.ieduguide.com')) {
        return next();
    }

    // Define SSR-eligible routes
    const ssrRoutePatterns = [
        /^\/blog\/[^\/]+$/,        // Individual blog posts
        /^\/dynamics\/[^\/]+$/,    // Individual dynamics
        /^\/teachers\/[^\/]+$/,    // Individual teacher profiles
        /^\/exercises\/[^\/]+$/,   // Individual exercises
    ];

    const isSSRRoute = ssrRoutePatterns.some(pattern => pattern.test(req.path));

    if (isSSRRoute) {
        const userAgent = req.get('User-Agent') || '';

        // Check if this is a bot/crawler that needs SSR
        const needsSSR =
            // Social media bots
            /facebookexternalhit|twitterbot|whatsapp|telegram|linkedin|slack|discord/i.test(userAgent) ||
            // Search engine bots
            /googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(userAgent) ||
            // Preview generators
            /prerender|postman|insomnia|chrome-lighthouse/i.test(userAgent);

        if (needsSSR) {
            // Use SSR router
            return ssrRouter(req, res, next);
        }
    }

    // Continue to next middleware
    next();
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Catch-all route for Express API frontend
app.get('*', (req, res) => {
    // Only serve the API frontend for api.ieduguide.com
    if (req.hostname.includes('api.ieduguide.com') || req.hostname === 'localhost') {
        res.sendFile(path.join(publicPath, 'index.html'));
    } else {
        // For other domains, return 404
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Express API frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`SSR enabled for social media bots and crawlers`);
});