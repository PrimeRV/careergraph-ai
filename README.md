# CareerGraph AI

CareerGraph AI is a graph-powered career intelligence platform that helps students discover relevant job opportunities based on their skills, understand skill gaps, explore career relationships, and track job applications.

The application models students, skills, jobs, companies, courses, and applications as connected graph entities using CognoDB / Neo4j-compatible graph database technology.

---

## 1. Use Case

Students often have difficulty answering three connected questions:

1. Which jobs are a good match for my current skills?
2. Which skills am I missing for the roles I want?
3. How can I track my applications and career progress?

CareerGraph AI addresses these problems by representing career information as a connected graph.

A student's skills are connected to the skills required by jobs. Jobs are connected to companies, while students are also connected to their applications and learning courses.

The platform provides:

- Skill exploration
- Job discovery
- Career matching
- Skill-gap analysis
- Graph exploration
- Application tracking
- Application status management
- User settings and preferences
- Notifications

---

## 2. Why a Graph Database?

A career platform contains many relationships between different types of entities.

For example:

```text
Student
   |
   | HAS_SKILL
   v
 Skill
   ^
   | REQUIRES
   |
  Job
   |
   | OFFERED_BY
   v
Company
```

A relational implementation could represent these relationships using multiple tables and joins. A graph database represents the entities and their relationships directly as nodes and edges.

This is particularly useful for CareerGraph AI because the main application logic depends on traversing relationships such as:

```text
Student
  → HAS_SKILL
Skill
  ← REQUIRES
Job
  → OFFERED_BY
Company
```

This connected structure is used to calculate career matches, identify skill gaps, explore relationships in the graph, and retrieve application information.

---

## 3. Data Model

### Main Nodes

- `Student`
- `Skill`
- `Job`
- `Company`
- `Course`

### Main Relationships

```text
Student -[:HAS_SKILL]-> Skill
Job -[:REQUIRES]-> Skill
Job -[:OFFERED_BY]-> Company
Skill -[:RELATED_TO]-> Skill
Course -[:TEACHES]-> Skill
Student -[:STUDIED]-> Course
Student -[:APPLIED_TO]-> Job
```

### Simplified Graph

```text
                         ┌──────────────┐
                         │   Company    │
                         └──────▲───────┘
                                │
                           OFFERED_BY
                                │
┌──────────┐              ┌─────┴─────┐
│ Student  │──APPLIED_TO─▶│    Job    │
└────┬─────┘              └─────┬─────┘
     │                           │
 HAS_SKILL                   REQUIRES
     │                           │
     ▼                           ▼
┌──────────┐              ┌──────────┐
│  Skill   │◀─RELATED_TO─▶│  Skill   │
└────┬─────┘              └──────────┘
     ▲
     │
  TEACHES
     │
┌────┴─────┐
│  Course  │
└──────────┘
```

The graph structure allows the application to traverse career-related relationships rather than treating each entity as an isolated record.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / React |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Database | CognoDB / Neo4j-compatible graph database |
| Query Language | Cypher |
| Runtime | Node.js |
| Hosting | Vercel |

---

## 5. Project Structure

```text
careergraph-ai/
│
├── app/
│   ├── api/
│   ├── components/
│   ├── applications/
│   ├── career-match/
│   ├── graph/
│   ├── jobs/
│   ├── settings/
│   ├── skill-gap/
│   ├── skills/
│   └── page.tsx
│
├── components/
│
├── docs/
│   ├── recordings/
│   └── screenshots/
│
├── scripts/
│
├── README.md
├── package.json
└── .env.local
```

> `.env.local` contains database credentials and must never be committed to GitHub.

---

## 6. Prerequisites

Before running the application locally, install:

- Node.js
- npm
- Git
- A CognoDB Cloud instance

---

## 7. Installation

Clone the repository:

```bash
git clone https://github.com/PrimeRV/careergraph-ai.git
cd careergraph-ai
```

Install dependencies:

```bash
npm install
```

---

## 8. CognoDB Setup

CareerGraph AI uses CognoDB as its graph database.

Create a CognoDB Cloud instance and obtain the database connection credentials.

Configure the application using:

```env
COGNODB_URI=your_cognodb_uri
COGNODB_USERNAME=your_username
COGNODB_PASSWORD=your_password
```

Create a local `.env.local` file in the project root and add the credentials.

Example:

```env
COGNODB_URI=...
COGNODB_USERNAME=...
COGNODB_PASSWORD=...
```

### Important

Do not commit `.env.local` to GitHub.

