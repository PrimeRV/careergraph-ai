import dotenv from "dotenv";
import neo4j from "neo4j-driver";

// Load variables from .env.local
dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error(
    "Missing COGNODB_URI, COGNODB_USERNAME or COGNODB_PASSWORD in .env.local"
  );
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

// ----------------------------------------------------
// DATA
// ----------------------------------------------------

const students = [
  {
    id: "student-001",
    name: "Rohit Verma",
    role: "Computer Science Student",
    experience: 2,
  },
  {
    id: "student-002",
    name: "Ananya Sharma",
    role: "Frontend Developer",
    experience: 2,
  },
  {
    id: "student-003",
    name: "Arjun Mehta",
    role: "Backend Developer",
    experience: 3,
  },
  {
    id: "student-004",
    name: "Priya Singh",
    role: "Data Analyst",
    experience: 2,
  },
  {
    id: "student-005",
    name: "Rahul Kapoor",
    role: "DevOps Engineer",
    experience: 4,
  },
];

const skills = [
  { id: "skill-001", name: "Java", category: "Backend" },
  { id: "skill-002", name: "JavaScript", category: "Programming" },
  { id: "skill-003", name: "TypeScript", category: "Programming" },
  { id: "skill-004", name: "React", category: "Frontend" },
  { id: "skill-005", name: "Node.js", category: "Backend" },
  { id: "skill-006", name: "Python", category: "Programming" },
  { id: "skill-007", name: "SQL", category: "Database" },
  { id: "skill-008", name: "MongoDB", category: "Database" },
  { id: "skill-009", name: "Docker", category: "DevOps" },
  { id: "skill-010", name: "AWS", category: "Cloud" },
  { id: "skill-011", name: "System Design", category: "Architecture" },
  { id: "skill-012", name: "Spring Boot", category: "Backend" },
  { id: "skill-013", name: "Git", category: "Tools" },
  { id: "skill-014", name: "Kubernetes", category: "DevOps" },
  { id: "skill-015", name: "REST APIs", category: "Backend" },
];

const companies = [
  {
    id: "company-001",
    name: "Google",
    industry: "Technology",
    location: "Bangalore",
  },
  {
    id: "company-002",
    name: "Microsoft",
    industry: "Technology",
    location: "Hyderabad",
  },
  {
    id: "company-003",
    name: "Amazon",
    industry: "E-Commerce & Cloud",
    location: "Bangalore",
  },
  {
    id: "company-004",
    name: "Meta",
    industry: "Social Technology",
    location: "Remote",
  },
  {
    id: "company-005",
    name: "TCS",
    industry: "IT Services",
    location: "Mumbai",
  },
  {
    id: "company-006",
    name: "Infosys",
    industry: "IT Services",
    location: "Bangalore",
  },
  {
    id: "company-007",
    name: "Wipro",
    industry: "IT Services",
    location: "Bangalore",
  },
  {
    id: "company-008",
    name: "Accenture",
    industry: "Consulting & Technology",
    location: "Pune",
  },
];

const jobs = [
  {
    id: "job-001",
    title: "Software Engineer",
    level: "Mid Level",
    location: "Bangalore",
  },
  {
    id: "job-002",
    title: "Backend Developer",
    level: "Mid Level",
    location: "Hyderabad",
  },
  {
    id: "job-003",
    title: "Frontend Developer",
    level: "Junior",
    location: "Remote",
  },
  {
    id: "job-004",
    title: "Full Stack Developer",
    level: "Mid Level",
    location: "Bangalore",
  },
  {
    id: "job-005",
    title: "DevOps Engineer",
    level: "Mid Level",
    location: "Pune",
  },
  {
    id: "job-006",
    title: "Cloud Engineer",
    level: "Mid Level",
    location: "Hyderabad",
  },
  {
    id: "job-007",
    title: "Java Developer",
    level: "Junior",
    location: "Mumbai",
  },
  {
    id: "job-008",
    title: "React Developer",
    level: "Junior",
    location: "Remote",
  },
  {
    id: "job-009",
    title: "Data Engineer",
    level: "Mid Level",
    location: "Bangalore",
  },
  {
    id: "job-010",
    title: "Platform Engineer",
    level: "Senior",
    location: "Hyderabad",
  },
];

