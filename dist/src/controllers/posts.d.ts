import { Request, Response, NextFunction } from "express";
export declare const postsController: {
    createPost(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPostsBySlug(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPostByEmail(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAllPosts(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updatePost(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deletePost(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=posts.d.ts.map