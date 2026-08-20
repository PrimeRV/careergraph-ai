import { driver } from "@/lib/neo4j";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SETTINGS = {
  profile: {
    name: "Rohit Verma",
    role: "Student",
    experience: "2 years",
  },

  preferences: {
    profileType: "Career Explorer",
    careerFocus: "Software Engineering",
    workMode: "Remote",
    experienceLevel: "Mid Level",

    theme: "dark",

    applicationUpdates: true,
    careerMatches: true,
    skillRecommendations: true,

    rememberPreferences: true,
  },
};

// =====================================================
// GET SETTINGS
// =====================================================

export async function GET(request: NextRequest) {
  const session = driver.session();

  try {
    const studentId =
      request.nextUrl.searchParams.get(
        "studentId"
      );

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          message: "studentId is required",
        },
        { status: 400 }
      );
    }

    const result = await session.run(
      `
      MATCH (student:Student {id: $studentId})

      RETURN
        student.id AS id,
        student.name AS name,
        student.role AS role,

        student.experience AS experience,

        student.profileType AS profileType,
        student.careerFocus AS careerFocus,
        student.workMode AS workMode,
        student.experienceLevel AS experienceLevel,

        student.theme AS theme,

        student.applicationUpdates AS applicationUpdates,
        student.careerMatches AS careerMatches,
        student.skillRecommendations AS skillRecommendations,

        student.rememberPreferences AS rememberPreferences
      `,
      {
        studentId,
      }
    );

    // -------------------------------------------------
    // STUDENT NOT FOUND
    // -------------------------------------------------

    if (result.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const record = result.records[0];

    const getValue = (
      key: string,
      fallback: any
    ) => {
      const value = record.get(key);

      return value === null ||
        value === undefined
        ? fallback
        : value;
    };

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return NextResponse.json({
      success: true,

      settings: {
        profile: {
          name: getValue(
            "name",
            DEFAULT_SETTINGS.profile.name
          ),

          role: getValue(
            "role",
            DEFAULT_SETTINGS.profile.role
          ),

          experience: getValue(
            "experience",
            DEFAULT_SETTINGS.profile.experience
          ),
        },

        preferences: {
          profileType: getValue(
            "profileType",
            DEFAULT_SETTINGS.preferences.profileType
          ),

          careerFocus: getValue(
            "careerFocus",
            DEFAULT_SETTINGS.preferences.careerFocus
          ),

          workMode: getValue(
            "workMode",
            DEFAULT_SETTINGS.preferences.workMode
          ),

          experienceLevel: getValue(
            "experienceLevel",
            DEFAULT_SETTINGS.preferences
              .experienceLevel
          ),

          theme: getValue(
            "theme",
            DEFAULT_SETTINGS.preferences.theme
          ),

          applicationUpdates: Boolean(
            getValue(
              "applicationUpdates",
              DEFAULT_SETTINGS.preferences
                .applicationUpdates
            )
          ),

          careerMatches: Boolean(
            getValue(
              "careerMatches",
              DEFAULT_SETTINGS.preferences
                .careerMatches
            )
          ),

          skillRecommendations: Boolean(
            getValue(
              "skillRecommendations",
              DEFAULT_SETTINGS.preferences
                .skillRecommendations
            )
          ),

          rememberPreferences: Boolean(
            getValue(
              "rememberPreferences",
              DEFAULT_SETTINGS.preferences
                .rememberPreferences
            )
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "GET /api/settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load settings",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}

// =====================================================
// PUT SETTINGS
// =====================================================

export async function PUT(request: NextRequest) {
  const session = driver.session();

  try {
    // -------------------------------------------------
    // READ JSON BODY
    // -------------------------------------------------

    const body = await request.json();

    const {
      studentId,

      name,
      role,
      experience,

      profileType,
      careerFocus,
      workMode,
      experienceLevel,

      theme,

      applicationUpdates,
      careerMatches,
      skillRecommendations,

      rememberPreferences,
    } = body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          message: "studentId is required",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // UPDATE STUDENT
    // -------------------------------------------------

    const result = await session.run(
      `
      MATCH (student:Student {id: $studentId})

      SET
        student.name =
          coalesce($name, student.name),

        student.role =
          coalesce($role, student.role),

        student.experience =
          coalesce(
            $experience,
            student.experience
          ),

        student.profileType =
          coalesce(
            $profileType,
            student.profileType
          ),

        student.careerFocus =
          coalesce(
            $careerFocus,
            student.careerFocus
          ),

        student.workMode =
          coalesce(
            $workMode,
            student.workMode
          ),

        student.experienceLevel =
          coalesce(
            $experienceLevel,
            student.experienceLevel
          ),

        student.theme =
          coalesce(
            $theme,
            student.theme
          ),

        student.applicationUpdates =
          coalesce(
            $applicationUpdates,
            student.applicationUpdates
          ),

        student.careerMatches =
          coalesce(
            $careerMatches,
            student.careerMatches
          ),

        student.skillRecommendations =
          coalesce(
            $skillRecommendations,
            student.skillRecommendations
          ),

        student.rememberPreferences =
          coalesce(
            $rememberPreferences,
            student.rememberPreferences
          )

      RETURN
        student.id AS id,
        student.name AS name,
        student.role AS role,
        student.experience AS experience,

        student.profileType AS profileType,
        student.careerFocus AS careerFocus,
        student.workMode AS workMode,
        student.experienceLevel AS experienceLevel,

        student.theme AS theme,

        student.applicationUpdates AS applicationUpdates,
        student.careerMatches AS careerMatches,
        student.skillRecommendations AS skillRecommendations,

        student.rememberPreferences AS rememberPreferences
      `,
      {
        studentId,

        name: name ?? null,
        role: role ?? null,
        experience: experience ?? null,

        profileType: profileType ?? null,
        careerFocus: careerFocus ?? null,
        workMode: workMode ?? null,
        experienceLevel:
          experienceLevel ?? null,

        theme: theme ?? null,

        applicationUpdates:
          applicationUpdates ?? null,

        careerMatches:
          careerMatches ?? null,

        skillRecommendations:
          skillRecommendations ?? null,

        rememberPreferences:
          rememberPreferences ?? null,
      }
    );

    // -------------------------------------------------
    // STUDENT NOT FOUND
    // -------------------------------------------------

    if (result.records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    const record = result.records[0];

    // -------------------------------------------------
    // RETURN UPDATED SETTINGS
    // -------------------------------------------------

    return NextResponse.json({
      success: true,

      message: "Settings saved successfully",

      settings: {
        profile: {
          name: record.get("name"),
          role: record.get("role"),
          experience:
            record.get("experience") ??
            DEFAULT_SETTINGS.profile.experience,
        },

        preferences: {
          profileType:
            record.get("profileType") ??
            DEFAULT_SETTINGS.preferences.profileType,

          careerFocus:
            record.get("careerFocus") ??
            DEFAULT_SETTINGS.preferences.careerFocus,

          workMode:
            record.get("workMode") ??
            DEFAULT_SETTINGS.preferences.workMode,

          experienceLevel:
            record.get("experienceLevel") ??
            DEFAULT_SETTINGS.preferences
              .experienceLevel,

          theme:
            record.get("theme") ??
            DEFAULT_SETTINGS.preferences.theme,

          applicationUpdates:
            record.get(
              "applicationUpdates"
            ) ??
            DEFAULT_SETTINGS.preferences
              .applicationUpdates,

          careerMatches:
            record.get("careerMatches") ??
            DEFAULT_SETTINGS.preferences
              .careerMatches,

          skillRecommendations:
            record.get(
              "skillRecommendations"
            ) ??
            DEFAULT_SETTINGS.preferences
              .skillRecommendations,

          rememberPreferences:
            record.get(
              "rememberPreferences"
            ) ??
            DEFAULT_SETTINGS.preferences
              .rememberPreferences,
        },
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/settings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save settings",
      },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}