The application reads these credentials from the environment and uses them to create the Neo4j-compatible database driver connection.

---

## 9. Data Loading / Seed

The repository includes seed/data-loading logic for creating the CareerGraph AI dataset.

The seed process creates:

- Students
- Skills
- Companies
- Jobs
- Courses
- `HAS_SKILL` relationships
- `REQUIRES` relationships
- `OFFERED_BY` relationships
- `RELATED_TO` relationships
- `TEACHES` relationships
- `STUDIED` relationships
- `APPLIED_TO` relationships

The seed process also verifies the resulting graph by reporting node and relationship counts.

Run the seed using the seed command configured in `package.json`.

If the project exposes the standard seed script, run:

```bash
npm run seed
```

After seeding, verify that the graph contains the expected nodes and relationships before starting the application.

---

## 10. Running the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The main application workflow is:

```text
Dashboard
   ↓
Skills / Jobs
   ↓
Career Match
   ↓
Skill Gap
   ↓
Applications
   ↓
Graph Explorer
```

---

## 11. Main Cypher Queries

### 11.1 Retrieve Student Skills

This query retrieves the skills connected to a student.

```cypher
MATCH (student:Student {id: $studentId})
      -[:HAS_SKILL]->
      (skill:Skill)

RETURN
    skill.id AS id,
    skill.name AS name,
    skill.category AS category

ORDER BY skill.name
```

**Purpose:** Used to display the student's current skill profile.

### 11.2 Retrieve Applied Jobs

```cypher
MATCH (student:Student {id: $studentId})
      -[application:APPLIED_TO]->
      (job:Job)

OPTIONAL MATCH
    (job)-[:OFFERED_BY]->(company:Company)

RETURN
    job.id AS jobId,
    job.title AS jobTitle,
    company.name AS company,
    application.status AS status,
    application.appliedAt AS appliedAt

ORDER BY job.title
```

**Purpose:** Used by the Applications module to display application history and status.

### 11.3 Career Match

Career matching compares a student's existing skills with the skills required by jobs.

```cypher
MATCH (student:Student {id: $studentId})
MATCH (job:Job)-[:REQUIRES]->(requiredSkill:Skill)

WITH
    student,
    job,
    collect(DISTINCT requiredSkill) AS requiredSkills

UNWIND requiredSkills AS requiredSkill

OPTIONAL MATCH
    (student)-[:HAS_SKILL]->(studentSkill:Skill)

WHERE studentSkill.id = requiredSkill.id

WITH
    job,
    requiredSkills,
    count(DISTINCT studentSkill) AS matchingSkills

OPTIONAL MATCH
    (job)-[:OFFERED_BY]->(company:Company)

WITH
    job,
    company,
    size(requiredSkills) AS totalRequiredSkills,
    matchingSkills

WITH
    job,
    company,
    totalRequiredSkills,
    matchingSkills,
    CASE
      WHEN totalRequiredSkills = 0 THEN 0
      ELSE round(
        toFloat(matchingSkills) /
        totalRequiredSkills * 100
      )
    END AS matchScore

RETURN
    job.id AS jobId,
    job.title AS jobTitle,
    job.level AS level,
    job.location AS location,
    company.name AS company,
    matchScore,
    totalRequiredSkills,
    matchingSkills

ORDER BY matchScore DESC, job.title
LIMIT 5
```

**Purpose:** Calculates a percentage-based match score using the number of required skills already possessed by the student.

### 11.4 Skill Gap

```cypher
MATCH (student:Student {id: $studentId})
MATCH (job:Job)-[:REQUIRES]->(requiredSkill:Skill)

OPTIONAL MATCH
    (student)-[:HAS_SKILL]->(studentSkill:Skill)

WHERE studentSkill.id = requiredSkill.id

WITH
    requiredSkill,
    count(studentSkill) AS studentHasSkill

WHERE studentHasSkill = 0

RETURN DISTINCT
    requiredSkill.id AS skillId,
    requiredSkill.name AS skillName,
    requiredSkill.category AS category

ORDER BY requiredSkill.name
```

**Purpose:** Identifies skills required by jobs that the student does not currently have.

### 11.5 Update Application Status

Application status is stored as a property on the `APPLIED_TO` relationship.

For example:

```cypher
MATCH (student:Student {id: "student-001"})
      -[application:APPLIED_TO]->
      (job:Job {title: "Data Engineer"})

SET application.status = "Shortlisted"

RETURN
    student.name AS student,
    job.title AS job,
    application.status AS status,
    application.appliedAt AS appliedAt
```

