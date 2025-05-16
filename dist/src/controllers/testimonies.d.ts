import { Request, Response, NextFunction } from "express";
export declare const testimonyController: {
    getAllTestimonies(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getFeaturedTestimonies(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getTestimonyByEmail(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createTestimony(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteTestimony(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=testimonies.d.ts.map