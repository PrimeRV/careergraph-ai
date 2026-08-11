import { NextResponse } from "next/server";
import { driver } from "@/lib/cognodb";

export async function GET() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (j:Job)-[:OFFERED_BY]->(c:Company)
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)

      RETURN
        j.id AS id,
        j.title AS title,
        j.level AS level,
        j.location AS location,
        c.name AS company,
        collect({
          id: s.id,
          name: s.name,
          category: s.category
        }) AS requiredSkills

      ORDER BY j.title
    `);

    const jobs = result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
      level: record.get("level"),
      location: record.get("location"),
      company: record.get("company"),
      requiredSkills: record
        .get("requiredSkills")
        .filter(
          (skill: { id: string | null }) =>
            skill.id !== null
        ),
    }));

    return NextResponse.json({
      success: true,
      jobs,
      totalJobs: jobs.length,
    });
  } catch (error) {
    console.error("Jobs API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch jobs",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}