This persists application status in the graph database rather than keeping it only in frontend state.

---

## 12. Application Modules

### Dashboard

Provides an overview of current skills, career matches, skill gaps, applied jobs, recommendations, and global search.

### Skills

Displays the student's current skills and their categories.

### Jobs

Displays available job opportunities and relevant company/job information.

### Career Match

Ranks jobs based on how closely their required skills match the student's existing skills.

### Skill Gap

Shows missing skills identified from job requirements.

### Graph Explorer

Provides a visual exploration of the connected career graph.

### Applications

Displays applied jobs and their current application statuses. Application status is persisted through the `APPLIED_TO` relationship.

### Settings

Provides user preferences and application settings.

### Notifications

Provides career and application-related notification information through the application UI.

### About

Explains the CareerGraph AI use case and the reason for using a graph database.

---

## 13. Screenshots

UI screenshots are stored in:

```text
docs/screenshots/
```

They cover:

- Dashboard
- Skills
- Jobs
- Career Match
- Skill Gap
- Graph Explorer
- Applications
- Settings
- About

---

## 14. Screen Recordings

Module-wise screen recordings are stored in:

```text
docs/recordings/
```

Current recordings include:

- `Dashboard.mp4`
- `skills.mp4`
- `Jobs.mp4`
- `Career_Match.mp4`
- `Skill_gap.mp4`
- `Graph_explorer.mp4`
- `Applications.mp4`
- `Settings.mp4`
- `About.mp4`

These recordings provide a walkthrough of the application's main functionality.

---

## 15. Hosted Demo

**Live Demo:** `ADD_YOUR_HOSTED_DEMO_URL_HERE`

The hosted application provides an end-to-end demonstration of CareerGraph AI using the configured graph database.

---

## 16. Demo Flow

A reviewer can explore the application in this order:

```text
Dashboard
   ↓
Skills / Jobs
   ↓
Career Match
   ↓
Skill Gap
   ↓
Graph Explorer
   ↓
Applications
   ↓
Settings
   ↓
About
```

---

## 17. Example End-to-End Workflow

1. A student has a set of existing skills.
2. Jobs define the skills they require.
3. Career Match compares the student's skills with job requirements.
4. The application calculates a match score.
5. Skill Gap identifies missing skills.
6. The student explores related skills and career information.
7. The student applies to jobs.
8. Application status is stored on the `APPLIED_TO` relationship.
9. The student can update application progress, for example from `Applied` to `Shortlisted`.

---

## 18. Data Model Summary

| Entity | Relationship | Purpose |
|---|---|---|
| Student | `HAS_SKILL` | Student skill profile |
| Student | `APPLIED_TO` | Application tracking |
| Student | `STUDIED` | Learning history |
| Skill | `RELATED_TO` | Skill relationships |
| Job | `REQUIRES` | Job requirements |
| Job | `OFFERED_BY` | Company association |
| Course | `TEACHES` | Learning-to-skill relationship |
| Company | — | Employer information |

---

## 19. Environment Variables

Required environment variables:

```env
COGNODB_URI=
COGNODB_USERNAME=
COGNODB_PASSWORD=
```

For local development, store these in:

```text
.env.local
```

For deployment, configure the same variables in the hosting provider's environment-variable settings.

Never expose database credentials in source code, screenshots, README files, or client-side code.

---

## 20. Error Handling

The application APIs return structured success/error responses and use HTTP status codes for failed requests.

For example:

```json
{
  "success": false,
  "message": "Failed to load dashboard data"
}
```

The frontend also provides loading, empty, and error states where applicable.

---

## 21. Future Improvements

Possible future improvements include:

- Authentication and multi-user support
- Resume parsing
- Real-time job ingestion
- More advanced job recommendation algorithms
- Personalized learning recommendations
- Application reminders
- More detailed graph analytics
- Expanded notification persistence
- Additional career-path recommendations

---

## 22. Conclusion

CareerGraph AI demonstrates how a graph database can model and analyse relationships between students, skills, jobs, companies, courses, and applications.

Instead of treating these entities as isolated records, the application uses their relationships to generate career matches, identify skill gaps, explore career paths, and track application progress.

The project demonstrates an end-to-end graph-powered career intelligence workflow using Next.js, React, Cypher, and CognoDB.

---

## Submission

**Repository:**
https://github.com/PrimeRV/careergraph-ai

**Hosted Demo:**
https://careergraph-ai-chi.vercel.app/

**Screenshots:**
`docs/screenshots/`

**Screen Recordings:**
`docs/recordings/`
