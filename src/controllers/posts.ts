import { Request, Response, NextFunction } from "express";
import { prisma } from "../../DbClient";
import {resolveObjectURL} from "node:buffer";

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
                authorEmail,
                categoryIds = []
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
                    authorEmail,
                    categoryIds
                }
            })

        }
    },

    async getAllPosts(req: Request, res: Response, next: NextFunction) {},

    async getPostsByEmail(req: Request, res: Response, next: NextFunction) {},

    async updatePost(req: Request, res: Response, next: NextFunction) {},

    async deletePost(req: Request, res: Response, next: NextFunction) {},

}