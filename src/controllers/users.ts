import {Request, Response, NextFunction, response} from "express";
import { prisma, UserRole, Language } from "../../DbClient";
// import { ApiError } from '../types';

export const userController = {

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    picture: true,
                    createdAt: true,
                    preferredColor: true,
                    preferredLanguage: true
                }
            });

            return res.status(200).json({success: true, data: users});

        } catch (err) {
            next(err);
        }
    },

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;

            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
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
        } catch (error) {
            next(error);
        }
    },

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                email,
                name,
                role = 'STUDENT',  // ??
                picture,
                preferredColor,
                preferredLanguage
            } = req.body;

            if (!email || !name) {
                console.error("User do not have valid email address or name");  // Which should never happen logically
            }
            // We are assuming that our implementations of this function do not call when users already exists in the DB
            const userData = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: role as UserRole,
                    picture,
                    preferredColor: preferredColor,
                    preferredLanguage: preferredLanguage as Language
                }
            });
            const message = "User created successfully.";

            return res.status(200).json({
                success: true,
                message: message,
                data: userData
            });
        } catch (error) {
            next(error);
        }
    },

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;
            const updateData = req.body;

            const updateUser = await prisma.user.update({
                where: { email },
                data: updateData
            });

            return res.status(200).json({success: true, data: updateUser});

        } catch (err) {
            next(err);
        }

    }

    // DELETE USER

}