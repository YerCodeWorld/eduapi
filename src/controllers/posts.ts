import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";

export const postsController = {

    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                title,
                slug,
                summary,
                content,
                coverImage,
                featured = false,
                published = true,
                authorEmail
            } = req.body;

            if (!title || !slug || !summary || !content || !authorEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            const user = await prisma.user.findUnique({ where: { email: authorEmail } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No user found to create post."
                })
            }

            const postExist = await prisma.post.findUnique({ where: { slug } });
            if (postExist) {
                return res.status(409).json({
                    success: false,
                    message: "A post with this slug already exists"
                });
            }

            const newPost = await prisma.post.create({
                data: {
                    title,
                    slug,
                    summary,
                    content,
                    coverImage,
                    featured,
                    published,
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
                data: newPost,
                message: "Post successfully created"
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllPosts(req: Request, res: Response, next: NextFunction) {
        try {
            // Watch out on how the query doesn't have anything to do with the actual model
            const {
                published,
                featured,
                limit = 10,
                page = 1,
                orderBy = 'ćreatedAt',
                order = 'desc'
            } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (published !== undefined)  {  // bool
                where.published = published === 'true';
            }
            if (featured !== undefined) {
                where.featured = featured === 'true';
            }

            const posts = await prisma.post.findMany({
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

            const totalCount = await prisma.post.count({ where });

            return res.status(200).json({
                success: true,
                data: posts,
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

    async getPostsByEmail(req: Request, res: Response, next: NextFunction) {},

    async updatePost(req: Request, res: Response, next: NextFunction) {},

    async deletePost(req: Request, res: Response, next: NextFunction) {},

}