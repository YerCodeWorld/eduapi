"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsController = void 0;
const DbClient_1 = require("../../DbClient");
exports.postsController = {
    async createPost(req, res, next) {
        try {
            const { title, slug, summary, content, coverImage, featured = false, published = true, authorEmail } = req.body;
            if (!title || !slug || !summary || !content || !authorEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }
            const user = await DbClient_1.prisma.user.findUnique({ where: { email: authorEmail } });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No user found to create post."
                });
            }
            const postExist = await DbClient_1.prisma.post.findUnique({ where: { slug } });
            if (postExist) {
                return res.status(409).json({
                    success: false,
                    message: "A post with this slug already exists"
                });
            }
            const newPost = await DbClient_1.prisma.post.create({
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
        }
        catch (error) {
            next(error);
        }
    },
    async getAllPosts(req, res, next) {
        try {
            // Watch out on how the query doesn't have anything to do with the actual model
            const { published, featured, limit = 10, page = 1, orderBy = 'createdAt', order = 'desc' } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            if (published !== undefined) { // bool
                where.published = published === 'true';
            }
            if (featured !== undefined) {
                where.featured = featured === 'true';
            }
            const posts = await DbClient_1.prisma.post.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: {
                    [orderBy]: order,
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
            const totalCount = await DbClient_1.prisma.post.count({ where });
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
        }
        catch (error) {
            next(error);
        }
    },
    async getPostsByEmail(req, res, next) { },
    async updatePost(req, res, next) { },
    async deletePost(req, res, next) { },
};
//# sourceMappingURL=posts.js.map