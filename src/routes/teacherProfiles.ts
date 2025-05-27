// src/routes/teacherProfiles.ts
import { Router } from 'express';
import { teacherProfileController } from '../controllers/teacherProfiles';

const router: Router = Router();

// Public routes
router.get('/', teacherProfileController.getAllTeacherProfiles);
router.get('/featured', teacherProfileController.getFeaturedTeachers);
router.get('/search', teacherProfileController.searchTeachers);
router.get('/:userId', teacherProfileController.getTeacherProfile);

// Protected routes (require authentication)
router.post('/', teacherProfileController.createTeacherProfile);
router.put('/:userId', teacherProfileController.updateTeacherProfile);
router.delete('/:userId', teacherProfileController.deleteTeacherProfile);

// Profile sections
router.get('/:userId/sections', teacherProfileController.getProfileSections);
router.post('/:userId/sections', teacherProfileController.createProfileSection);
router.put('/:userId/sections/:sectionId', teacherProfileController.updateProfileSection);
router.delete('/:userId/sections/:sectionId', teacherProfileController.deleteProfileSection);

// Education, Experience, Certifications
router.post('/:userId/education', teacherProfileController.addEducation);
router.put('/:userId/education/:educationId', teacherProfileController.updateEducation);
router.delete('/:userId/education/:educationId', teacherProfileController.deleteEducation);

router.post('/:userId/experience', teacherProfileController.addExperience);
router.put('/:userId/experience/:experienceId', teacherProfileController.updateExperience);
router.delete('/:userId/experience/:experienceId', teacherProfileController.deleteExperience);

router.post('/:userId/certifications', teacherProfileController.addCertification);
router.put('/:userId/certifications/:certificationId', teacherProfileController.updateCertification);
router.delete('/:userId/certifications/:certificationId', teacherProfileController.deleteCertification);

// Analytics
router.post('/:userId/view', teacherProfileController.recordProfileView);

export { router as teacherProfileRoutes };