const courses = [
  {
    id: "course-001",
    title: "Java & Spring Boot Masterclass",
    provider: "CareerGraph Academy",
    duration: "8 weeks",
  },
  {
    id: "course-002",
    title: "Modern React Development",
    provider: "CareerGraph Academy",
    duration: "6 weeks",
  },
  {
    id: "course-003",
    title: "Node.js Backend Engineering",
    provider: "CareerGraph Academy",
    duration: "7 weeks",
  },
  {
    id: "course-004",
    title: "Cloud Engineering with AWS",
    provider: "CareerGraph Academy",
    duration: "10 weeks",
  },
  {
    id: "course-005",
    title: "System Design Fundamentals",
    provider: "CareerGraph Academy",
    duration: "5 weeks",
  },
  {
    id: "course-006",
    title: "Docker & Kubernetes",
    provider: "CareerGraph Academy",
    duration: "6 weeks",
  },
  {
    id: "course-007",
    title: "SQL for Data Engineering",
    provider: "CareerGraph Academy",
    duration: "4 weeks",
  },
  {
    id: "course-008",
    title: "TypeScript for Full Stack Development",
    provider: "CareerGraph Academy",
    duration: "5 weeks",
  },
];

// ----------------------------------------------------
// STUDENT -> SKILL
// ----------------------------------------------------

const studentSkills = [
  {
    studentId: "student-001",
    skillId: "skill-001",
    proficiency: 85,
    years: 2,
  },
  {
    studentId: "student-001",
    skillId: "skill-002",
    proficiency: 88,
    years: 2,
  },
  {
    studentId: "student-001",
    skillId: "skill-004",
    proficiency: 80,
    years: 1,
  },
  {
    studentId: "student-001",
    skillId: "skill-005",
    proficiency: 78,
    years: 1,
  },
  {
    studentId: "student-001",
    skillId: "skill-007",
    proficiency: 82,
    years: 2,
  },
  {
    studentId: "student-001",
    skillId: "skill-012",
    proficiency: 75,
    years: 1,
  },
  {
    studentId: "student-001",
    skillId: "skill-013",
    proficiency: 90,
    years: 2,
  },
  {
    studentId: "student-001",
    skillId: "skill-015",
    proficiency: 85,
    years: 1,
  },

  {
    studentId: "student-002",
    skillId: "skill-002",
    proficiency: 92,
    years: 2,
  },
  {
    studentId: "student-002",
    skillId: "skill-003",
    proficiency: 88,
    years: 2,
  },
  {
    studentId: "student-002",
    skillId: "skill-004",
    proficiency: 94,
    years: 2,
  },
  {
    studentId: "student-002",
    skillId: "skill-013",
    proficiency: 86,
    years: 2,
  },

  {
    studentId: "student-003",
    skillId: "skill-001",
    proficiency: 94,
    years: 3,
  },
  {
    studentId: "student-003",
    skillId: "skill-005",
    proficiency: 91,
    years: 3,
  },
  {
    studentId: "student-003",
    skillId: "skill-007",
    proficiency: 89,
    years: 3,
  },
  {
    studentId: "student-003",
    skillId: "skill-012",
    proficiency: 93,
    years: 3,
  },
  {
    studentId: "student-003",
    skillId: "skill-015",
    proficiency: 92,
    years: 3,
  },

  {
    studentId: "student-004",
    skillId: "skill-006",
    proficiency: 91,
    years: 2,
  },
  {
    studentId: "student-004",
    skillId: "skill-007",
    proficiency: 95,
    years: 2,
  },
  {
    studentId: "student-004",
    skillId: "skill-008",
    proficiency: 78,
    years: 1,
  },

  {
    studentId: "student-005",
    skillId: "skill-009",
    proficiency: 94,
    years: 4,
  },
  {
    studentId: "student-005",
    skillId: "skill-010",
    proficiency: 92,
    years: 3,
  },
  {
    studentId: "student-005",
    skillId: "skill-013",
    proficiency: 96,
    years: 4,
  },
  {
    studentId: "student-005",
    skillId: "skill-014",
    proficiency: 88,
    years: 2,
  },
];

// ----------------------------------------------------
// JOB -> REQUIRED SKILLS
// ----------------------------------------------------

