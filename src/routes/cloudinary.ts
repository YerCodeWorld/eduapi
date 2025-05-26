// src/routes/images.ts - New Cloudinary route
import { Router, Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Extend Request type to include file property from multer
interface MulterRequest extends Request {
    // @ts-ignore
    file?: multer.File;
}

const router: Router = Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file upload handling
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// GET /api/images - Fetch all images from Cloudinary
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { resources } = await cloudinary.search
            .expression('resource_type:image')
            .sort_by('created_at', 'desc')
            .max_results(100) // Limit results
            .execute();

        const images = resources.map((item: any) => ({
            id: item.public_id,
            url: item.secure_url,
            created_at: item.created_at,
            bytes: item.bytes,
            format: item.format,
            display_name: item.display_name || item.public_id.split('/').pop() || item.public_id,
            width: item.width,
            height: item.height
        }));

        return res.status(200).json({
            success: true,
            data: images
        });

    } catch (error) {
        console.error('Error fetching images from Cloudinary:', error);
        next(error);
    }
});

// POST /api/images - Upload image to Cloudinary
router.post('/', upload.single('file'), async (req: MulterRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file provided'
            });
        }

        // Generate a unique public_id
        const timestamp = Date.now();
        const originalName = req.file.originalname.split('.')[0];
        const publicId = `uploads/${originalName}_${timestamp}`;

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: 'image',
                    invalidate: true,
                    // Add transformations if needed
                    transformation: [
                        { quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(req.file!.buffer);
        });

        const uploadResult = result as any;

        if (uploadResult) {
            const imageData = {
                id: uploadResult.public_id,
                url: uploadResult.secure_url,
                created_at: uploadResult.created_at,
                bytes: uploadResult.bytes,
                format: uploadResult.format,
                display_name: uploadResult.display_name || uploadResult.public_id.split('/').pop() || uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height
            };

            return res.status(201).json({
                success: true,
                data: imageData,
                message: 'Image uploaded successfully'
            });
        }

    } catch (error) {
        console.error('Error uploading image:', error);
        next(error);
    }
});

// DELETE /api/images/:publicId - Delete image from Cloudinary
router.delete('/:publicId(*)', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { publicId } = req.params;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID is required'
            });
        }

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Image not found or already deleted'
            });
        }

    } catch (error) {
        console.error('Error deleting image:', error);
        next(error);
    }
});

export { router as imageRoutes };