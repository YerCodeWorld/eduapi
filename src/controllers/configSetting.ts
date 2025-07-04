import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";

export const configSettingController = {

    async getAllConfigSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const { category, isPublic, dataType } = req.query;

            const whereClause: any = {};

            if (category) {
                whereClause.category = category as string;
            }

            if (isPublic !== undefined) {
                whereClause.isPublic = isPublic === 'true';
            }

            if (dataType) {
                whereClause.dataType = dataType as string;
            }

            const configSettings = await prisma.configSetting.findMany({
                where: whereClause,
                orderBy: [
                    { category: 'asc' },
                    { key: 'asc' }
                ]
            });

            return res.status(200).json({
                success: true,
                data: configSettings
            });

        } catch (error) {
            next(error);
        }
    },

    async getConfigSettingById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const configSetting = await prisma.configSetting.findUnique({
                where: { id }
            });

            if (!configSetting) {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: configSetting
            });

        } catch (error) {
            next(error);
        }
    },

    async getConfigSettingByKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;

            const configSetting = await prisma.configSetting.findUnique({
                where: { key: key ? decodeURIComponent(key) : '' }
            });

            if (!configSetting) {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: configSetting
            });

        } catch (error) {
            next(error);
        }
    },

    async createConfigSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                key,
                value,
                category,
                description,
                dataType,
                isPublic
            } = req.body;

            if (!key || !value) {
                return res.status(400).json({
                    success: false,
                    message: "Key and value are required"
                });
            }

            // Check if setting with this key already exists
            const existingSetting = await prisma.configSetting.findUnique({
                where: { key }
            });

            if (existingSetting) {
                return res.status(400).json({
                    success: false,
                    message: "Config setting with this key already exists"
                });
            }

            const configSetting = await prisma.configSetting.create({
                data: {
                    key,
                    value,
                    category: category || 'general',
                    description,
                    dataType: dataType || 'string',
                    isPublic: isPublic || false
                }
            });

            return res.status(201).json({
                success: true,
                message: "Config setting created successfully",
                data: configSetting
            });

        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: "Config setting with this key already exists"
                });
            }
            next(error);
        }
    },

    async updateConfigSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove key from updateData to prevent changing unique constraint
            const { key, ...safeUpdateData } = updateData;

            const updatedConfigSetting = await prisma.configSetting.update({
                where: { id },
                data: safeUpdateData
            });

            return res.status(200).json({
                success: true,
                message: "Config setting updated successfully",
                data: updatedConfigSetting
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }
            next(error);
        }
    },

    async updateConfigSettingByKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;
            const updateData = req.body;

            // Remove key from updateData to prevent changing unique constraint
            const { key: keyUpdate, ...safeUpdateData } = updateData;

            const updatedConfigSetting = await prisma.configSetting.update({
                where: { key: key ? decodeURIComponent(key) : '' },
                data: safeUpdateData
            });

            return res.status(200).json({
                success: true,
                message: "Config setting updated successfully",
                data: updatedConfigSetting
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }
            next(error);
        }
    },

    async deleteConfigSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await prisma.configSetting.delete({
                where: { id }
            });

            return res.status(200).json({
                success: true,
                message: "Config setting deleted successfully"
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }
            next(error);
        }
    },

    async deleteConfigSettingByKey(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;

            await prisma.configSetting.delete({
                where: { key: key ? decodeURIComponent(key) : '' }
            });

            return res.status(200).json({
                success: true,
                message: "Config setting deleted successfully"
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Config setting not found"
                });
            }
            next(error);
        }
    },

    async bulkCreateConfigSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const { settings } = req.body;

            if (!Array.isArray(settings) || settings.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Settings array is required"
                });
            }

            // Validate each setting
            for (const setting of settings) {
                if (!setting.key || !setting.value) {
                    return res.status(400).json({
                        success: false,
                        message: "Each setting must have key and value"
                    });
                }
            }

            // Create settings with proper defaults
            const createdSettings = await prisma.$transaction(
                settings.map(setting =>
                    prisma.configSetting.create({
                        data: {
                            key: setting.key,
                            value: setting.value,
                            category: setting.category || 'general',
                            description: setting.description,
                            dataType: setting.dataType || 'string',
                            isPublic: setting.isPublic || false
                        }
                    })
                )
            );

            return res.status(201).json({
                success: true,
                message: `${createdSettings.length} config settings created successfully`,
                data: createdSettings
            });

        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    success: false,
                    message: "One or more config settings with these keys already exist"
                });
            }
            next(error);
        }
    },

    async getPublicConfigSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const publicSettings = await prisma.configSetting.findMany({
                where: { isPublic: true },
                orderBy: [
                    { category: 'asc' },
                    { key: 'asc' }
                ]
            });

            return res.status(200).json({
                success: true,
                data: publicSettings
            });

        } catch (error) {
            next(error);
        }
    },

    async getConfigSettingsByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const { category } = req.params;

            const categorySettings = await prisma.configSetting.findMany({
                where: { category },
                orderBy: { key: 'asc' }
            });

            return res.status(200).json({
                success: true,
                data: categorySettings
            });

        } catch (error) {
            next(error);
        }
    }

};