const jobSkills = [
  {
    jobId: "job-001",
    skillId: "skill-001",
    level: "Intermediate",
  },
  {
    jobId: "job-001",
    skillId: "skill-007",
    level: "Intermediate",
  },
  {
    jobId: "job-001",
    skillId: "skill-011",
    level: "Intermediate",
  },
  {
    jobId: "job-001",
    skillId: "skill-013",
    level: "Intermediate",
  },

  {
    jobId: "job-002",
    skillId: "skill-001",
    level: "Advanced",
  },
  {
    jobId: "job-002",
    skillId: "skill-012",
    level: "Intermediate",
  },
  {
    jobId: "job-002",
    skillId: "skill-007",
    level: "Intermediate",
  },
  {
    jobId: "job-002",
    skillId: "skill-015",
    level: "Intermediate",
  },

  {
    jobId: "job-003",
    skillId: "skill-002",
    level: "Advanced",
  },
  {
    jobId: "job-003",
    skillId: "skill-003",
    level: "Intermediate",
  },
  {
    jobId: "job-003",
    skillId: "skill-004",
    level: "Advanced",
  },

  {
    jobId: "job-004",
    skillId: "skill-002",
    level: "Intermediate",
  },
  {
    jobId: "job-004",
    skillId: "skill-004",
    level: "Intermediate",
  },
  {
    jobId: "job-004",
    skillId: "skill-005",
    level: "Intermediate",
  },
  {
    jobId: "job-004",
    skillId: "skill-007",
    level: "Intermediate",
  },

  {
    jobId: "job-005",
    skillId: "skill-009",
    level: "Advanced",
  },
  {
    jobId: "job-005",
    skillId: "skill-010",
    level: "Intermediate",
  },
  {
    jobId: "job-005",
    skillId: "skill-014",
    level: "Intermediate",
  },

  {
    jobId: "job-006",
    skillId: "skill-010",
    level: "Advanced",
  },
  {
    jobId: "job-006",
    skillId: "skill-009",
    level: "Intermediate",
  },
  {
    jobId: "job-006",
    skillId: "skill-013",
    level: "Intermediate",
  },

  {
    jobId: "job-007",
    skillId: "skill-001",
    level: "Advanced",
  },
  {
    jobId: "job-007",
    skillId: "skill-012",
    level: "Intermediate",
  },
  {
    jobId: "job-007",
    skillId: "skill-007",
    level: "Intermediate",
  },

  {
    jobId: "job-008",
    skillId: "skill-002",
    level: "Intermediate",
  },
  {
    jobId: "job-008",
    skillId: "skill-003",
    level: "Intermediate",
  },
  {
    jobId: "job-008",
    skillId: "skill-004",
    level: "Advanced",
  },

  {
    jobId: "job-009",
    skillId: "skill-006",
    level: "Advanced",
  },
  {
    jobId: "job-009",
    skillId: "skill-007",
    level: "Advanced",
  },
  {
    jobId: "job-009",
    skillId: "skill-010",
    level: "Intermediate",
  },

  {
    jobId: "job-010",
    skillId: "skill-009",
    level: "Advanced",
  },
  {
    jobId: "job-010",
    skillId: "skill-010",
    level: "Advanced",
  },
  {
    jobId: "job-010",
    skillId: "skill-014",
    level: "Advanced",
  },
  {
    jobId: "job-010",
    skillId: "skill-011",
    level: "Advanced",
  },
];

// ----------------------------------------------------
// JOB -> COMPANY
// ----------------------------------------------------

const jobCompanies = [
  { jobId: "job-001", companyId: "company-001" },
  { jobId: "job-002", companyId: "company-002" },
  { jobId: "job-003", companyId: "company-004" },
  { jobId: "job-004", companyId: "company-003" },
  { jobId: "job-005", companyId: "company-008" },
  { jobId: "job-006", companyId: "company-002" },
  { jobId: "job-007", companyId: "company-005" },
  { jobId: "job-008", companyId: "company-006" },
  { jobId: "job-009", companyId: "company-001" },
  { jobId: "job-010", companyId: "company-003" },
];

// ----------------------------------------------------
// SKILL -> RELATED SKILL
// ----------------------------------------------------

