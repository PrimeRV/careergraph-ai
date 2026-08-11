import { driver } from "@/lib/cognodb";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId") || "student-001";

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (student:Student {id: $studentId})
            -[hasSkill:HAS_SKILL]->
            (skill:Skill)

      RETURN
        skill.id AS id,
        skill.name AS name,
        skill.category AS category,
        hasSkill.proficiency AS proficiency,
        hasSkill.years AS years

      ORDER BY hasSkill.proficiency DESC, skill.name
      `,
      { studentId }
    );

    const skills = result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      category: record.get("category"),
      proficiency: Number(record.get("proficiency")),
      years: Number(record.get("years")),
    }));

    return NextResponse.json({
      success: true,
      studentId,
      skills,
    });
  } catch (error) {
    console.error("Skills API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load skills",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}