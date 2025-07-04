# Schema Migration Changes Documentation

This document outlines the major changes between the old and new database schema for the EduAPI project.

## 🔴 CRITICAL CHANGES - Immediate Action Required

### 1. **User Model Changes**
- **REMOVED**: `country` field from User model
  - **Impact**: Any frontend forms or API calls sending/expecting `country` field will fail
  - **Action**: Remove country field from all user registration forms and API requests
  - **Already Fixed**: User controller has been updated to remove country references

- **ADDED**: `exp` field (experience points) with default value of 0
  - **Impact**: New gamification feature available
  - **Action**: Update user profiles to display experience points if desired

### 2. **Testimony Model Changes**
- **REMOVED**: `title` field from Testimony model
  - **Impact**: Any testimonies display expecting a title will need adjustment
  - **Action**: Update frontend to not display/require testimony titles

## ⚠️ MAJOR REMOVALS - Features No Longer Available

### 3. **Complete Game System Removed**
The following models and enums have been completely removed:
- **Models Removed**:
  - `Game`
  - `GameLevel`
  - `UserGameSession`
- **Enum Removed**:
  - `GameType` (WORD_SEARCH, CATCH_CORRECT_WORD, MEMORY_QUIZ, WORD_CRUSH, PUZZLE)
- **Impact**: All game-related features are no longer available
- **Action**: Remove all game-related UI components and routes from frontend

### 4. **Other Removed Models**
- **`ExtraPost`** model removed entirely
- **`Statistic`** model removed entirely
  - **Impact**: Statistics tracking (countries, satisfaction, teachers, students, courses, classes) no longer available via this model
  - **Action**: Implement alternative analytics if needed

## 🔄 SIGNIFICANT CHANGES

### 5. **PageConfig Model - Major Overhaul**
The `pageConfig` model has been completely redesigned from a simple configuration to a comprehensive site settings model:

**Old pageConfig fields**:
```
- id, description, address, phone, email
- color (PageColors enum)
- language (Language enum)
```

**New PageConfig fields** (now PascalCase `PageConfig`):
```
- All old fields retained (except color/language renamed)
- Added 40+ new configuration fields including:
  - Social media links and embeds
  - SEO settings
  - Feature toggles
  - Email configuration
  - File upload limits
  - API settings
  - Localization support
  - Analytics integration
```

**Action Required**: Frontend needs major updates to handle new configuration options

### 6. **Exercise Model Changes**
- **New ExerciseType values**:
  - Added: `CATEGORIZER`, `SELECTOR`, `READING`, `CONVERSATION`, `PUZZLE`
  - Removed: `LETTER_SOUP`, `CROSSWORD`, `TIMELINE_SORTING`, `TRUE_OR_FALSE`, `CANDY_CRUSH`
- **Action**: Update exercise type selectors and handlers for new types

### 7. **New ConfigSetting Model**
- Provides flexible key-value configuration storage
- **Fields**: id, key (unique), value, category, description, dataType, isPublic
- **Purpose**: Store additional settings without schema changes

### 8. **New PackageDifficultyBox Model**
- Links exercise packages with difficulty levels
- **Fields**: packageId, difficulty, title, article
- **Purpose**: Provide difficulty-specific content for exercise packages

### 9. **ExercisePackage Model Changes**
- **ADDED**: `article` field (Text) for rich content
- **ADDED**: Relationship to `PackageDifficultyBox`

## ✅ NO ACTION REQUIRED - Backward Compatible

### 10. **Models Unchanged**
The following models remain unchanged:
- `Post`
- `Dynamic`
- `TeacherProfile` and related models
- `TeacherEducation`
- `TeacherExperience`
- `TeacherCertification`
- `TeacherProfileSection`
- `UserPackageCompletion`

### 11. **Enums Unchanged**
- `PageColors`
- `UserRole`
- `Language`
- `DynamicType`
- `DifficultyLevel`
- `AgeGroup`
- `ExerciseDifficulty`
- `ExerciseCategory`

## 📋 Frontend Checklist

Based on these changes, your frontend needs to:

1. **User Management**
   - [ ] Remove `country` field from registration/profile forms
   - [ ] Add experience points display to user profiles (optional)

2. **Testimonies**
   - [ ] Remove title field from testimony forms and displays

3. **Games Section**
   - [ ] Remove entire games section/routes
   - [ ] Remove game-related navigation items
   - [ ] Clean up any game session tracking

4. **Page Configuration**
   - [ ] Update admin panel to handle new PageConfig fields
   - [ ] Implement feature toggle checks throughout the app
   - [ ] Add social media configuration UI

5. **Exercises**
   - [ ] Update exercise type selectors for new types
   - [ ] Remove UI for deleted exercise types
   - [ ] Implement handlers for new exercise types

6. **Package Difficulty Boxes**
   - [ ] Add UI to display difficulty-specific content for packages
   - [ ] Update package detail pages to show difficulty boxes

## 🚀 Migration Steps

1. **Database Migration**: Run Prisma migration to update schema
2. **API Updates**: All controller updates have been completed
3. **Frontend Updates**: Use this checklist to update all affected components
4. **Testing**: Thoroughly test all affected features

## 💡 Recommendations

1. **Statistics Alternative**: Since the `Statistic` model was removed, consider implementing analytics through:
   - External analytics services
   - Computed values from existing data
   - New dashboard queries

2. **Game System Alternative**: If games are still desired:
   - Consider implementing as a separate microservice
   - Use external game engines
   - Simplify to exercise-based gamification

3. **Configuration Management**: Leverage the new `ConfigSetting` model for:
   - Feature flags
   - Dynamic settings
   - A/B testing configurations

---

**Document Generated**: ${new Date().toISOString()}
**Status**: Schema migration ready, controllers updated, frontend updates pending