const relatedSkills = [
  {
    from: "skill-001",
    to: "skill-012",
    strength: 0.95,
  },
  {
    from: "skill-001",
    to: "skill-007",
    strength: 0.7,
  },
  {
    from: "skill-002",
    to: "skill-003",
    strength: 0.9,
  },
  {
    from: "skill-002",
    to: "skill-004",
    strength: 0.9,
  },
  {
    from: "skill-002",
    to: "skill-005",
    strength: 0.85,
  },
  {
    from: "skill-004",
    to: "skill-003",
    strength: 0.95,
  },
  {
    from: "skill-005",
    to: "skill-015",
    strength: 0.9,
  },
  {
    from: "skill-009",
    to: "skill-014",
    strength: 0.95,
  },
  {
    from: "skill-010",
    to: "skill-009",
    strength: 0.9,
  },
  {
    from: "skill-010",
    to: "skill-014",
    strength: 0.85,
  },
  {
    from: "skill-007",
    to: "skill-006",
    strength: 0.8,
  },
  {
    from: "skill-011",
    to: "skill-001",
    strength: 0.7,
  },
];

// ----------------------------------------------------
// COURSE -> SKILL
// ----------------------------------------------------

const courseSkills = [
  { courseId: "course-001", skillId: "skill-001" },
  { courseId: "course-001", skillId: "skill-012" },

  { courseId: "course-002", skillId: "skill-004" },
  { courseId: "course-002", skillId: "skill-003" },

  { courseId: "course-003", skillId: "skill-005" },
  { courseId: "course-003", skillId: "skill-015" },

  { courseId: "course-004", skillId: "skill-010" },

  { courseId: "course-005", skillId: "skill-011" },

  { courseId: "course-006", skillId: "skill-009" },
  { courseId: "course-006", skillId: "skill-014" },

  { courseId: "course-007", skillId: "skill-007" },

  { courseId: "course-008", skillId: "skill-003" },
];

// ----------------------------------------------------
// STUDENT -> COURSE
// ----------------------------------------------------

const studentCourses = [
  { studentId: "student-001", courseId: "course-001" },
  { studentId: "student-001", courseId: "course-008" },
  { studentId: "student-002", courseId: "course-002" },
  { studentId: "student-003", courseId: "course-001" },
  { studentId: "student-004", courseId: "course-007" },
  { studentId: "student-005", courseId: "course-004" },
  { studentId: "student-005", courseId: "course-006" },
];

// ----------------------------------------------------
// STUDENT -> JOB APPLICATIONS
// ----------------------------------------------------

const applications = [
  {
    studentId: "student-001",
    jobId: "job-001",
    status: "Interview",
  },
  {
    studentId: "student-001",
    jobId: "job-004",
    status: "Applied",
  },
  {
    studentId: "student-001",
    jobId: "job-007",
    status: "Shortlisted",
  },
  {
    studentId: "student-002",
    jobId: "job-003",
    status: "Interview",
  },
  {
    studentId: "student-002",
    jobId: "job-008",
    status: "Applied",
  },
  {
    studentId: "student-003",
    jobId: "job-002",
    status: "Offer",
  },
  {
    studentId: "student-004",
    jobId: "job-009",
    status: "Applied",
  },
  {
    studentId: "student-005",
    jobId: "job-005",
    status: "Interview",
  },
];

// ----------------------------------------------------
// SEED FUNCTION
// ----------------------------------------------------

