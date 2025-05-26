import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";

export const dynamicsController = {

    async createDynamic(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                title,
                slug,
                objective,
                description,
                content,
                materialsNeeded,
                duration,
                minStudents,
                maxStudents,
                ageGroup,
                difficulty = 'INTERMEDIATE',
                dynamicType,
                published = true,
                featured = false,
                authorEmail
            } = req.body;

            if (!title || !slug || !objective || !description || !content || !authorEmail || !duration || !ageGroup || !dynamicType) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            // Verify user exists and has permission
            const user = await prisma.user.findUnique({ where: { email: authorEmail } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: "Only teachers and admins can create dynamics"
                });
            }

            // Check if slug already exists
            const existingDynamic = await prisma.dynamic.findUnique({ where: { slug } });
            if (existingDynamic) {
                return res.status(409).json({
                    success: false,
                    message: "A dynamic with this slug already exists"
                });
            }

            const newDynamic = await prisma.dynamic.create({
                data: {
                    title,
                    slug,
                    objective,
                    description,
                    content,
                    materialsNeeded: materialsNeeded || null,
                    duration: parseInt(duration),
                    minStudents: parseInt(minStudents) || 1,
                    maxStudents: maxStudents ? parseInt(maxStudents) : null,
                    ageGroup,
                    difficulty,
                    dynamicType,
                    published,
                    featured: user.role === 'ADMIN' ? featured : false, // Only admins can set featured
                    authorEmail
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

            return res.status(201).json({
                success: true,
                data: newDynamic,
                message: "Dynamic created successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    async getDynamicBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;

            const dynamic = await prisma.dynamic.findUnique({
                where: { slug },
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

            if (!dynamic) {
                return res.status(404).json({
                    success: false,
                    message: "Dynamic not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: dynamic
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllDynamics(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                published,
                featured,
                dynamicType,
                ageGroup,
                difficulty,
                minDuration,
                maxDuration,
                limit = 10,
                page = 1,
                orderBy = 'createdAt',
                order = 'desc'
            } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (published !== undefined) {
                where.published = published === 'true';
            }
            if (featured !== undefined) {
                where.featured = featured === 'true';
            }
            if (dynamicType) {
                where.dynamicType = dynamicType;
            }
            if (ageGroup) {
                where.ageGroup = ageGroup;
            }
            if (difficulty) {
                where.difficulty = difficulty;
            }
            if (minDuration || maxDuration) {
                where.duration = {};
                if (minDuration) where.duration.gte = parseInt(minDuration as string);
                if (maxDuration) where.duration.lte = parseInt(maxDuration as string);
            }

            const dynamics = await prisma.dynamic.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: {
                    [orderBy as string]: order,
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

            const totalCount = await prisma.dynamic.count({ where });

            return res.status(200).json({
                success: true,
                data: dynamics,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getDynamicsByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;
            const { published, featured } = req.query;

            const where: any = { authorEmail: email };
            if (published !== undefined) {
                where.published = published === 'true';
            }
            if (featured !== undefined) {
                where.featured = featured === 'true';
            }

            const dynamics = await prisma.dynamic.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
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

            return res.status(200).json({
                success: true,
                data: dynamics
            });
        } catch (error) {
            next(error);
        }
    },

    async updateDynamic(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;
            const {
                title,
                objective,
                description,
                content,
                materialsNeeded,
                duration,
                minStudents,
                maxStudents,
                ageGroup,
                difficulty,
                dynamicType,
                published,
                featured
            } = req.body;

            const existingDynamic = await prisma.dynamic.findUnique({
                where: { slug }
            });

            if (!existingDynamic) {
                return res.status(404).json({
                    success: false,
                    message: "Dynamic not found"
                });
            }

            const updateData: any = {};

            if (title) updateData.title = title;
            if (objective) updateData.objective = objective;
            if (description) updateData.description = description;
            if (content) updateData.content = content;
            if (materialsNeeded !== undefined) updateData.materialsNeeded = materialsNeeded;
            if (duration) updateData.duration = parseInt(duration);
            if (minStudents) updateData.minStudents = parseInt(minStudents);
            if (maxStudents !== undefined) updateData.maxStudents = maxStudents ? parseInt(maxStudents) : null;
            if (ageGroup) updateData.ageGroup = ageGroup;
            if (difficulty) updateData.difficulty = difficulty;
            if (dynamicType) updateData.dynamicType = dynamicType;
            if (published !== undefined) updateData.published = published;
            if (featured !== undefined) updateData.featured = featured;

            const updatedDynamic = await prisma.dynamic.update({
                where: { slug },
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

            return res.status(200).json({
                success: true,
                data: updatedDynamic,
                message: 'Dynamic updated successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteDynamic(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;

            const dynamic = await prisma.dynamic.findUnique({
                where: { slug }
            });

            if (!dynamic) {
                return res.status(404).json({
                    success: false,
                    message: "Dynamic not found"
                });
            }

            await prisma.dynamic.delete({
                where: { slug }
            });

            return res.status(200).json({
                success: true,
                message: 'Dynamic deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};