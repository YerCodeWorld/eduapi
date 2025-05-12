import { Request, Response, NextFunction } from "express";
export declare const postsController: {
    createPost(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getAllPosts(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPostsByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    updatePost(req: Request, res: Response, next: NextFunction): Promise<void>;
    deletePost(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=posts.d.ts.map