async function seed() {
  const session = driver.session();

  try {
    console.log("🚀 Starting CareerGraph AI seed...\n");

    // ----------------------------------------------
    // 1. Constraints
    // ----------------------------------------------

    console.log("Creating uniqueness constraints...");

    const constraints = [
      "CREATE CONSTRAINT student_id IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT job_id IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE",
      "CREATE CONSTRAINT company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE",
      "CREATE CONSTRAINT course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE",
    ];

    for (const query of constraints) {
      await session.run(query);
    }

    // ----------------------------------------------
    // 2. Students
    // ----------------------------------------------

    console.log("Creating students...");

    await session.run(
      `
      UNWIND $students AS student

      MERGE (s:Student {id: student.id})
      SET
        s.name = student.name,
        s.role = student.role,
        s.experience = student.experience
      `,
      { students }
    );

    // ----------------------------------------------
    // 3. Skills
    // ----------------------------------------------

    console.log("Creating skills...");

    await session.run(
      `
      UNWIND $skills AS skill

      MERGE (s:Skill {id: skill.id})
      SET
        s.name = skill.name,
        s.category = skill.category
      `,
      { skills }
    );

    // ----------------------------------------------
    // 4. Companies
    // ----------------------------------------------

    console.log("Creating companies...");

    await session.run(
      `
      UNWIND $companies AS company

      MERGE (c:Company {id: company.id})
      SET
        c.name = company.name,
        c.industry = company.industry,
        c.location = company.location
      `,
      { companies }
    );

    // ----------------------------------------------
    // 5. Jobs
    // ----------------------------------------------

    console.log("Creating jobs...");

    await session.run(
      `
      UNWIND $jobs AS job

      MERGE (j:Job {id: job.id})
      SET
        j.title = job.title,
        j.level = job.level,
        j.location = job.location
      `,
      { jobs }
    );

    // ----------------------------------------------
    // 6. Courses
    // ----------------------------------------------

    console.log("Creating courses...");

    await session.run(
      `
      UNWIND $courses AS course

      MERGE (c:Course {id: course.id})
      SET
        c.title = course.title,
        c.provider = course.provider,
        c.duration = course.duration
      `,
      { courses }
    );

    // ----------------------------------------------
    // 7. Student HAS_SKILL
    // ----------------------------------------------

    console.log("Creating HAS_SKILL relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (student:Student {id: rel.studentId})
      MATCH (skill:Skill {id: rel.skillId})

      MERGE (student)-[r:HAS_SKILL]->(skill)

      SET
        r.proficiency = rel.proficiency,
        r.years = rel.years
      `,
      { relationships: studentSkills }
    );

    // ----------------------------------------------
    // 8. Job REQUIRES Skill
    // ----------------------------------------------

    console.log("Creating REQUIRES relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (job:Job {id: rel.jobId})
      MATCH (skill:Skill {id: rel.skillId})

      MERGE (job)-[r:REQUIRES]->(skill)

      SET r.level = rel.level
      `,
      { relationships: jobSkills }
    );

    // ----------------------------------------------
    // 9. Job OFFERED_BY Company
    // ----------------------------------------------

    console.log("Creating OFFERED_BY relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (job:Job {id: rel.jobId})
      MATCH (company:Company {id: rel.companyId})

      MERGE (job)-[:OFFERED_BY]->(company)
      `,
      { relationships: jobCompanies }
    );

    // ----------------------------------------------
    // 10. Skill RELATED_TO Skill
    // ----------------------------------------------

    console.log("Creating RELATED_TO relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (from:Skill {id: rel.from})
      MATCH (to:Skill {id: rel.to})

      MERGE (from)-[r:RELATED_TO]->(to)

      SET r.strength = rel.strength
      `,
      { relationships: relatedSkills }
    );

    // ----------------------------------------------
    // 11. Course TEACHES Skill
    // ----------------------------------------------

    console.log("Creating TEACHES relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (course:Course {id: rel.courseId})
      MATCH (skill:Skill {id: rel.skillId})

      MERGE (course)-[:TEACHES]->(skill)
      `,
      { relationships: courseSkills }
    );

    // ----------------------------------------------
    // 12. Student STUDIED Course
    // ----------------------------------------------

    console.log("Creating STUDIED relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (student:Student {id: rel.studentId})
      MATCH (course:Course {id: rel.courseId})

      MERGE (student)-[:STUDIED]->(course)
      `,
      { relationships: studentCourses }
    );

    // ----------------------------------------------
    // 13. Student APPLIED_TO Job
    // ----------------------------------------------

    console.log("Creating APPLIED_TO relationships...");

    await session.run(
      `
      UNWIND $relationships AS rel

      MATCH (student:Student {id: rel.studentId})
      MATCH (job:Job {id: rel.jobId})

      MERGE (student)-[r:APPLIED_TO]->(job)

      SET r.status = rel.status
      `,
      { relationships: applications }
    );

    // ----------------------------------------------
    // 14. Verify database
    // ----------------------------------------------

    console.log("\n🔍 Verifying graph...");

    const result = await session.run(`
      MATCH (n)
      RETURN labels(n) AS labels, count(n) AS count
      ORDER BY labels(n)[0]
    `);

    console.log("\nNode counts:");

    for (const record of result.records) {
      console.log(
        `  ${record.get("labels").join(", ")}: ${record
          .get("count")
          .toString()}`
      );
    }

    const relationshipResult = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) AS relationship, count(r) AS count
      ORDER BY relationship
    `);

    console.log("\nRelationship counts:");

    for (const record of relationshipResult.records) {
      console.log(
        `  ${record.get("relationship")}: ${record
          .get("count")
          .toString()}`
      );
    }

    console.log("\n✅ CareerGraph AI seed completed successfully!");
  } catch (error) {
    console.error("\n❌ Seed failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();