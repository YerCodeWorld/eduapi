import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";

export const testimonyController = {

    async getAllTestimonies(req: Request, res: Response, next: NextFunction) {
        try {
            const testimonies = await prisma.testimony.findMany({
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });

            return res.status(200).json({ success: true, data: testimonies });
        } catch (error) { next(error); }
    },

    async getFeaturedTestimonies(req: Request, res: Response, next: NextFunction) {
        try {
            const featuredTestimonies = await prisma.testimony.findMany({
                where: {
                    featured: true
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });

            return res.status(200).json({ success: true, data: featuredTestimonies });
        } catch (error) { next(error); }
    },

    async getTestimonyByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;

            const testimonies = await prisma.testimony.findMany({
                where: { userEmail: email },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            });

            if (!testimonies) {
                return res.status(404).json({ success: false, message: 'This user does not have any available testimony'});
            }

            return res.status(200).json({ success: true, data: testimonies });
        } catch (error) { next(error); }
    },

    async createTestimony(req: Request, res: Response, next: NextFunction) {
        try {
            const { content, rating, userEmail } = req.body;

            if (!content || !userEmail || !rating) {
                return res.status(400).json({
                    success: false,
                    message: "Some of the information entered for the testimony is missing."
                });
            }

            const user = await prisma.user.findUnique({
                where: { email: userEmail },
            });

            // I dont like the idea of nesting this api call here, maybe making sure the user exits logic-level is better?
            if (!user) {
                return res.status(400).json({ success: false, message: "User not found to create testimony, please log in." });
            }

            const newTestimony = await prisma.testimony.create({
                data: {
                    content,
                    rating,
                    userEmail,
                    featured: false
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true,
                            role: true
                        }
                    }
                }
            });

            return res.status(200).json({ success: true, message: 'Testimony created successfully', data: newTestimony });
        } catch (err) { next(err); }
    },

    /* OMITTING FOR NOW
    async updateTestimony(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const testimony = await DbClient.testimony.findUnique({
                where: { id }
            });

            if (!testimony) {
                return res.status(400).json({success: false, message: 'Testimony not found to update testimony, please log in.'});
            }

            const updateTestimony = await DbClient.testimony.findUnique({
                where: { id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true,
                            role: true
                        }
                    }
                }
            });

            return res.status(200).json({ success: true, message: 'Testimony updated successfully!', data: testimony });
        } catch (err) { next(err); }
    },

     */

    async deleteTestimony(req: Request, res: Response, next: NextFunction) {

    }


}