import express, {Express} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { routes } from './routes';

// import { errorHandler } from './middleware';

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

// NOW this is looking good
app.use(cors({
    origin: [
        'https://localhost:5173',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://api.ieduguide.com',
        'http://api.ieduguide.com',
        'https://ieduguide.com',
        'https://www.ieduguide.com',
        'http://www.ieduguide.com',
        'http://ieduguide.com',
        'https://edu-text-phi.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Landing page
app.use(express.static(path.join(__dirname, 'public')));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});


export default app;


