### Old DB schema 

```
generator Client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url      = env("VITE_DATABASE_URL")
}

model User {
// what does uuid() do? "Universally Unique Identifier."
id                 String                  @id @default(uuid())
role               UserRole                @default(STUDENT)
email              String                  @unique
name               String                  @unique 
country            String
picture            String? 
createdAt          DateTime                @default(now())

preferredColor     PageColors
preferredLanguage  Language
posts              Post[]                  @relation("UserPosts") 
testimonies        Testimony[]             @relation("UserTestimonies")
dynamics           Dynamic[]               @relation("UserDynamics")
exercises          Exercise[]              @relation("UserExercises")
packageCompletions UserPackageCompletion[]
gameSessions       UserGameSession[]

teacherProfile TeacherProfile?

@@map("users")
}

model Testimony {
id        String   @id @default(uuid())
content   String
createdAt DateTime @default(now())
rating    Int      @default(4)
title     String?
featured  Boolean  @default(false)

userEmail String
user      User     @relation("UserTestimonies", fields: [userEmail], references: [email], onDelete: Cascade)

@@map("testimonies")
}

model Post {
id         String   @id @default(uuid())
title      String
slug       String   @unique
summary    String
content    String   @db.Text
coverImage String?
featured   Boolean  @default(false)
published  Boolean  @default(false)
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt

authorEmail String
user        User   @relation("UserPosts", fields: [authorEmail], references: [email], onDelete: Cascade)

@@index([authorEmail])
@@index([featured])
@@index([published])
@@map("posts")
}

model ExtraPost {
id         String   @id @default(uuid())
title      String
slug       String
coverImage String?
createdAt  DateTime @default(now())

}

model Statistic {
id           Int @id @default(autoincrement())
countries    Int
satisfaction Int // this is a porcentage really
teachers     Int
students     Int
courses      Int
classes      Int

@@map("statistics")
}

model pageConfig {
id          Int        @id @default(autoincrement())
description String
address     String
phone       String
email       String
color       PageColors @default(LAVENDER)
language    Language   @default(SPANISH)

@@map("page_config")
}

enum PageColors {
LAVENDER
CORAL
TEAL
WARMPINK
BLUE
PURPLE
}

enum UserRole {
ADMIN
TEACHER
STUDENT
}

enum Language {
SPANISH
ENGLISH
}

enum DynamicType {
READING
CONVERSATION
TEACHING_STRATEGY
GRAMMAR
VOCABULARY
GAME
COMPETITION
GENERAL
}

enum DifficultyLevel {
BEGINNER
INTERMEDIATE
ADVANCED
}

enum AgeGroup {
KIDS // 5-12
TEENS // 13-17
ADULTS // 18+
ALL_AGES 
}

model Dynamic {
id              String  @id @default(uuid())
title           String
slug            String  @unique
objective       String 
description     String
content         String  @db.Text 
materialsNeeded String?

duration    Int // Duration in minutes
minStudents Int             @default(2)
maxStudents Int?            @default(40) // Optional max students
ageGroup    AgeGroup
difficulty  DifficultyLevel @default(INTERMEDIATE)
dynamicType DynamicType

// Publishing fields
published Boolean @default(false)
featured  Boolean @default(false)

// Timestamps
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
authorEmail String
user        User   @relation("UserDynamics", fields: [authorEmail], references: [email], onDelete: Cascade)

// Indexing for performance
@@index([authorEmail])
@@index([published])
@@index([featured])
@@index([dynamicType])
@@index([ageGroup])
@@index([difficulty])
@@map("dynamics")
}

// Add these models to your existing DbClient/prisma/schema.prisma

model TeacherProfile {
id     String @id @default(uuid())
userId String @unique
user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

// Basic Profile Info
displayName  String?
tagline      String?
bio          String? @db.Text
profileImage String?
coverImage   String?
introVideo   String?
introAudio   String?

// Theme & Customization
themeColor     String  @default("#A47BB9")
layoutStyle    String  @default("modern") // modern, minimal, creative
showCoverImage Boolean @default(true)
showIntroMedia Boolean @default(true)
profileEmoji   String?
personalQuote  String?

// Contact & Social
phoneNumber String?
whatsapp    String?
telegram    String?
instagram   String?
linkedin    String?
website     String?
timezone    String  @default("UTC")

// Teaching Info
yearsExperience   Int?
nativeLanguage    String?
teachingLanguages String[] // Array of languages they teach
specializations   String[] // Array of specializations
teachingStyle     String?  @db.Text
classroomRules    String?  @db.Text

// Availability (simple format)
availabilityTags String[] // ["weekdays", "evenings", "weekends", "mornings"]
hourlyRate       Decimal? @db.Decimal(10, 2)
currency         String   @default("USD")

// Profile Settings
isPublic           Boolean @default(true)
allowContactForm   Boolean @default(true)
showRates          Boolean @default(false)
showExperience     Boolean @default(true)
showEducation      Boolean @default(true)
showCertifications Boolean @default(true)

// Meta
profileViews Int      @default(0)
lastActive   DateTime @default(now())
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt

// Relations
education       TeacherEducation[]
experience      TeacherExperience[]
certifications  TeacherCertification[]
profileSections TeacherProfileSection[]

@@map("teacher_profiles")
}

model TeacherEducation {
id               String         @id @default(uuid())
teacherProfileId String
teacherProfile   TeacherProfile @relation(fields: [teacherProfileId], references: [id], onDelete: Cascade)

degree      String
institution String
field       String?
startYear   Int
endYear     Int?
isOngoing   Boolean @default(false)
description String?

createdAt DateTime @default(now())

@@map("teacher_education")
}

model TeacherExperience {
id               String         @id @default(uuid())
teacherProfileId String
teacherProfile   TeacherProfile @relation(fields: [teacherProfileId], references: [id], onDelete: Cascade)

title       String
company     String
location    String?
startDate   DateTime
endDate     DateTime?
isCurrent   Boolean   @default(false)
description String?   @db.Text

createdAt DateTime @default(now())

@@map("teacher_experience")
}

model TeacherCertification {
id               String         @id @default(uuid())
teacherProfileId String
teacherProfile   TeacherProfile @relation(fields: [teacherProfileId], references: [id], onDelete: Cascade)

name          String
issuer        String
issueDate     DateTime
expiryDate    DateTime?
credentialId  String?
credentialUrl String?
description   String?

createdAt DateTime @default(now())

@@map("teacher_certifications")
}

model TeacherProfileSection {
id               String         @id @default(uuid())
teacherProfileId String
teacherProfile   TeacherProfile @relation(fields: [teacherProfileId], references: [id], onDelete: Cascade)

sectionType String // 'bio', 'availability', 'cv', 'style', 'contact', 'resources'
title       String?
content     String? @db.Text
isVisible   Boolean @default(true)
sortOrder   Int     @default(0)
customData  Json? // For storing section-specific data

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@map("teacher_profile_sections")
}

// ----------------------------------------------------------------

model Exercise {
id             String             @id @default(uuid())
title          String
instructions   String?
type           ExerciseType
difficulty     ExerciseDifficulty @default(INTERMEDIATE)
category       ExerciseCategory   @default(GENERAL)
content        Json
hints          String[]
explanation    String?
tags           String[]
timesCompleted Int                @default(0)
isPublished    Boolean            @default(false)
createdAt      DateTime           @default(now())
updatedAt      DateTime           @updatedAt
packageId      String?
package        ExercisePackage?   @relation("PackageExercises", fields: [packageId], references: [id], onDelete: SetNull)

// ... rest of existing Exercise model ...

// Add package index

// Relations
authorEmail String
user        User   @relation("UserExercises", fields: [authorEmail], references: [email], onDelete: Cascade)

// Indexes
@@index([authorEmail])
@@index([type])
@@index([difficulty])
@@index([category])
@@index([packageId])
@@index([isPublished])
@@map("exercises")
}

enum ExerciseType {
FILL_BLANK
MATCHING
MULTIPLE_CHOICE
ORDERING
LETTER_SOUP
CROSSWORD

READING
TIMELINE_SORTING // Can be very interesting epending on implementation

TRUE_OR_FALSE
CANDY_CRUSH
}

enum ExerciseDifficulty {
BEGINNER
UPPER_BEGINNER
INTERMEDIATE
UPPER_INTERMEDIATE
ADVANCED
SUPER_ADVANCED
}

enum ExerciseCategory {
GRAMMAR
VOCABULARY
READING
WRITING
LISTENING
SPEAKING
CONVERSATION
GENERAL
}

// =============================================================================
// EXERCISE PACKAGES SYSTEM
// =============================================================================

model ExercisePackage {
id          String           @id @default(uuid())
title       String
slug        String           @unique
description String
image       String? // Package cover image
category    ExerciseCategory @default(GENERAL)

// SEO & Sharing
metaTitle       String?
metaDescription String?

// Package limits and structure
maxExercises Int @default(30) // Up to 30 exercises (5 per difficulty)

// Publishing
isPublished Boolean @default(false)
featured    Boolean @default(false)

// Timestamps
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations - NO authorEmail (only teachers can create, but no specific attribution)
exercises Exercise[] @relation("PackageExercises")

// Completion tracking
completions UserPackageCompletion[]

@@index([category])
@@index([isPublished])
@@index([featured])
@@index([slug])
@@map("exercise_packages")
}

// Track user progress on packages
model UserPackageCompletion {
id        String @id @default(uuid())
userId    String
packageId String

user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)
package ExercisePackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

// Completion tracking
completedExercises String[] // Array of exercise IDs (space-efficient slugs)
completionRate     Float    @default(0) // Percentage completed
lastActivityAt     DateTime @default(now())

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([userId, packageId])
@@index([userId])
@@index([packageId])
@@map("user_package_completions")
}

// =============================================================================
// GAMES SYSTEM
// =============================================================================

model Game {
id          String   @id @default(uuid())
title       String
slug        String   @unique
description String
image       String? // Game cover image
gameType    GameType

// Game configuration (JSON for flexibility)
config Json // Game-specific configuration

// SEO & Publishing
metaTitle       String?
metaDescription String?
isPublished     Boolean @default(false)
featured        Boolean @default(false)

// Timestamps
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
levels   GameLevel[]       @relation("GameLevels")
sessions UserGameSession[]

@@index([gameType])
@@index([isPublished])
@@index([featured])
@@index([slug])
@@map("games")
}

enum GameType {
WORD_SEARCH
CATCH_CORRECT_WORD
MEMORY_QUIZ
WORD_CRUSH
PUZZLE
}

model GameLevel {
id          String @id @default(uuid())
gameId      String
levelNumber Int
title       String

// Level configuration
config Json // Level-specific data (words, rules, difficulty settings)

// Difficulty progression
difficulty  Int @default(1) // 1-10 scale
unlockAfter Int @default(0) // Previous level number needed to unlock

// Rewards/Points
maxPoints Int  @default(100)
timeLimit Int? // Seconds, null for no limit

// Publishing
isPublished Boolean @default(false)

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
game     Game              @relation("GameLevels", fields: [gameId], references: [id], onDelete: Cascade)
sessions UserGameSession[]

@@unique([gameId, levelNumber])
@@index([gameId])
@@index([levelNumber])
@@map("game_levels")
}

model UserGameSession {
id      String  @id @default(uuid())
userId  String
gameId  String
levelId String?

// Session data
score       Int     @default(0)
completed   Boolean @default(false)
timeElapsed Int? // Seconds taken
attempts    Int     @default(1)

// Progress tracking
progress Json? // Game-specific progress data

startedAt   DateTime  @default(now())
completedAt DateTime?

// Relations
user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
game  Game       @relation(fields: [gameId], references: [id], onDelete: Cascade)
level GameLevel? @relation(fields: [levelId], references: [id], onDelete: SetNull)

@@index([userId])
@@index([gameId])
@@index([levelId])
@@map("user_game_sessions")
}
```