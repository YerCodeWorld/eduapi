import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../DbClient';

export const exercisesController = {
    async getAllExercises(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                type,
                difficulty,
                category,
                authorEmail,
                isPublished,
                tags,
                search,
                page = 1,
                limit = 20
            } = req.query;

            const where: any = {};

            if (type) where.type = type;
            if (difficulty) where.difficulty = difficulty;
            if (category) where.category = category;
            if (authorEmail) where.authorEmail = authorEmail;
            if (isPublished !== undefined) where.isPublished = isPublished === 'true';
            if (tags) where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };
            if (search) {
                where.OR = [
                    { title: { contains: search as string, mode: 'insensitive' } },
                    { instructions: { contains: search as string, mode: 'insensitive' } }
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);

            const exercises = await prisma.exercise.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            const total = await prisma.exercise.count({ where });

            return res.status(200).json({
                success: true,
                data: exercises,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const exercise = await prisma.exercise.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            if (!exercise) {
                return res.status(404).json({
                    success: false,
                    message: 'Exercise not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: exercise
            });
        } catch (error) {
            next(error);
        }
    },

    async getExercisesByAuthor(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;
            const filters = req.query;

            const exercises = await prisma.exercise.findMany({
                where: {
                    authorEmail: email,
                    ...filters
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: exercises
            });
        } catch (error) {
            next(error);
        }
    },

    async createExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const exerciseData = req.body;

            const exercise = await prisma.exercise.create({
                data: exerciseData,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                data: exercise,
                message: 'Exercise created successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async createExercisesBulk(req: Request, res: Response, next: NextFunction) {
        try {
            const { exercises } = req.body;

            if (!Array.isArray(exercises) || exercises.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid exercises array'
                });
            }

            const createdExercises = await prisma.exercise.createMany({
                data: exercises
            });

            const created = await prisma.exercise.findMany({
                where: {
                    authorEmail: exercises[0].authorEmail,
                    createdAt: {
                        gte: new Date(Date.now() - 1000) // Last second
                    }
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: exercises.length
            });

            return res.status(201).json({
                success: true,
                data: created,
                message: `Created ${createdExercises.count} exercises successfully`
            });
        } catch (error) {
            next(error);
        }
    },

    async updateExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const exercise = await prisma.exercise.update({
                where: { id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: exercise,
                message: 'Exercise updated successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.exercise.delete({
                where: { id }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async incrementCompletions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.exercise.update({
                where: { id },
                data: {
                    timesCompleted: { increment: 1 }
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise completion recorded'
            });
        } catch (error) {
            next(error);
        }
    }
};