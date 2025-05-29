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

    // src/controllers/exercises.ts - Updated createExercisesBulk method
    async createExercisesBulk(req: Request, res: Response, next: NextFunction) {
        try {
            const { exercises } = req.body;

            if (!Array.isArray(exercises) || exercises.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid exercises array'
                });
            }

            // Ensure all exercises have proper structure and JSON content
            const processedExercises = exercises.map(exercise => ({
                ...exercise,
                // Ensure content is properly formatted as JSON
                content: typeof exercise.content === 'string'
                    ? JSON.parse(exercise.content)
                    : exercise.content,
                // Ensure arrays are properly formatted
                hints: exercise.hints || [],
                tags: exercise.tags || [],
                // Set defaults
                timesCompleted: 0,
                isPublished: exercise.isPublished ?? false,
                // Ensure dates are set by Prisma
                createdAt: undefined,
                updatedAt: undefined
            }));

            // Validate required fields
            for (const exercise of processedExercises) {
                if (!exercise.title || !exercise.type || !exercise.content || !exercise.authorEmail) {
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields in exercise'
                    });
                }
            }

            // Use transaction for bulk creation
            const created = await prisma.$transaction(async (tx) => {
                // Create all exercises
                const createdExercises = await Promise.all(
                    processedExercises.map(exercise =>
                        tx.exercise.create({
                            data: exercise,
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                        picture: true
                                    }
                                }
                            }
                        })
                    )
                );

                return createdExercises;
            });

            return res.status(201).json({
                success: true,
                data: created,
                message: `Created ${created.length} exercises successfully`
            });
        } catch (error) {
            console.error('Error creating exercises:', error);

            // Send more detailed error in development
            if (process.env.NODE_ENV === 'development') {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create exercises',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    details: error
                });
            }

            next(error);
        }
    },

    // Also update the single createExercise for consistency
    async createExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const exerciseData = req.body;

            // Process the exercise data
            const processedData = {
                ...exerciseData,
                // Ensure content is properly formatted as JSON
                content: typeof exerciseData.content === 'string'
                    ? JSON.parse(exerciseData.content)
                    : exerciseData.content,
                // Ensure arrays are properly formatted
                hints: exerciseData.hints || [],
                tags: exerciseData.tags || [],
                // Set defaults
                timesCompleted: 0,
                isPublished: exerciseData.isPublished ?? false
            };

            // Validate required fields
            if (!processedData.title || !processedData.type || !processedData.content || !processedData.authorEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            const exercise = await prisma.exercise.create({
                data: processedData,
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
            console.error('Error creating exercise:', error);
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