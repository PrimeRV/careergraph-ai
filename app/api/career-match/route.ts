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
        job.level AS level,
        job.location AS location,
        company.name AS company,
        matchScore,

        [skill IN requiredSkills |
          {
            id: skill.id,
            name: skill.name,
            category: skill.category
          }
        ] AS requiredSkills,

        [skill IN matchedSkills |
          {
            id: skill.id,
            name: skill.name,
            category: skill.category
          }
        ] AS matchedSkills

      ORDER BY matchScore DESC, job.title
      `,
      { studentId }
    );

    const matches = result.records.map((record) => ({
      jobId: record.get("jobId"),
      jobTitle: record.get("jobTitle"),
      company: record.get("company"),
      level: record.get("level"),
      location: record.get("location"),
      matchScore: Number(record.get("matchScore")),
      requiredSkills: record.get("requiredSkills"),
      matchedSkills: record.get("matchedSkills"),
    }));

    return NextResponse.json({
      success: true,
      studentId,
      matches,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error("Career Match API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to calculate career matches",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}