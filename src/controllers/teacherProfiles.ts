// src/controllers/teacherProfiles.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";

export const teacherProfileController = {

    async getAllTeacherProfiles(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                page = 1,
                limit = 12,
                sortBy = 'lastActive',
                order = 'desc',
                languages,
                specializations,
                availability
            } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {
                isPublic: true,
                user: {
                    role: 'TEACHER'
                }
            };

            if (languages) {
                where.teachingLanguages = {
                    hasSome: Array.isArray(languages) ? languages : [languages]
                };
            }

            if (specializations) {
                where.specializations = {
                    hasSome: Array.isArray(specializations) ? specializations : [specializations]
                };
            }

            if (availability) {
                where.availabilityTags = {
                    hasSome: Array.isArray(availability) ? availability : [availability]
                };
            }

            const profiles = await prisma.teacherProfile.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: {
                    [sortBy as string]: order
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true,
                            createdAt: true
                        }
                    },
                    education: {
                        orderBy: { startYear: 'desc' },
                        take: 2
                    },
                    certifications: {
                        orderBy: { issueDate: 'desc' },
                        take: 3
                    }
                }
            });

            const totalCount = await prisma.teacherProfile.count({ where });

            return res.status(200).json({
                success: true,
                data: profiles,
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

    async getFeaturedTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            const { limit = 6 } = req.query;

            const profiles = await prisma.teacherProfile.findMany({
                where: {
                    isPublic: true,
                    user: {
                        role: 'TEACHER'
                    }
                },
                take: Number(limit),
                orderBy: [
                    { profileViews: 'desc' },
                    { lastActive: 'desc' }
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    },

    async searchTeachers(req: Request, res: Response, next: NextFunction) {
        try {
            const { q, languages, specializations, availability } = req.query;

            const where: any = {
                isPublic: true,
                user: {
                    role: 'TEACHER'
                }
            };

            if (q) {
                where.OR = [
                    { displayName: { contains: q as string, mode: 'insensitive' } },
                    { tagline: { contains: q as string, mode: 'insensitive' } },
                    { bio: { contains: q as string, mode: 'insensitive' } },
                    { user: { name: { contains: q as string, mode: 'insensitive' } } }
                ];
            }

            if (languages) {
                where.teachingLanguages = {
                    hasSome: Array.isArray(languages) ? languages : [languages]
                };
            }

            if (specializations) {
                where.specializations = {
                    hasSome: Array.isArray(specializations) ? specializations : [specializations]
                };
            }

            if (availability) {
                where.availabilityTags = {
                    hasSome: Array.isArray(availability) ? availability : [availability]
                };
            }

            const profiles = await prisma.teacherProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                },
                orderBy: [
                    { profileViews: 'desc' },
                    { lastActive: 'desc' }
                ]
            });

            return res.status(200).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    },

    async getTeacherProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const profile = await prisma.teacherProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true,
                            createdAt: true,
                            posts: {
                                where: { published: true },
                                orderBy: { createdAt: 'desc' },
                                take: 5,
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    summary: true,
                                    coverImage: true,
                                    createdAt: true
                                }
                            }
                        }
                    },
                    education: {
                        orderBy: { startYear: 'desc' }
                    },
                    experience: {
                        orderBy: { startDate: 'desc' }
                    },
                    certifications: {
                        orderBy: { issueDate: 'desc' }
                    },
                    profileSections: {
                        where: { isVisible: true },
                        orderBy: { sortOrder: 'asc' }
                    }
                }
            });

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher profile not found"
                });
            }

            // Get dynamics by the teacher
            const dynamics = await prisma.dynamic.findMany({
                where: {
                    authorEmail: profile.user.email,
                    published: true
                },
                orderBy: { createdAt: 'desc' },
                take: 6,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    objective: true,
                    description: true,
                    duration: true,
                    ageGroup: true,
                    difficulty: true,
                    dynamicType: true,
                    createdAt: true
                }
            });

            return res.status(200).json({
                success: true,
                data: {
                    ...profile,
                    dynamics
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async createTeacherProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                userId,
                displayName,
                tagline,
                bio,
                profileImage,
                coverImage,
                themeColor,
                layoutStyle,
                phoneNumber,
                whatsapp,
                telegram,
                instagram,
                linkedin,
                website,
                timezone,
                yearsExperience,
                nativeLanguage,
                teachingLanguages,
                specializations,
                teachingStyle,
                classroomRules,
                availabilityTags,
                hourlyRate,
                currency
            } = req.body;

            // Check if user exists and is a teacher
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'TEACHER') {
                return res.status(400).json({
                    success: false,
                    message: "User not found or not a teacher"
                });
            }

            // Check if profile already exists
            const existingProfile = await prisma.teacherProfile.findUnique({
                where: { userId }
            });

            if (existingProfile) {
                return res.status(400).json({
                    success: false,
                    message: "Teacher profile already exists"
                });
            }

            const profile = await prisma.teacherProfile.create({
                data: {
                    userId,
                    displayName,
                    tagline,
                    bio,
                    profileImage,
                    coverImage,
                    themeColor,
                    layoutStyle,
                    phoneNumber,
                    whatsapp,
                    telegram,
                    instagram,
                    linkedin,
                    website,
                    timezone,
                    yearsExperience,
                    nativeLanguage,
                    teachingLanguages,
                    specializations,
                    teachingStyle,
                    classroomRules,
                    availabilityTags,
                    hourlyRate,
                    currency
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                data: profile,
                message: "Teacher profile created successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    async updateTeacherProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const updateData = req.body;

            const profile = await prisma.teacherProfile.update({
                where: { userId },
                data: {
                    ...updateData,
                    updatedAt: new Date()
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            picture: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: profile,
                message: "Teacher profile updated successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteTeacherProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            await prisma.teacherProfile.delete({
                where: { userId }
            });

            return res.status(200).json({
                success: true,
                message: "Teacher profile deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    },

    async recordProfileView(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            await prisma.teacherProfile.update({
                where: { userId },
                data: {
                    profileViews: {
                        increment: 1
                    },
                    lastActive: new Date()
                }
            });

            return res.status(200).json({
                success: true,
                message: "Profile view recorded"
            });
        } catch (error) {
            next(error);
        }
    },

    // Profile sections methods
    async getProfileSections(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const sections = await prisma.teacherProfileSection.findMany({
                where: { teacherProfileId: userId },
                orderBy: { sortOrder: 'asc' }
            });

            return res.status(200).json({
                success: true,
                data: sections
            });
        } catch (error) {
            next(error);
        }
    },

    async createProfileSection(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { sectionType, title, content, isVisible, sortOrder, customData } = req.body;

            if (!userId) return res.status(400).json({ success: false, data: "Could not find user" });

            const section = await prisma.teacherProfileSection.create({
                data: {
                    teacherProfileId: userId,
                    sectionType,
                    title,
                    content,
                    isVisible,
                    sortOrder,
                    customData
                }
            });

            return res.status(201).json({
                success: true,
                data: section
            });
        } catch (error) {
            next(error);
        }
    },

    async updateProfileSection(req: Request, res: Response, next: NextFunction) {
        try {
            const { sectionId } = req.params;
            const updateData = req.body;

            const section = await prisma.teacherProfileSection.update({
                where: { id: sectionId },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                data: section
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteProfileSection(req: Request, res: Response, next: NextFunction) {
        try {
            const { sectionId } = req.params;

            await prisma.teacherProfileSection.delete({
                where: { id: sectionId }
            });

            return res.status(200).json({
                success: true,
                message: "Profile section deleted"
            });
        } catch (error) {
            next(error);
        }
    },

    // Education methods
    async addEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { degree, institution, field, startYear, endYear, isOngoing, description } = req.body;

            if (!userId) return res.status(400).json({ success: false, data: "Could not find user" });

            const education = await prisma.teacherEducation.create({
                data: {
                    teacherProfileId: userId,
                    degree,
                    institution,
                    field,
                    startYear,
                    endYear,
                    isOngoing,
                    description
                }
            });

            return res.status(201).json({
                success: true,
                data: education
            });
        } catch (error) {
            next(error);
        }
    },

    async updateEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const { educationId } = req.params;
            const updateData = req.body;

            const education = await prisma.teacherEducation.update({
                where: { id: educationId },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                data: education
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteEducation(req: Request, res: Response, next: NextFunction) {
        try {
            const { educationId } = req.params;

            await prisma.teacherEducation.delete({
                where: { id: educationId }
            });

            return res.status(200).json({
                success: true,
                message: "Education deleted"
            });
        } catch (error) {
            next(error);
        }
    },

    // Experience methods (similar pattern)
    async addExperience(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { title, company, location, startDate, endDate, isCurrent, description } = req.body;

            if (!userId) return res.status(400).json({ success: false, data: "Could not find user" });

            const experience = await prisma.teacherExperience.create({
                data: {
                    teacherProfileId: userId,
                    title,
                    company,
                    location,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    isCurrent,
                    description
                }
            });

            return res.status(201).json({
                success: true,
                data: experience
            });
        } catch (error) {
            next(error);
        }
    },

    async updateExperience(req: Request, res: Response, next: NextFunction) {
        try {
            const { experienceId } = req.params;
            const updateData = req.body;

            if (updateData.startDate) {
                updateData.startDate = new Date(updateData.startDate);
            }
            if (updateData.endDate) {
                updateData.endDate = new Date(updateData.endDate);
            }

            const experience = await prisma.teacherExperience.update({
                where: { id: experienceId },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                data: experience
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteExperience(req: Request, res: Response, next: NextFunction) {
        try {
            const { experienceId } = req.params;

            await prisma.teacherExperience.delete({
                where: { id: experienceId }
            });

            return res.status(200).json({
                success: true,
                message: "Experience deleted"
            });
        } catch (error) {
            next(error);
        }
    },

    // Certification methods
    async addCertification(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, description } = req.body;

            if (!userId) return res.status(400).json({ success: false, data: "Could not find user" });

            const certification = await prisma.teacherCertification.create({
                data: {
                    teacherProfileId: userId,
                    name,
                    issuer,
                    issueDate: new Date(issueDate),
                    expiryDate: expiryDate ? new Date(expiryDate) : null,
                    credentialId,
                    credentialUrl,
                    description
                }
            });

            return res.status(201).json({
                success: true,
                data: certification
            });
        } catch (error) {
            next(error);
        }
    },

    async updateCertification(req: Request, res: Response, next: NextFunction) {
        try {
            const { certificationId } = req.params;
            const updateData = req.body;

            if (updateData.issueDate) {
                updateData.issueDate = new Date(updateData.issueDate);
            }
            if (updateData.expiryDate) {
                updateData.expiryDate = new Date(updateData.expiryDate);
            }

            const certification = await prisma.teacherCertification.update({
                where: { id: certificationId },
                data: updateData
            });

            return res.status(200).json({
                success: true,
                data: certification
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteCertification(req: Request, res: Response, next: NextFunction) {
        try {
            const { certificationId } = req.params;

            await prisma.teacherCertification.delete({
                where: { id: certificationId }
            });

            return res.status(200).json({
                success: true,
                message: "Certification deleted"
            });
        } catch (error) {
            next(error);
        }
    }
};