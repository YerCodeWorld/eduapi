import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../DbClient';

export const exercisePackagesController = {
    async getAllPackages(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                category,
                featured,
                isPublished,
                search,
                page = 1,
                limit = 20,
                userEmail // For user-specific completion data
            } = req.query;

            const where: any = {};

            if (category) where.category = category;
            if (featured !== undefined) where.featured = featured === 'true';
            if (isPublished !== undefined) where.isPublished = isPublished === 'true';
            if (search) {
                where.OR = [
                    { title: { contains: search as string, mode: 'insensitive' } },
                    { description: { contains: search as string, mode: 'insensitive' } },
                    { metaTitle: { contains: search as string, mode: 'insensitive' } }
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);

            const exercisePackages = await prisma.exercisePackage.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: [
                    { featured: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    exercises: {
                        select: {
                            id: true,
                            title: true,
                            difficulty: true,
                            type: true
                        }
                    },
                    completions: userEmail ? {
                        where: {
                            user: {
                                email: userEmail as string
                            }
                        }
                    } : false
                }
            });

            const total = await prisma.exercisePackage.count({ where });

            // Add computed fields
            const packagesWithStats = exercisePackages.map(pkg => ({
                ...pkg,
                exerciseCount: pkg.exercises?.length || 0,
                completionRate: userEmail && pkg.completions && pkg.completions.length > 0
                    ? pkg.completions[0]?.completionRate || 0
                    : undefined
            }));

            return res.status(200).json({
                success: true,
                data: packagesWithStats,
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

    async getPackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { userEmail } = req.query;

            const exercisePackage = await prisma.exercisePackage.findUnique({
                where: { id },
                include: {
                    exercises: {
                        orderBy: [
                            { difficulty: 'asc' },
                            { createdAt: 'asc' }
                        ],
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    picture: true
                                }
                            }
                        }
                    },
                    completions: userEmail ? {
                        where: {
                            user: {
                                email: userEmail as string
                            }
                        }
                    } : false
                }
            });

            if (!exercisePackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Exercise package not found'
                });
            }

            // Add user progress if available
            const packageWithProgress = {
                ...exercisePackage,
                exerciseCount: exercisePackage.exercises?.length || 0,
                userProgress: userEmail && exercisePackage.completions && exercisePackage.completions.length > 0
                    ? {
                        completedExercises: exercisePackage.completions[0]?.completedExercises || [],
                        completionRate: exercisePackage.completions[0]?.completionRate || 0,
                        lastActivityAt: exercisePackage.completions[0]?.lastActivityAt || null
                    }
                    : undefined
            };

            return res.status(200).json({
                success: true,
                data: packageWithProgress
            });
        } catch (error) {
            next(error);
        }
    },

    async getPackageBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;
            const { userEmail } = req.query;

            const exercisePackage = await prisma.exercisePackage.findUnique({
                where: { slug },
                include: {
                    exercises: {
                        orderBy: [
                            { difficulty: 'asc' },
                            { createdAt: 'asc' }
                        ],
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    picture: true
                                }
                            }
                        }
                    },
                    completions: userEmail ? {
                        where: {
                            user: {
                                email: userEmail as string
                            }
                        }
                    } : false
                }
            });

            if (!exercisePackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Exercise package not found'
                });
            }

            // Add user progress if available
            const packageWithProgress = {
                ...exercisePackage,
                exerciseCount: exercisePackage.exercises?.length || 0,
                userProgress: userEmail && exercisePackage.completions && exercisePackage.completions.length > 0
                    ? {
                        completedExercises: exercisePackage.completions[0]?.completedExercises || [],
                        completionRate: exercisePackage.completions[0]?.completionRate || 0,
                        lastActivityAt: exercisePackage.completions[0]?.lastActivityAt || null
                    }
                    : undefined
            };

            return res.status(200).json({
                success: true,
                data: packageWithProgress
            });
        } catch (error) {
            next(error);
        }
    },

    async getPackageExercises(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { difficulty, userEmail } = req.query;

            const where: any = { packageId: id };
            if (difficulty) where.difficulty = difficulty;

            const exercises = await prisma.exercise.findMany({
                where,
                orderBy: [
                    { difficulty: 'asc' },
                    { createdAt: 'asc' }
                ],
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

            // If user email provided, add completion status
            let exercisesWithProgress = exercises;
            if (userEmail && id) {
                const userProgress = await prisma.userPackageCompletion.findUnique({
                    where: {
                        userId_packageId: {
                            userId: userEmail as string,
                            packageId: id
                        }
                    }
                });

                exercisesWithProgress = exercises.map(exercise => ({
                    ...exercise,
                    completed: userProgress?.completedExercises?.includes(exercise.id) || false
                }));
            }

            return res.status(200).json({
                success: true,
                data: exercisesWithProgress
            });
        } catch (error) {
            next(error);
        }
    },

    async createPackage(req: Request, res: Response, next: NextFunction) {
        try {
            const packageData = req.body;

            // Validate required fields
            if (!packageData.title || !packageData.slug || !packageData.description) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: title, slug, description'
                });
            }

            // Check if slug already exists
            const existingPackage = await prisma.exercisePackage.findUnique({
                where: { slug: packageData.slug }
            });

            if (existingPackage) {
                return res.status(400).json({
                    success: false,
                    message: 'Package with this slug already exists'
                });
            }

            const createdPackage = await prisma.exercisePackage.create({
                data: {
                    ...packageData,
                    maxExercises: packageData.maxExercises || 30,
                    isPublished: packageData.isPublished ?? false,
                    featured: packageData.featured ?? false
                },
                include: {
                    exercises: true
                }
            });

            return res.status(201).json({
                success: true,
                data: createdPackage,
                message: 'Exercise package created successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async updatePackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // If updating slug, check if it already exists
            if (updateData.slug) {
                const existingPackage = await prisma.exercisePackage.findFirst({
                    where: {
                        slug: updateData.slug,
                        NOT: { id }
                    }
                });

                if (existingPackage) {
                    return res.status(400).json({
                        success: false,
                        message: 'Package with this slug already exists'
                    });
                }
            }

            const updatedPackage = await prisma.exercisePackage.update({
                where: { id },
                data: updateData,
                include: {
                    exercises: true
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedPackage,
                message: 'Exercise package updated successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async deletePackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.exercisePackage.delete({
                where: { id }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise package deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async addExerciseToPackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { exerciseId } = req.body;

            if (!exerciseId) {
                return res.status(400).json({
                    success: false,
                    message: 'Exercise ID is required'
                });
            }

            // Check if package exists
            const exercisePackage = await prisma.exercisePackage.findUnique({
                where: { id },
                include: { exercises: true }
            });

            if (!exercisePackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            // Check if package has reached max exercises
            const currentExerciseCount = exercisePackage.exercises?.length || 0;
            if (currentExerciseCount >= exercisePackage.maxExercises) {
                return res.status(400).json({
                    success: false,
                    message: `Package has reached maximum of ${exercisePackage.maxExercises} exercises`
                });
            }

            // Update exercise to belong to this package
            await prisma.exercise.update({
                where: { id: exerciseId },
                data: { packageId: id }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise added to package successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async removeExerciseFromPackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, exerciseId } = req.params;

            // Remove exercise from package
            await prisma.exercise.update({
                where: { id: exerciseId },
                data: { packageId: null }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise removed from package successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    async markExerciseComplete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { exerciseId, userEmail } = req.body;

            if (!exerciseId || !userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Exercise ID and user email are required'
                });
            }

            // Get user ID from email
            const user = await prisma.user.findUnique({
                where: { email: userEmail }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get package with exercises
            const exercisePackage = await prisma.exercisePackage.findUnique({
                where: { id },
                include: { exercises: true }
            });

            if (!exercisePackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            // Check if exercise belongs to this package
            const exercise = exercisePackage.exercises?.find(ex => ex.id === exerciseId);
            if (!exercise || !id) {
                return res.status(400).json({
                    success: false,
                    message: 'Exercise does not belong to this package'
                });
            }

            // Get or create user package completion
            let userCompletion = await prisma.userPackageCompletion.findUnique({
                where: {
                    userId_packageId: {
                        userId: user.id,
                        packageId: id
                    }
                }
            });

            if (!userCompletion) {
                userCompletion = await prisma.userPackageCompletion.create({
                    data: {
                        userId: user.id,
                        packageId: id,
                        completedExercises: [],
                        completionRate: 0
                    }
                });
            }

            // Add exercise to completed list if not already completed
            const completedExercises = [...(userCompletion.completedExercises || [])];
            if (!completedExercises.includes(exerciseId)) {
                completedExercises.push(exerciseId);
            }

            // Calculate new completion rate
            const totalExercises = exercisePackage.exercises?.length || 0;
            const completionRate = totalExercises > 0 ? (completedExercises.length / totalExercises) * 100 : 0;

            // Update completion record
            await prisma.userPackageCompletion.update({
                where: {
                    userId_packageId: {
                        userId: user.id,
                        packageId: id
                    }
                },
                data: {
                    completedExercises,
                    completionRate,
                    lastActivityAt: new Date()
                }
            });

            // Also increment the exercise completion count
            await prisma.exercise.update({
                where: { id: exerciseId },
                data: {
                    timesCompleted: { increment: 1 }
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Exercise completion recorded',
                data: {
                    completedExercises,
                    completionRate
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { userEmail } = req.query;

            if (!userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'User email is required'
                });
            }

            // Get user ID from email
            const user = await prisma.user.findUnique({
                where: { email: userEmail as string }
            });

            if (!user || !id) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const progress = await prisma.userPackageCompletion.findUnique({
                where: {
                    userId_packageId: {
                        userId: user.id,
                        packageId: id
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: progress || {
                    completedExercises: [],
                    completionRate: 0,
                    lastActivityAt: null
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Search packages by exercise content
    async searchPackagesByExercises(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                q: query,
                difficulty,
                category,
                minMatches = 1,
                page = 1,
                limit = 20
            } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            // Search for exercises that match the query
            const exerciseWhere: any = {
                OR: [
                    { title: { contains: query as string, mode: 'insensitive' } },
                    { instructions: { contains: query as string, mode: 'insensitive' } },
                    { tags: { hasSome: [(query as string).toLowerCase()] } }
                ],
                packageId: { not: null }
            };

            if (difficulty) exerciseWhere.difficulty = difficulty;
            if (category) exerciseWhere.category = category;

            const matchingExercises = await prisma.exercise.findMany({
                where: exerciseWhere,
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    type: true,
                    packageId: true
                }
            });

            // Group exercises by package
            const packageGroups = matchingExercises.reduce((acc, exercise) => {
                if (!exercise.packageId) return acc;

                (acc[exercise.packageId] ??= []).push(exercise);

                return acc;
            }, {} as Record<string, typeof matchingExercises>);


            // Filter packages that have minimum matches
            const packageIds = Object.keys(packageGroups).filter(
                packageId => (packageGroups[packageId]?.length || 0) >= Number(minMatches)
            );

            if (packageIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        page: 1,
                        limit: Number(limit),
                        total: 0,
                        pages: 0
                    }
                });
            }

            // Get package details
            const skip = (Number(page) - 1) * Number(limit);
            const exercisePackages = await prisma.exercisePackage.findMany({
                where: {
                    id: { in: packageIds },
                    isPublished: true
                },
                skip,
                take: Number(limit),
                include: {
                    exercises: {
                        select: {
                            id: true,
                            title: true,
                            difficulty: true,
                            type: true
                        }
                    }
                }
            });

            // Add matching exercises to each package
            const packagesWithMatches = exercisePackages.map(pkg => ({
                ...pkg,
                matchingExercises: packageGroups[pkg.id] || [],
                totalMatches: packageGroups[pkg.id]?.length || 0,
                exerciseCount: pkg.exercises?.length || 0
            }));

            const total = packageIds.length;

            return res.status(200).json({
                success: true,
                data: packagesWithMatches,
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
    }
};