"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const node_path_1 = __importDefault(require("node:path"));
const routes_1 = require("./routes");
// import { errorHandler } from './middleware';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            "img-src": ["'self", "data:"],
        },
    },
}));
app.use((0, morgan_1.default)("combined"));
// NOW this is looking good
app.use((0, cors_1.default)({
    origin: [
        'https://localhost:5173',
        'http://localhost:5173',
        'https://api.ieduguide.com',
        'http://api.ieduguide.com',
        'https://ieduguide.com',
        'https://www.ieduguide.com',
        'http://www.ieduguide.com',
        'http://ieduguide.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api', routes_1.routes);
app.get('/health', (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});
// Landing page
app.use(express_1.default.static(node_path_1.default.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
const publicPath = node_path_1.default.join(__dirname, '..', 'public');
app.use(express_1.default.static(publicPath));
app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(node_path_1.default.join(publicPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Listening on ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
exports.default = app;
//# sourceMappingURL=index.js.map