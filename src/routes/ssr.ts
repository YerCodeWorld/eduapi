// src/routes/ssr.ts - Fixed SSR routes with proper URL handling
import { Router, Request, Response } from 'express';
import { prisma } from '../../DbClient';

// HTML template function with immediate redirect
const generateHTML = (seoData: {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}) => {
    const {
        title,
        description,
        image = 'https://ieduguide.com/images/default-og.jpg',
        url,
        type = 'website',
        author,
        publishedTime,
        modifiedTime
    } = seoData;

    // Ensure clean description (no quotes or newlines that break meta tags)
    const cleanDescription = description
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const cleanTitle = title
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, ' ')
        .trim();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${cleanTitle}</title>
    <meta name="description" content="${cleanDescription}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="${type}">
    <meta property="og:site_name" content="EduGuiders">
    <meta property="og:locale" content="en_US">
    ${author ? `<meta property="article:author" content="${author}">` : ''}
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:site" content="@EduGuiders">
    
    <!-- Favicon -->
    <link rel="icon" type="image/jpeg" href="https://ieduguide.com/images/discussion.jpg">
    
    <!-- Immediate redirect for browsers -->
    <meta http-equiv="refresh" content="0; url=${url}">
    
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        p { color: #666; margin: 20px 0; }
        a {
            color: #A47BB9;
            text-decoration: none;
            font-weight: bold;
        }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>EduGuiders</h1>
        <p>Redirecting to: ${cleanTitle}</p>
        <p>If you're not redirected automatically, <a href="${url}">click here</a>.</p>
    </div>
    
    <script>
        // Immediate JavaScript redirect
        window.location.replace('${url}');
    </script>
</body>
</html>`;
};

// Create router factory
export function createSSRRouter() {
    const router: Router = Router();

    // Blog Post SSR
    router.get('/blog/:slug', async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;

            const post = await prisma.post.findUnique({
                where: { slug },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true
                        }
                    }
                }
            });

            if (!post || !post.published) {
                return res.status(404).send(generateHTML({
                    title: 'Post Not Found - EduGuiders',
                    description: 'The requested blog post could not be found.',
                    url: `https://ieduguide.com/blog/${slug}`
                }));
            }

            const cleanDescription = post.summary ||
                post.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...';

            // Handle base64 images - convert to default image for social sharing
            let imageUrl = post.coverImage || 'https://ieduguide.com/images/blog-og.jpg';
            if (imageUrl.startsWith('data:')) {
                // Social platforms don't support base64 images
                imageUrl = 'https://ieduguide.com/images/blog-og.jpg';
            }

            const html = generateHTML({
                title: `${post.title} - EduGuiders Blog`,
                description: cleanDescription,
                image: imageUrl,
                url: `https://ieduguide.com/blog/${slug}`,
                type: 'article',
                author: post.user?.name,
                publishedTime: new Date(post.createdAt).toISOString(),
                modifiedTime: new Date(post.updatedAt).toISOString()
            });

            res.set('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('SSR Blog Error:', error);
            res.status(500).send(generateHTML({
                title: 'Error - EduGuiders',
                description: 'An error occurred while loading this page.',
                url: `https://ieduguide.com/blog/${req.params.slug}`
            }));
        }
    });

    // Teaching Dynamic SSR
    router.get('/dynamics/:slug', async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;

            const dynamic = await prisma.dynamic.findUnique({
                where: { slug },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true
                        }
                    }
                }
            });

            if (!dynamic || !dynamic.published) {
                return res.status(404).send(generateHTML({
                    title: 'Dynamic Not Found - EduGuiders',
                    description: 'The requested teaching dynamic could not be found.',
                    url: `https://ieduguide.com/dynamics/${slug}`
                }));
            }

            const ageGroupFormatted = dynamic.ageGroup.replace('_', ' ').toLowerCase();
            const description = `${dynamic.description} Duration: ${dynamic.duration} minutes. Age group: ${ageGroupFormatted}. Difficulty: ${dynamic.difficulty.toLowerCase()}.`;

            const html = generateHTML({
                title: `${dynamic.title} - Teaching Dynamic`,
                description: description.slice(0, 160),
                image: 'https://ieduguide.com/images/dynamics-og.jpg',
                url: `https://ieduguide.com/dynamics/${slug}`,
                type: 'article',
                author: dynamic.user?.name,
                publishedTime: new Date(dynamic.createdAt).toISOString(),
                modifiedTime: new Date(dynamic.updatedAt).toISOString()
            });

            res.set('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('SSR Dynamic Error:', error);
            res.status(500).send(generateHTML({
                title: 'Error - EduGuiders',
                description: 'An error occurred while loading this page.',
                url: `https://ieduguide.com/dynamics/${req.params.slug}`
            }));
        }
    });

    // Teacher Profile SSR
    router.get('/teachers/:userId', async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            const profile = await prisma.teacherProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true
                        }
                    }
                }
            });

            if (!profile || !profile.isPublic) {
                return res.status(404).send(generateHTML({
                    title: 'Teacher Not Found - EduGuiders',
                    description: 'The requested teacher profile could not be found.',
                    url: `https://ieduguide.com/teachers/${userId}`
                }));
            }

            const teacherName = profile.displayName || profile.user?.name || 'Teacher';
            const specializations = profile.specializations?.length > 0
                ? profile.specializations.join(', ')
                : 'English instruction';
            const experience = profile.yearsExperience
                ? ` ${profile.yearsExperience} years of experience.`
                : '';
            const description = profile.bio ||
                `Professional English teacher specializing in ${specializations}.${experience}`;

            const html = generateHTML({
                title: `${teacherName} - English Teacher Profile`,
                description: description.slice(0, 160),
                image: profile.profileImage || profile.user?.picture || 'https://ieduguide.com/images/teacher-default.jpg',
                url: `https://ieduguide.com/teachers/${userId}`,
                type: 'profile'
            });

            res.set('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('SSR Teacher Error:', error);
            res.status(500).send(generateHTML({
                title: 'Error - EduGuiders',
                description: 'An error occurred while loading this page.',
                url: `https://ieduguide.com/teachers/${req.params.userId}`
            }));
        }
    });

    // Exercise SSR
    router.get('/exercises/:id', async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const exercise = await prisma.exercise.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            name: true,
                            picture: true
                        }
                    }
                }
            });

            if (!exercise || !exercise.isPublished) {
                return res.status(404).send(generateHTML({
                    title: 'Exercise Not Found - EduGuiders',
                    description: 'The requested exercise could not be found.',
                    url: `https://ieduguide.com/exercises/${id}`
                }));
            }

            const typeFormatted = exercise.type.replace('_', ' ').toLowerCase();
            const description = exercise.instructions ||
                `Practice English with this interactive ${typeFormatted} exercise. Difficulty: ${exercise.difficulty.toLowerCase()}.`;

            const html = generateHTML({
                title: `${exercise.title} - English Exercise`,
                description: description.slice(0, 160),
                image: 'https://ieduguide.com/images/exercise-og.jpg',
                url: `https://ieduguide.com/exercises/${id}`,
                type: 'article',
                author: exercise.user?.name
            });

            res.set('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error('SSR Exercise Error:', error);
            res.status(500).send(generateHTML({
                title: 'Error - EduGuiders',
                description: 'An error occurred while loading this page.',
                url: `https://ieduguide.com/exercises/${req.params.id}`
            }));
        }
    });

    // Home Page SSR
    router.get('/', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'EduGuiders - Find Your Perfect English Teacher Online',
            description: 'Connect with expert English teachers on EduGuiders. Access quality learning resources, interactive exercises, teaching dynamics, and achieve your educational goals with personalized guidance.',
            image: 'https://ieduguide.com/images/home-og.jpg',
            url: 'https://ieduguide.com',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    // Teachers Discovery Page SSR
    router.get('/teachers', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'Find English Teachers Online - Expert Tutors Available',
            description: 'Connect with professional English teachers and tutors. Browse profiles, compare specializations, and find the perfect instructor for your learning goals.',
            image: 'https://ieduguide.com/images/teachers-og.jpg',
            url: 'https://ieduguide.com/teachers',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    // Blog Index Page SSR
    router.get('/blog', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'EduBlog - Teacher Insights & Educational Articles',
            description: 'Read expert educational content from professional teachers. Discover teaching strategies, classroom management tips, and educational insights on the EduGuiders blog.',
            image: 'https://ieduguide.com/images/blog-og.jpg',
            url: 'https://ieduguide.com/blog',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    // Dynamics Index Page SSR
    router.get('/dynamics', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'Teaching Dynamics - Innovative Classroom Strategies',
            description: 'Discover innovative teaching strategies and classroom activities shared by expert educators. Find creative dynamics for all age groups and difficulty levels.',
            image: 'https://ieduguide.com/images/dynamics-og.jpg',
            url: 'https://ieduguide.com/dynamics',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    // Exercises Page SSR
    router.get('/exercises', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'English Learning Exercises - Interactive Games & Activities',
            description: 'Practice English with interactive exercises and games. Improve your grammar, vocabulary, reading, and writing skills with fun learning activities.',
            image: 'https://ieduguide.com/images/exercises-og.jpg',
            url: 'https://ieduguide.com/exercises',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    // Testimonies Page SSR
    router.get('/testimonies', async (req: Request, res: Response) => {
        const html = generateHTML({
            title: 'Student Testimonials - EduGuiders Success Stories',
            description: 'Read what students, parents, and teachers say about EduGuiders. Discover success stories and experiences from our educational community.',
            image: 'https://ieduguide.com/images/testimonies-og.jpg',
            url: 'https://ieduguide.com/testimonies',
            type: 'website'
        });

        res.set('Content-Type', 'text/html');
        res.send(html);
    });

    return router;
}

// Export for backward compatibility if needed
export const ssrRoutes = createSSRRouter();