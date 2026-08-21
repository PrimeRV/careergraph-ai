# CareerGraph AI

CareerGraph AI is a graph-powered career intelligence platform that helps students discover relevant job opportunities based on their current skills, understand skill gaps for target roles, explore career relationships, and track job applications.

The application models students, skills, jobs, companies, courses, and applications as connected graph entities using **CognoDB**, a managed graph database compatible with the official Neo4j driver and openCypher.

---

## 🌐 Live Demo

**Live Demo:** https://careergraph-ai-chi.vercel.app/

**GitHub Repository:** https://github.com/PrimeRV/careergraph-ai

---

# 📌 Table of Contents

- [Use Case](#use-case)
- [Why a Graph Database](#why-a-graph-database)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Graph Data Model](#graph-data-model)
- [Graph Diagram](#graph-diagram)
- [Project Structure](#project-structure)
- [CognoDB Setup](#cognodb-setup)
- [Environment Variables](#environment-variables)
- [Installation and Running Locally](#installation-and-running-locally)
- [Seed Data](#seed-data)
- [Main Cypher Queries](#main-cypher-queries)
- [API Routes](#api-routes)
- [Error Handling](#error-handling)
- [Screenshots](#screenshots)
- [Screen Recordings](#screen-recordings)

---

# Use Case

Students often face three connected career problems:

1. Which jobs match my current skills?
2. Which skills am I missing for the roles I want?
3. How can I track my applications and career progress?

CareerGraph AI solves these problems by representing career data as a connected graph.

A student is connected to their skills. Jobs are connected to the skills they require and the companies offering them. Students can also be connected to applications, while courses can help support skill development.

This allows the application to provide:

- Skill exploration
- Job discovery
- Career matching
- Skill-gap analysis
- Graph exploration
- Application tracking
- Application status management

---

# Why a Graph Database?

A career platform contains highly connected data.

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

In a relational database, exploring this information would require multiple joins across tables.

For example:

```text
Students
Skills
StudentSkills
Jobs
JobSkills
Companies
Applications
Courses
```

A graph database represents these relationships directly.

With CognoDB, CareerGraph AI can traverse connected data naturally:

```text
Student
   ↓
Skill
   ↓
Job
   ↓
Company
```

This makes graph traversal useful for:

- Finding jobs connected to a student's skills
- Comparing student skills with job requirements
- Identifying missing skills
- Exploring related companies and roles
- Visualizing career relationships

The main advantage is that the application is built around relationships, not just isolated records.

---

# Features

## Dashboard

Provides an overview of career information, including:

- Student skills
- Available jobs
- Career matches
- Skill gaps
- Application information

---

## Skills Explorer

Allows users to explore available skills and understand the skills connected to the career graph.

---

## Job Discovery

Displays available jobs with information such as:

- Job title
- Company
- Location
- Level
- Required skills

---

## Career Match

Compares a student's skills against the skills required for available jobs.

The application calculates a match score based on:

```text
Matched Skills
---------------- × 100
Required Skills
```

---

## Skill Gap Analysis

Identifies skills required for a selected job that the student does not currently have.

---

## Graph Explorer

Visualizes connected graph entities including:

- Student
- Skills
- Jobs
- Companies

The graph allows users to understand how career data is connected.

---

## Application Tracking

Students can track job applications and manage application status.

Example statuses include:

- Applied
- Interview
- Rejected
- Offer

---

## Settings

Provides application configuration and user preference functionality.

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- CSS

## Backend

- Next.js API Routes
- Node.js

## Database

- CognoDB Cloud
- Neo4j JavaScript Driver
- openCypher
- Bolt Protocol

## Deployment

- Vercel

---

# Graph Data Model

CareerGraph AI uses the following node labels:

```text
Student
Skill
Job
Company
Course
Application
```

Relationships include:

```text
(Student)-[:HAS_SKILL]->(Skill)

(Job)-[:REQUIRES]->(Skill)

(Job)-[:OFFERED_BY]->(Company)

(Course)-[:RECOMMENDS]->(Skill)

(Student)-[:APPLIED_FOR]->(Application)

(Application)-[:FOR_JOB]->(Job)
```

---

# Graph Diagram

```text
                    ┌──────────────┐
                    │   Student    │
                    └──────┬───────┘
                           │
                       HAS_SKILL
                           │
                           ▼
                    ┌──────────────┐
                    │    Skill     │
                    └──────▲───────┘
                           │
                        REQUIRES
                           │
                           │
                    ┌──────┴───────┐
                    │     Job      │
                    └──────┬───────┘
                           │
                       OFFERED_BY
                           │
                           ▼
                    ┌──────────────┐
                    │   Company    │
                    └──────────────┘


                    ┌──────────────┐
                    │    Course    │
                    └──────┬───────┘
                           │
                       RECOMMENDS
                           │
                           ▼
                         Skill


Student
   │
APPLIED_FOR
   │
   ▼
Application
   │
 FOR_JOB
   │
   ▼
  Job
```

---

# Project Structure

```text
careergraph-ai/
│
├── app/
│   ├── api/
│   │   ├── applications/
│   │   ├── career-match/
│   │   ├── dashboard/
│   │   ├── graph/
│   │   ├── health/
│   │   ├── jobs/
│   │   ├── settings/
│   │   ├── skill-gap/
│   │   └── skills/
│   │
│   ├── applications/
│   ├── career-match/
│   ├── graph/
│   ├── jobs/
│   ├── settings/
│   ├── skill-gap/
│   ├── skills/
│   │
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│
├── docs/
│   ├── recordings/
│   └── screenshots/
│
├── lib/
│   └── neo4j.ts
│
├── scripts/
│   └── seed.ts
│
├── .env.local
├── package.json
└── README.md
```

---

# CognoDB Setup

CareerGraph AI uses CognoDB Cloud as its graph database.

## 1. Create a CognoDB Account

Create an account on CognoDB Cloud:

https://console.cognodb.com/signup

---

## 2. Create a Database Instance

Create a free CognoDB instance.

The free tier provides a managed graph database instance suitable for this project.

After the instance is created, CognoDB provides:

- Bolt connection URI
- Username
- Password

The connection URI will look similar to:

```text
bolt+s://your-instance-id.databases.cognodb.cloud
```

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
COGNODB_URI=bolt+s://your-instance-id.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your-password
```

Important:

```text
Never commit .env.local or database credentials to GitHub.
```

---

# Environment Variables

The application reads database credentials from environment variables.

Example:

```env
COGNODB_URI=your_cognodb_bolt_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_password
```

The Neo4j JavaScript driver is configured in:

```text
lib/neo4j.ts
```

Example connection setup:

```ts
import neo4j from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("Missing CognoDB environment variables");
}

export const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);
```

---

# Installation and Running Locally

## 1. Clone the Repository

```bash
git clone https://github.com/PrimeRV/careergraph-ai.git
```

Move into the project directory:

```bash
cd careergraph-ai
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env.local
```

Add your CognoDB credentials:

```env
COGNODB_URI=your_bolt_uri
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=your_password
```

---

## 4. Seed the Database

Run:

```bash
npm run seed
```

The seed script is located at:

```text
scripts/seed.ts
```

It creates realistic graph data including:

- Students
- Skills
- Jobs
- Companies
- Courses
- Applications
- Graph relationships

---

## 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Seed Data

The project includes a seed script:

```text
scripts/seed.ts
```

The script creates graph nodes and relationships using Cypher.

Example entities include:

```text
Student
Skill
Job
Company
Course
Application
```

Example relationships:

```text
HAS_SKILL
REQUIRES
OFFERED_BY
RECOMMENDS
APPLIED_FOR
FOR_JOB
```

The seed data is realistic enough to demonstrate:

- Career matching
- Skill gap detection
- Job discovery
- Company connections
- Application tracking
- Multi-hop graph traversal

---

# Main Cypher Queries

## 1. Career Match

Career matching compares student skills with job requirements.

```cypher
MATCH (student:Student {id: $studentId})

MATCH (job:Job)-[:REQUIRES]->(requiredSkill:Skill)

OPTIONAL MATCH
  (student)-[:HAS_SKILL]->(matchedSkill:Skill)

WHERE matchedSkill.id = requiredSkill.id

WITH
  job,
  collect(DISTINCT requiredSkill) AS requiredSkills,
  collect(DISTINCT matchedSkill) AS matchedSkills

OPTIONAL MATCH (job)-[:OFFERED_BY]->(company:Company)

WITH
  job,
  company,
  requiredSkills,
  matchedSkills,
  CASE
    WHEN size(requiredSkills) = 0 THEN 0
    ELSE round(
      toFloat(size(matchedSkills)) /
      size(requiredSkills) * 100
    )
  END AS matchScore

RETURN
  job.id AS jobId,
  job.title AS jobTitle,
  company.name AS company,
  matchScore

ORDER BY matchScore DESC
```

This query:

1. Finds the student.
2. Finds skills required by each job.
3. Compares required skills with student skills.
4. Calculates a match percentage.
5. Returns jobs ordered by best match.

The query uses:

```text
$studentId
```

as a parameter through the official Neo4j JavaScript driver.

No string-concatenated Cypher is used.

---

## 2. Skill Gap Analysis

```cypher
MATCH (student:Student {id: $studentId})
MATCH (job:Job {id: $jobId})

MATCH (job)-[:REQUIRES]->(requiredSkill:Skill)

OPTIONAL MATCH
  (student)-[:HAS_SKILL]->(studentSkill:Skill)

WHERE studentSkill.id = requiredSkill.id

WITH
  requiredSkill,
  studentSkill

WHERE studentSkill IS NULL

RETURN
  requiredSkill.id AS skillId,
  requiredSkill.name AS skillName

ORDER BY requiredSkill.name
```

This query identifies skills required for a job that are not currently connected to the student.

---

## 3. Multi-Hop Graph Traversal

The Graph Explorer demonstrates a multi-hop traversal across the career graph.

```cypher
MATCH (student:Student {id: $studentId})

OPTIONAL MATCH
  (student)-[:HAS_SKILL]->(skill:Skill)

OPTIONAL MATCH
  (skill)-[:REQUIRES]-(job:Job)

OPTIONAL MATCH
  (job)-[:OFFERED_BY]->(company:Company)

RETURN
  student,
  skill,
  job,
  company
```

This traversal follows multiple connected relationships:

```text
Student
   ↓ HAS_SKILL
Skill
   ↓ REQUIRES
Job
   ↓ OFFERED_BY
Company
```

This is a multi-hop traversal of three connected graph relationships.

It demonstrates how graph databases make relationship exploration natural without manually constructing multiple relational joins.

---

## 4. Application Tracking

Applications are connected to students and jobs.

Example graph relationship:

```cypher
MATCH (student:Student {id: $studentId})
MATCH (job:Job {id: $jobId})

CREATE (student)-[:APPLIED_FOR]->(application:Application {
  id: $applicationId,
  status: $status
})

CREATE (application)-[:FOR_JOB]->(job)
```

This allows the application to track:

- Application status
- Related student
- Related job

---

# Parameterized Queries

All database queries use parameters through the official Neo4j JavaScript driver.

Example:

```ts
const result = await session.run(
  `
  MATCH (student:Student {id: $studentId})
  RETURN student
  `,
  { studentId }
);
```

This prevents unsafe string concatenation and keeps query inputs separated from Cypher logic.

---

# API Routes

The application includes the following API routes:

| Route | Purpose |
|---|---|
| `/api/dashboard` | Dashboard data |
| `/api/skills` | Skill exploration |
| `/api/jobs` | Job discovery |
| `/api/career-match` | Career matching |
| `/api/skill-gap` | Skill gap analysis |
| `/api/graph` | Graph exploration |
| `/api/applications` | Application tracking |
| `/api/settings` | Settings |
| `/api/health` | Database health check |

---

# Error Handling

Database operations are wrapped using:

```text
try
catch
finally
```

Example:

```ts
try {
  const result = await session.run(query, params);

  return NextResponse.json({
    success: true,
    data: result.records,
  });
} catch (error) {
  console.error("Database error:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Database operation failed",
    },
    { status: 500 }
  );
} finally {
  await session.close();
}
```

This ensures:

- Database errors do not crash the application unexpectedly.
- Users receive a readable error response.
- Database sessions are closed correctly.

---

# Screenshots

Application screenshots are available in:

```text
docs/screenshots/
```

The screenshots cover:

- Dashboard
- About
- Skills
- Jobs
- Career Match
- Skill Gap
- Graph Explorer
- Applications
- Settings

Example screenshot folders:

```text
docs/screenshots/dashboard/
docs/screenshots/about/
docs/screenshots/skills/
docs/screenshots/jobs/
docs/screenshots/career-match/
docs/screenshots/skill-gap/
docs/screenshots/graph_explorer/
docs/screenshots/application/
docs/screenshots/settings/
```

---

# Screen Recordings

Short screen recordings demonstrating the main application modules are included in:

```text
docs/recordings/
```

Recordings include:

- Dashboard
- About
- Skills
- Jobs
- Career Match
- Skill Gap
- Graph Explorer
- Applications
- Settings

---

# Deployment

The application is deployed on Vercel.

**Live Demo:**

https://careergraph-ai-chi.vercel.app/

---

# Assignment Requirements Checklist

| Requirement | Status |
|---|---|
| Graph database backed application | ✅ |
| CognoDB Cloud | ✅ |
| Official Neo4j driver | ✅ |
| openCypher queries | ✅ |
| Labeled nodes | ✅ |
| Typed relationships | ✅ |
| Realistic seed data | ✅ |
| Seed script included | ✅ |
| Parameterized queries | ✅ |
| Multi-hop traversal | ✅ |
| Functional web application | ✅ |
| Clean UI and navigation | ✅ |
| Loading states | ✅ |
| Error handling | ✅ |
| Environment variables | ✅ |
| Hosted demo | ✅ |
| Screenshots | ✅ |
| Screen recordings | ✅ |

---

# Submission

**GitHub Repository:**

https://github.com/PrimeRV/careergraph-ai

**Live Demo:**

https://careergraph-ai-chi.vercel.app/

---

## Author

**Rohit Verma**

CareerGraph AI was built as a graph database application using CognoDB, openCypher, Next.js, TypeScript, and the official Neo4j JavaScript driver.