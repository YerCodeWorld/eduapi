// src/routes/ssr.ts - New SSR routes for your Express API
import { Router, Request, Response } from 'express';
import { prisma } from '../../DbClient';

const router: Router = Router();

// HTML template function
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

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="EduGuiders">
  ${author ? `<meta property="article:author" content="${author}">` : ''}
  ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
  ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/jpeg" href="/images/discussion.jpg">
  
  <!-- Redirect to SPA -->
  <script>
    // Redirect to your Vite app for actual user interaction
    if (typeof window !== 'undefined') {
      window.location.href = '${url}';
    }
  </script>
  
  <!-- No-script fallback -->
  <noscript>
    <meta http-equiv="refresh" content="0; url=${url}">
  </noscript>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>${title}</h1>
    <p>${description}</p>
    <p>If you're not redirected automatically, <a href="${url}">click here</a>.</p>
  </div>
</body>
</html>`;
};

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

        const html = generateHTML({
            title: `${post.title} - EduGuiders Blog`,
            description: cleanDescription,
            image: post.coverImage || 'https://ieduguide.com/images/default-blog.jpg',
            url: `https://ieduguide.com/blog/${slug}`,
            type: 'article',
            author: post.user?.name,
            publishedTime: post.createdAt.toString(),
            modifiedTime: post.updatedAt.toString()
        });

        res.send(html);
    } catch (error) {
        console.error('SSR Blog Error:', error);
        res.status(500).send('Server Error');
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

        const html = generateHTML({
            title: `${dynamic.title} - Teaching Dynamic`,
            description: `${dynamic.description} Duration: ${dynamic.duration} minutes. Age group: ${dynamic.ageGroup}. Difficulty: ${dynamic.difficulty}.`,
            image: 'https://ieduguide.com/images/dynamics-og.jpg',
            url: `https://ieduguide.com/dynamics/${slug}`,
            type: 'article',
            author: dynamic.user?.name,
            publishedTime: dynamic.createdAt.toString(),
            modifiedTime: dynamic.updatedAt.toString()
        });

        res.send(html);
    } catch (error) {
        console.error('SSR Dynamic Error:', error);
        res.status(500).send('Server Error');
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
        const description = profile.bio ||
            `Professional English teacher specializing in ${profile.specializations?.join(', ') || 'English instruction'}. ${profile.yearsExperience ? `${profile.yearsExperience} years of experience.` : ''}`;

        const html = generateHTML({
            title: `${teacherName} - English Teacher Profile`,
            description: description.slice(0, 160),
            image: profile.profileImage || profile.user?.picture || 'https://ieduguide.com/images/teacher-default.jpg',
            url: `https://ieduguide.com/teachers/${userId}`,
            type: 'profile'
        });

        res.send(html);
    } catch (error) {
        console.error('SSR Teacher Error:', error);
        res.status(500).send('Server Error');
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

        const html = generateHTML({
            title: `${exercise.title} - English Exercise`,
            description: `${exercise.instructions || 'Practice English with this interactive exercise.'} Type: ${exercise.type}. Difficulty: ${exercise.difficulty}.`,
            image: 'https://ieduguide.com/images/exercise-og.jpg',
            url: `https://ieduguide.com/exercises/${id}`,
            type: 'article',
            author: exercise.user?.name
        });

        res.send(html);
    } catch (error) {
        console.error('SSR Exercise Error:', error);
        res.status(500).send('Server Error');
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

    res.send(html);
});

export { router as ssrRoutes };