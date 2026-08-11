import { driver } from "@/lib/cognodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const studentId = searchParams.get("studentId");
  const jobId = searchParams.get("jobId");

  if (!studentId || !jobId) {
    return NextResponse.json(
      {
        success: false,
        message: "studentId and jobId are required",
      },
      { status: 400 }
    );
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (student:Student {id: $studentId})
      MATCH (job:Job {id: $jobId})

      MATCH (job)-[:REQUIRES]->(requiredSkill:Skill)

      OPTIONAL MATCH (student)-[:HAS_SKILL]->(studentSkill:Skill)
      WHERE studentSkill.id = requiredSkill.id

      WITH
        student,
        job,
        requiredSkill,
        studentSkill

      WHERE studentSkill IS NULL

      RETURN
        requiredSkill.id AS skillId,
        requiredSkill.name AS skillName
      ORDER BY requiredSkill.name
      `,
      {
        studentId,
        jobId,
      }
    );

    const skillGap = result.records.map((record) => ({
      skillId: record.get("skillId"),
      skillName: record.get("skillName"),
    }));

    return NextResponse.json({
      success: true,
      studentId,
      jobId,
      skillGap,
      totalGaps: skillGap.length,
    });
  } catch (error) {
    console.error("Skill gap error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to calculate skill gap",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}