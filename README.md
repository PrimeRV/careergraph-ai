# CareerGraph AI

CareerGraph AI is a graph-powered career intelligence platform that helps students discover relevant job opportunities based on their skills, understand skill gaps, and track their job applications.

The application models students, skills, jobs, companies, courses, and applications as connected graph entities using CognoDB / Neo4j graph database technology.

---

## 1. Use Case

Students often have difficulty answering three connected questions:

1. Which jobs are a good match for my current skills?
2. Which skills am I missing for the roles I want?
3. How can I track my applications and career progress?

CareerGraph AI addresses these problems by representing career information as a connected graph.

A student's skills are connected to the skills required by jobs. Jobs are connected to companies, while students are also connected to their applications and learning courses.

This allows the application to provide:

- Skill exploration
- Job discovery
- Career matching
- Skill-gap analysis
- Graph exploration
- Application tracking
- Application status management

---

# 2. Why a Graph Database?

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