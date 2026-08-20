import { driver } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const studentId =
    searchParams.get("studentId") || "student-001";

  const session = driver.session();

  try {
    // =====================================================
    // STUDENT
    // =====================================================

    const studentResult = await session.run(
      `
      MATCH (student:Student {id: $studentId})
      RETURN
        student.id AS id,
        student.name AS name,
        student.role AS role
      `,
      { studentId }
    );

    if (studentResult.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const student = studentResult.records[0];

    // =====================================================
    // STUDENT SKILLS
    // =====================================================

    const skillsResult = await session.run(
      `
      MATCH (student:Student {id: $studentId})
            -[:HAS_SKILL]->
            (skill:Skill)

      RETURN
        skill.id AS id,
        skill.name AS name,
        skill.category AS category

      ORDER BY skill.name
      `,
      { studentId }
    );

    // =====================================================
    // APPLIED JOBS
    // =====================================================

    const applicationsResult = await session.run(
      `
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
      `,
      { studentId }
    );

    // =====================================================
    // CAREER MATCHES
    // =====================================================

    const matchesResult = await session.run(
      `
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
      `,
      { studentId }
    );

    // =====================================================
    // SKILL GAP
    // =====================================================

    const skillGapResult = await session.run(
      `
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
      `,
      { studentId }
    );

    // =====================================================
    // CONVERT SKILLS
    // =====================================================

    const skills = skillsResult.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      category: record.get("category"),
    }));

    // =====================================================
    // CONVERT APPLICATIONS
    // =====================================================

    const applications = applicationsResult.records.map(
      (record) => ({
        jobId: record.get("jobId"),
        jobTitle: record.get("jobTitle"),
        company: record.get("company"),
        status: record.get("status") || "Applied",
        appliedAt: record.get("appliedAt")
          ? record.get("appliedAt").toString()
          : null,
      })
    );

    // =====================================================
    // CONVERT MATCHES
    // =====================================================

    const matches = matchesResult.records.map((record) => ({
      jobId: record.get("jobId"),
      jobTitle: record.get("jobTitle"),
      company: record.get("company"),
      level: record.get("level"),
      location: record.get("location"),
      matchScore: Number(record.get("matchScore") ?? 0),
      totalRequiredSkills: Number(
        record.get("totalRequiredSkills") ?? 0
      ),
      matchingSkills: Number(
        record.get("matchingSkills") ?? 0
      ),
    }));

    // =====================================================
    // CONVERT SKILL GAP
    // =====================================================

    const skillGap = skillGapResult.records.map(
      (record) => ({
        skillId: record.get("skillId"),
        skillName: record.get("skillName"),
        category: record.get("category"),
      })
    );

    // =====================================================
    // FINAL RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      student: {
        id: student.get("id"),
        name: student.get("name"),
        role: student.get("role"),
      },

      metrics: {
        skillsCount: skills.length,
        careerMatches: matches.length,
        skillGap: skillGap.length,
        appliedJobs: applications.length,
      },

      skills,
      skillGap,
      applications,
      matches,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}