import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const studentId =
    searchParams.get("studentId") || "student-001";

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (student:Student {id: $studentId})

      OPTIONAL MATCH (student)-[r1:HAS_SKILL]->(skill:Skill)

      OPTIONAL MATCH (skill)-[r2:REQUIRES]-(job:Job)

      OPTIONAL MATCH (job)-[r3:OFFERED_BY]->(company:Company)

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
      MATCH (student:Student {id: $studentId})
      OPTIONAL MATCH (student)-[r1:HAS_SKILL]->(skill:Skill)

      RETURN
        student.id AS source,
        skill.id AS target,
        "HAS_SKILL" AS type

      UNION

      MATCH (student:Student {id: $studentId})
      MATCH (student)-[:HAS_SKILL]->(skill:Skill)
      MATCH (skill)-[:REQUIRES]->(job:Job)

      RETURN
        skill.id AS source,
        job.id AS target,
        "REQUIRES" AS type

      UNION

      MATCH (student:Student {id: $studentId})
      MATCH (job:Job)-[:OFFERED_BY]->(company:Company)

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