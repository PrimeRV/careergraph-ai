import { driver } from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

/* ============================================================
   GET /api/applications
   ============================================================
   Database se saari applications fetch karta hai.
*/
export async function GET(request: NextRequest) {
  let session;

  try {
    session = driver.session();

    const result = await session.run(`
      MATCH (s:Student)-[r:APPLIED_TO]->(j:Job)

      RETURN
        s.id AS studentId,
        s.name AS studentName,
        j.id AS jobId,
        j.title AS jobTitle,
        j.company AS company,
        r.status AS status,
        toString(r.appliedAt) AS appliedAt

      ORDER BY r.appliedAt DESC
    `);

    const applications = result.records.map((record) => ({
      id: `${record.get("studentId")}-${record.get("jobId")}`,
      studentId: record.get("studentId"),
      studentName: record.get("studentName"),
      jobId: record.get("jobId"),
      jobTitle: record.get("jobTitle"),
      company: record.get("company"),
      status: record.get("status") ?? "Applied",
      appliedAt: record.get("appliedAt"),
    }));

    /* ========================================================
       STATUS COUNTS
       ======================================================== */

    const applied = applications.filter(
      (app) => app.status === "Applied"
    ).length;

    const shortlisted = applications.filter(
      (app) => app.status === "Shortlisted"
    ).length;

    const interviews = applications.filter(
      (app) =>
        app.status === "Interview" ||
        app.status === "Interview Scheduled"
    ).length;

    const offers = applications.filter(
      (app) => app.status === "Offer"
    ).length;

    const selected = applications.filter(
      (app) => app.status === "Selected"
    ).length;

    const rejected = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    const total = applications.length;

    return NextResponse.json({
      success: true,

      applications,

      stats: {
        applied,
        shortlisted,
        interviews,
        offers,
        selected,
        rejected,
        total,
      },
    });
  } catch (error) {
    console.error("Applications GET API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch applications",

        applications: [],

        stats: {
          applied: 0,
          shortlisted: 0,
          interviews: 0,
          offers: 0,
          selected: 0,
          rejected: 0,
          total: 0,
        },
      },
      {
        status: 500,
      }
    );
  } finally {
    await session?.close();
  }
}

/* ============================================================
   POST /api/applications
   ============================================================
   New application create/update karta hai.
*/
export async function POST(request: NextRequest) {
  let session;

  try {
    const body = await request.json();

    const studentId = body.studentId;
    const jobId = body.jobId;
    const status = body.status ?? "Applied";

    if (!studentId || !jobId) {
      return NextResponse.json(
        {
          success: false,
          message: "studentId and jobId are required",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Interview",
      "Offer",
      "Selected",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application status",
        },
        {
          status: 400,
        }
      );
    }

    session = driver.session();

    const result = await session.run(
      `
      MATCH (s:Student {id: $studentId})
      MATCH (j:Job {id: $jobId})

      MERGE (s)-[r:APPLIED_TO]->(j)

      SET
        r.status = $status,
        r.appliedAt = coalesce(
          r.appliedAt,
          datetime()
        )

      RETURN
        s.id AS studentId,
        s.name AS studentName,
        j.id AS jobId,
        j.title AS jobTitle,
        j.company AS company,
        r.status AS status,
        toString(r.appliedAt) AS appliedAt
      `,
      {
        studentId,
        jobId,
        status,
      }
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student or job not found",
        },
        {
          status: 404,
        }
      );
    }

    const record = result.records[0];

    return NextResponse.json({
      success: true,

      application: {
        id: `${record.get("studentId")}-${record.get("jobId")}`,
        studentId: record.get("studentId"),
        studentName: record.get("studentName"),
        jobId: record.get("jobId"),
        jobTitle: record.get("jobTitle"),
        company: record.get("company"),
        status: record.get("status"),
        appliedAt: record.get("appliedAt"),
      },
    });
  } catch (error) {
    console.error("Application POST API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to apply for job",
      },
      {
        status: 500,
      }
    );
  } finally {
    await session?.close();
  }
}

/* ============================================================
   PATCH /api/applications
   ============================================================
   Existing application ka status update karta hai.
*/
export async function PATCH(request: NextRequest) {
  let session;

  try {
    const body = await request.json();

    const studentId = body.studentId;
    const jobId = body.jobId;
    const status = body.status;

    if (!studentId || !jobId || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            "studentId, jobId and status are required",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================================
       ALLOWED STATUS
       ======================================================== */

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Interview",
      "Offer",
      "Selected",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application status",
        },
        {
          status: 400,
        }
      );
    }

    session = driver.session();

    const result = await session.run(
      `
      MATCH (s:Student {id: $studentId})
      MATCH (j:Job {id: $jobId})
      MATCH (s)-[r:APPLIED_TO]->(j)

      SET r.status = $status

      RETURN
        s.id AS studentId,
        s.name AS studentName,
        j.id AS jobId,
        j.title AS jobTitle,
        j.company AS company,
        r.status AS status,
        toString(r.appliedAt) AS appliedAt
      `,
      {
        studentId,
        jobId,
        status,
      }
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    const record = result.records[0];

    return NextResponse.json({
      success: true,

      application: {
        id: `${record.get("studentId")}-${record.get("jobId")}`,
        studentId: record.get("studentId"),
        studentName: record.get("studentName"),
        jobId: record.get("jobId"),
        jobTitle: record.get("jobTitle"),
        company: record.get("company"),
        status: record.get("status"),
        appliedAt: record.get("appliedAt"),
      },
    });
  } catch (error) {
    console.error("Application PATCH API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application status",
      },
      {
        status: 500,
      }
    );
  } finally {
    await session?.close();
  }
}