"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Simple singleton pattern for PrismaClient
let prismaInstance;
function getPrismaClient() {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    return prismaInstance;
}
const prisma = getPrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map