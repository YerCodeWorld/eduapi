import { Request, Response, NextFunction } from "express";
import { prisma, DifficultyLevel } from "../../DbClient";

export const packageDifficultyBoxController = {

    async getAllDifficultyBoxes(req: Request, res: Response, next: NextFunction) {
        try {
            const { packageId } = req.query;

            const whereClause = packageId ? { packageId: packageId as string } : {};

            const difficultyBoxes = await prisma.packageDifficultyBox.findMany({
                where: whereClause,
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true
                        }
                    }
                },
                orderBy: [
                    { package: { title: 'asc' } },
                    { difficulty: 'asc' }
                ]
            });

            return res.status(200).json({
                success: true,
                data: difficultyBoxes
            });

        } catch (error) {
            next(error);
        }
    },

    async getDifficultyBoxById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const difficultyBox = await prisma.packageDifficultyBox.findUnique({
                where: { id },
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                            description: true
                        }
                    }
                }
            });

            if (!difficultyBox) {
                return res.status(404).json({
                    success: false,
                    message: "Difficulty box not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: difficultyBox
            });

        } catch (error) {
            next(error);
        }
    },

    async getDifficultyBoxByPackageAndLevel(req: Request, res: Response, next: NextFunction) {
        try {
            const { packageId, difficulty } = req.params;

            const difficultyBox = await prisma.packageDifficultyBox.findUnique({
                where: {
                    packageId_difficulty: {
                        packageId: packageId || '',
                        difficulty: difficulty as DifficultyLevel
                    }
                },
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true
                        }
                    }
                }
            });

            if (!difficultyBox) {
                return res.status(404).json({
                    success: false,
                    message: "Difficulty box not found for this package and difficulty level"
                });
            }

            return res.status(200).json({
                success: true,
                data: difficultyBox
            });

        } catch (error) {
            next(error);
        }
    },

    async createDifficultyBox(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                packageId,
                difficulty,
                title,
                article
            } = req.body;

            if (!packageId || !difficulty || !title || !article) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields missing: packageId, difficulty, title, article"
                });
            }

            // Verify the package exists
            const packageExists = await prisma.exercisePackage.findUnique({
                where: { id: packageId }
            });

            if (!packageExists) {
                return res.status(404).json({
                    success: false,
                    message: "Exercise package not found"
                });
            }

            // Check if difficulty box already exists for this package and difficulty
            const existingBox = await prisma.packageDifficultyBox.findUnique({
                where: {
                    packageId_difficulty: {
                        packageId,
                        difficulty: difficulty as DifficultyLevel
                    }
                }
            });

            if (existingBox) {
                return res.status(400).json({
                    success: false,
                    message: "Difficulty box already exists for this package and difficulty level"
                });
            }

            const difficultyBox = await prisma.packageDifficultyBox.create({
                data: {
                    packageId,
                    difficulty: difficulty as DifficultyLevel,
                    title,
                    article
                },
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                message: "Difficulty box created successfully",
                data: difficultyBox
            });

        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: "Difficulty box already exists for this package and difficulty level"
                });
            }
            next(error);
        }
    },

    async updateDifficultyBox(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove packageId and difficulty from updateData to prevent changing the unique constraint
            const { packageId, difficulty, ...safeUpdateData } = updateData;

            const updatedDifficultyBox = await prisma.packageDifficultyBox.update({
                where: { id },
                data: safeUpdateData,
                include: {
                    package: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                message: "Difficulty box updated successfully",
                data: updatedDifficultyBox
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Difficulty box not found"
                });
            }
            next(error);
        }
    },

    async deleteDifficultyBox(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.packageDifficultyBox.delete({
                where: { id }
            });

            return res.status(200).json({
                success: true,
                message: "Difficulty box deleted successfully"
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Difficulty box not found"
                });
            }
            next(error);
        }
    },

    async getDifficultyBoxesByPackage(req: Request, res: Response, next: NextFunction) {
        try {
            const { packageId } = req.params;

            // Verify package exists
            const packageExists = await prisma.exercisePackage.findUnique({
                where: { id: packageId },
                select: { id: true, title: true }
            });

            if (!packageExists) {
                return res.status(404).json({
                    success: false,
                    message: "Exercise package not found"
                });
            }

            const difficultyBoxes = await prisma.packageDifficultyBox.findMany({
                where: { packageId },
                orderBy: { difficulty: 'asc' }
            });

            return res.status(200).json({
                success: true,
                data: difficultyBoxes,
                packageInfo: packageExists
            });

        } catch (error) {
            next(error);
        }
    },

    async bulkCreateDifficultyBoxes(req: Request, res: Response, next: NextFunction) {
        try {
            const { packageId, difficultyBoxes } = req.body;

            if (!packageId || !Array.isArray(difficultyBoxes) || difficultyBoxes.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "packageId and difficultyBoxes array are required"
                });
            }

            // Verify package exists
            const packageExists = await prisma.exercisePackage.findUnique({
                where: { id: packageId }
            });

            if (!packageExists) {
                return res.status(404).json({
                    success: false,
                    message: "Exercise package not found"
                });
            }

            // Validate difficulty boxes data
            for (const box of difficultyBoxes) {
                if (!box.difficulty || !box.title || !box.article) {
                    return res.status(400).json({
                        success: false,
                        message: "Each difficulty box must have difficulty, title, and article"
                    });
                }
            }

            // Create difficulty boxes
            const createdBoxes = await prisma.$transaction(
                difficultyBoxes.map(box =>
                    prisma.packageDifficultyBox.create({
                        data: {
                            packageId,
                            difficulty: box.difficulty as DifficultyLevel,
                            title: box.title,
                            article: box.article
                        }
                    })
                )
            );

            return res.status(201).json({
                success: true,
                message: `${createdBoxes.length} difficulty boxes created successfully`,
                data: createdBoxes
            });

        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: "One or more difficulty boxes already exist for this package"
                });
            }
            next(error);
        }
    }

};