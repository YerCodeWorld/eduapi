"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const DbClient_1 = require("../../DbClient");
// import { ApiError } from '../types';
exports.userController = {
    async getAllUsers(req, res, next) {
        try {
            const users = await DbClient_1.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    country: true,
                    picture: true,
                    createdAt: true,
                    preferredColor: true,
                    preferredLanguage: true
                }
            });
            return res.status(200).json({ success: true, data: users });
        }
        catch (err) {
            next(err);
        }
    },
    async getUserById(req, res, next) {
        try {
            const { email } = req.params;
            const user = await DbClient_1.prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    country: true,
                    picture: true,
                    createdAt: true,
                    preferredColor: true,
                    preferredLanguage: true
                }
            });
            if (!user) {
                // const error: ApiError = new Error('User not found');
                // error.statusCode = 404;
                // throw error;
                console.error("User not found brother");
            }
            return res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    },
    async createUser(req, res, next) {
        try {
            const { email, name, role = 'STUDENT', // ??
            country, picture, preferredColor, preferredLanguage } = req.body;
            if (!email || !name || !country) {
                console.error("User do not have valid email address, or name, or country"); // Which should never happen logically
            }
            // We are assuming that our implementations of this function do not call when users already exists in the DB
            const userData = await DbClient_1.prisma.user.create({
                data: {
                    email,
                    name,
                    role: role,
                    country,
                    picture,
                    preferredColor: preferredColor,
                    preferredLanguage: preferredLanguage
                }
            });
            const message = "User created successfully.";
            return res.status(200).json({
                success: true,
                message: message,
                data: userData
            });
        }
        catch (error) {
            next(error);
        }
    },
    async updateUser(req, res, next) {
        try {
            const { email } = req.params;
            const updateData = req.body;
            const updateUser = await DbClient_1.prisma.user.update({
                where: { email },
                data: updateData
            });
            return res.status(200).json({ success: true, data: updateUser });
        }
        catch (err) {
            next(err);
        }
    }
    // DELETE USER
};
//# sourceMappingURL=users.js.map