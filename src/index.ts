// src/index.ts - Updated Express server that preserves original API behavior
import express, {Express} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { routes } from './routes';
import { ssrRoutes } from './routes/ssr'; // New SSR routes

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            "img-src": ["'self", "data:"],
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

// API routes (existing) - HIGHEST PRIORITY
app.use('/api', routes);

// SSR middleware - Only apply to specific routes and conditions
app.use('/', (req, res, next) => {
    const ssrRoutePatterns = [
        /^\/$/,                           // Home
        /^\/blog\/?$/,                    // Blog index
        /^\/blog\/[^\/]+$/,              // Blog posts
        /^\/dynamics\/?$/,               // Dynamics index  
        /^\/dynamics\/[^\/]+$/,          // Individual dynamics
        /^\/teachers\/?$/,               // Teachers index
        /^\/teachers\/[^\/]+$/,          // Teacher profiles
        /^\/exercises\/?$/,              // Exercises index
        /^\/exercises\/[^\/]+$/,         // Individual exercises
    ];

    const isSSRRoute = ssrRoutePatterns.some(pattern => pattern.test(req.path));

    if (isSSRRoute) {
        // Check if this request should get SSR treatment
        const userAgent = req.get('User-Agent') || '';
        const referer = req.get('Referer') || '';
        const origin = req.get('Origin') || '';

        // Conditions for SSR:
        // 1. Social media bots/crawlers
        // 2. Search engine bots
        // 3. Requests from main domain (ieduguide.com)
        // 4. Direct requests without referer (link sharing)
        const isBot = /bot|crawler|spider|facebook|twitter|whatsapp|telegram|linkedin|slack/i.test(userAgent);
        const isSearchBot = /googlebot|bingbot|yandex|duckduckbot/i.test(userAgent);
        const isFromMainDomain = referer.includes('ieduguide.com') || origin.includes('ieduguide.com');
        const isDirectRequest = !referer || referer === '';

        if (isBot || isSearchBot || isFromMainDomain || isDirectRequest) {
            // Use SSR routes
            return ssrRoutes(req, res, next);
        }
    }

    // Continue to normal Express API behavior
    next();
});

// Static file serving for your Express API's own frontend (PRESERVED)
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

// Your original Express API frontend - COMPLETELY PRESERVED
app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Express API frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`SSR routes enabled for social media crawlers`);
});

export default app;