import { driver } from "@/lib/neo4j";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const studentId =
    searchParams.get("studentId") || "student-001";

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (student:Student { id: $studentId })

      OPTIONAL MATCH (student)-[:HAS_SKILL]->(skill:Skill)

      OPTIONAL MATCH (job:Job)-[:REQUIRES]->(skill)

      OPTIONAL MATCH (job)-[:OFFERED_BY]->(company:Company)

      RETURN
        student,
        collect(DISTINCT skill) AS skills,
        collect(DISTINCT job) AS jobs,
        collect(DISTINCT company) AS companies
      `,
      { studentId }
    );

    if (result.records.length === 0) {
      return NextResponse.json({
        success: true,
        studentId,
        nodes: [],
        relationships: [],
      });
    }

    const record = result.records[0];

    const student = record.get("student");
    const skills = record.get("skills");
    const jobs = record.get("jobs");
    const companies = record.get("companies");

    const nodes = [
      {
        id: student.properties.id,
        label: student.properties.name,
        type: "Student",
      },

      ...skills
        .filter((skill: any) => skill)
        .map((skill: any) => ({
          id: skill.properties.id,
          label: skill.properties.name,
          type: "Skill",
          category: skill.properties.category,
        })),

      ...jobs
        .filter((job: any) => job)
        .map((job: any) => ({
          id: job.properties.id,
          label: job.properties.title,
          type: "Job",
        })),

      ...companies
        .filter((company: any) => company)
        .map((company: any) => ({
          id: company.properties.id,
          label: company.properties.name,
          type: "Company",
        })),
    ];

    const relationshipsResult = await session.run(
      `
      MATCH (student:Student { id: $studentId })

      OPTIONAL MATCH (student)-[:HAS_SKILL]->(skill:Skill)

      WITH student, collect(DISTINCT skill) AS studentSkills

      UNWIND studentSkills AS skill

      OPTIONAL MATCH (job:Job)-[:REQUIRES]->(skill)

      WITH student, skill, collect(DISTINCT job) AS relatedJobs

      OPTIONAL MATCH (job:Job)-[:REQUIRES]->(skill)

      RETURN
        student.id AS source,
        skill.id AS target,
        "HAS_SKILL" AS type

      UNION

      MATCH (student:Student { id: $studentId })
      MATCH (student)-[:HAS_SKILL]->(skill:Skill)
      MATCH (job:Job)-[:REQUIRES]->(skill)

      RETURN
        skill.id AS source,
        job.id AS target,
        "REQUIRES" AS type

      UNION

      MATCH (student:Student { id: $studentId })
      MATCH (student)-[:HAS_SKILL]->(skill:Skill)
      MATCH (job:Job)-[:REQUIRES]->(skill)
      MATCH (job)-[:OFFERED_BY]->(company:Company)

      RETURN
        job.id AS source,
        company.id AS target,
        "OFFERED_BY" AS type
      `,
      { studentId }
    );

    const relationships = relationshipsResult.records
      .filter(
        (record) =>
          record.get("source") !== null &&
          record.get("target") !== null
      )
      .map((record) => ({
        source: record.get("source"),
        target: record.get("target"),
        type: record.get("type"),
      }));

    return NextResponse.json({
      success: true,
      studentId,
      nodes,
      relationships,
    });
  } catch (error) {
    console.error("Graph API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load career graph",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}