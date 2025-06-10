// src/index.ts - Fixed Express server with proper SSR handling
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { routes } from './routes';
import { createSSRRouter } from './routes/ssr';

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
        'http://localhost:3000',
        'http://localhost:3002',
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

// API routes - these take precedence
app.use('/api', routes);

// SSR Routes - MUST come before static files
const ssrRouter = createSSRRouter();
app.use('/', ssrRouter);

// Static file serving for API documentation - only for /api-docs path
const publicPath = path.join(__dirname, '..', 'public');
app.use('/api-docs', express.static(publicPath));

// Serve API documentation at /api-docs
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
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

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API documentation available at: http://localhost:${PORT}/api-docs`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    console.log(`SSR enabled for social media bots`);
});