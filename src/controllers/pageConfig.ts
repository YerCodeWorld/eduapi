import { Request, Response, NextFunction } from "express";
import { prisma, Language } from "../../DbClient";

export const pageConfigController = {

    async getPageConfig(req: Request, res: Response, next: NextFunction) {
        try {
            // PageConfig follows singleton pattern - only one record should exist
            const pageConfig = await prisma.pageConfig.findFirst({
                orderBy: { createdAt: 'desc' }
            });

            if (!pageConfig) {
                // Return default config if none exists
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: "No page configuration found. Please create one."
                });
            }

            return res.status(200).json({
                success: true,
                data: pageConfig
            });

        } catch (error) {
            next(error);
        }
    },

    async createPageConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                siteName,
                description,
                tagline,
                address,
                phone,
                email,
                whatsapp,
                telegram,
                supportEmail,
                facebook,
                instagram,
                linkedin,
                youtube,
                tiktok,
                instagramPosts,
                tiktokPosts,
                metaTitle,
                metaDescription,
                keywords,
                favicon,
                logo,
                logoAlt,
                enableRegistration,
                enableTeacherProfiles,
                enableExercisePackages,
                enableGames,
                enableTestimonials,
                enableBlog,
                maintenanceMode,
                welcomeMessage,
                footerText,
                privacyPolicyUrl,
                termsOfServiceUrl,
                aboutUsContent,
                defaultLanguage,
                supportedLanguages,
                googleAnalyticsId,
                facebookPixelId,
                hotjarId,
                supportEmailName,
                noReplyEmail,
                emailSignature,
                pointsPerExercise,
                pointsPerPackageComplete,
                maxApiRequestsPerHour,
                enablePublicApi,
                webhookSecret,
                maxImageSize,
                maxVideoSize,
                allowedImageTypes,
                allowedVideoTypes,
                version,
                updatedBy
            } = req.body;

            if (!description || !address || !phone || !email) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields missing: description, address, phone, email"
                });
            }

            // Check if config already exists (singleton pattern)
            const existingConfig = await prisma.pageConfig.findFirst();
            if (existingConfig) {
                return res.status(400).json({
                    success: false,
                    message: "Page configuration already exists. Use update endpoint instead."
                });
            }

            const pageConfig = await prisma.pageConfig.create({
                data: {
                    siteName: siteName || "EduGuiders",
                    description,
                    tagline,
                    address,
                    phone,
                    email,
                    whatsapp,
                    telegram,
                    supportEmail,
                    facebook,
                    instagram,
                    linkedin,
                    youtube,
                    tiktok,
                    instagramPosts: instagramPosts || [],
                    tiktokPosts: tiktokPosts || [],
                    metaTitle,
                    metaDescription,
                    keywords: keywords || [],
                    favicon,
                    logo,
                    logoAlt,
                    enableRegistration: enableRegistration ?? true,
                    enableTeacherProfiles: enableTeacherProfiles ?? true,
                    enableExercisePackages: enableExercisePackages ?? true,
                    enableGames: enableGames ?? true,
                    enableTestimonials: enableTestimonials ?? true,
                    enableBlog: enableBlog ?? true,
                    maintenanceMode: maintenanceMode ?? false,
                    welcomeMessage,
                    footerText,
                    privacyPolicyUrl,
                    termsOfServiceUrl,
                    aboutUsContent,
                    defaultLanguage: (defaultLanguage as Language) || 'ENGLISH',
                    supportedLanguages: supportedLanguages || ['ENGLISH', 'SPANISH'],
                    googleAnalyticsId,
                    facebookPixelId,
                    hotjarId,
                    supportEmailName: supportEmailName || "EduGuiders Support",
                    noReplyEmail,
                    emailSignature,
                    pointsPerExercise: pointsPerExercise || 10,
                    pointsPerPackageComplete: pointsPerPackageComplete || 100,
                    maxApiRequestsPerHour: maxApiRequestsPerHour || 1000,
                    enablePublicApi: enablePublicApi ?? false,
                    webhookSecret,
                    maxImageSize: maxImageSize || 5242880, // 5MB
                    maxVideoSize: maxVideoSize || 52428800, // 50MB
                    allowedImageTypes: allowedImageTypes || ["jpg", "jpeg", "png", "gif"],
                    allowedVideoTypes: allowedVideoTypes || ["mp4", "webm", "mov"],
                    version: version || "1.0.0",
                    updatedBy
                }
            });

            return res.status(201).json({
                success: true,
                message: "Page configuration created successfully",
                data: pageConfig
            });

        } catch (error) {
            next(error);
        }
    },

    async updatePageConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Update lastUpdated timestamp
            updateData.lastUpdated = new Date();

            const updatedConfig = await prisma.pageConfig.update({
                where: { id },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                message: "Page configuration updated successfully",
                data: updatedConfig
            });

        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: "Page configuration not found"
                });
            }
            next(error);
        }
    },

    async getPublicConfig(req: Request, res: Response, next: NextFunction) {
        try {
            // Return only public-safe configuration data
            const pageConfig = await prisma.pageConfig.findFirst({
                select: {
                    siteName: true,
                    description: true,
                    tagline: true,
                    address: true,
                    phone: true,
                    email: true,
                    whatsapp: true,
                    telegram: true,
                    supportEmail: true,
                    facebook: true,
                    instagram: true,
                    linkedin: true,
                    youtube: true,
                    tiktok: true,
                    instagramPosts: true,
                    tiktokPosts: true,
                    metaTitle: true,
                    metaDescription: true,
                    keywords: true,
                    favicon: true,
                    logo: true,
                    logoAlt: true,
                    enableRegistration: true,
                    enableTeacherProfiles: true,
                    enableExercisePackages: true,
                    enableGames: true,
                    enableTestimonials: true,
                    enableBlog: true,
                    maintenanceMode: true,
                    welcomeMessage: true,
                    footerText: true,
                    privacyPolicyUrl: true,
                    termsOfServiceUrl: true,
                    aboutUsContent: true,
                    defaultLanguage: true,
                    supportedLanguages: true,
                    supportEmailName: true,
                    pointsPerExercise: true,
                    pointsPerPackageComplete: true,
                    enablePublicApi: true,
                    maxImageSize: true,
                    maxVideoSize: true,
                    allowedImageTypes: true,
                    allowedVideoTypes: true,
                    version: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.status(200).json({
                success: true,
                data: pageConfig
            });

        } catch (error) {
            next(error);
        }
    },

    async resetToDefaults(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { updatedBy } = req.body;

            const defaultConfig = {
                siteName: "EduGuiders",
                enableRegistration: true,
                enableTeacherProfiles: true,
                enableExercisePackages: true,
                enableGames: true,
                enableTestimonials: true,
                enableBlog: true,
                maintenanceMode: false,
                defaultLanguage: Language.ENGLISH,
                supportedLanguages: [Language.ENGLISH, Language.SPANISH],
                supportEmailName: "EduGuiders Support",
                pointsPerExercise: 10,
                pointsPerPackageComplete: 100,
                maxApiRequestsPerHour: 1000,
                enablePublicApi: false,
                maxImageSize: 5242880,
                maxVideoSize: 52428800,
                allowedImageTypes: ["jpg", "jpeg", "png", "gif"],
                allowedVideoTypes: ["mp4", "webm", "mov"],
                version: "1.0.0",
                lastUpdated: new Date(),
                updatedBy: updatedBy || "system"
            };

            const resetConfig = await prisma.pageConfig.update({
                where: { id },
                data: defaultConfig
            });

            return res.status(200).json({
                success: true,
                message: "Page configuration reset to defaults",
                data: resetConfig
            });

        } catch (error) {
            next(error);
        }
    }

};