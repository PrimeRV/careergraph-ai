"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BriefcaseBusiness,
  Target,
  TrendingUp,
  ArrowRight,
  CircleAlert,
} from "lucide-react";
import AppShell from "./components/AppShell";

/* =============================================================== */
/* TYPES */
/* =============================================================== */

type Match = {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  matchScore: number;
  totalRequiredSkills: number;
  matchingSkills: number;
};

type Application = {
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
};

type Skill = {
  skillId: string;
  skillName: string;
  proficiency: number;
};

type SkillGap = {
  skillId: string;
  skillName: string;
  category: string;
};

type ApplicationStats = {
  applied: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  selected: number;
  rejected: number;
  total: number;
};

type ApplicationsResponse = {
  success: boolean;
  applications: Application[];
  stats: ApplicationStats;
};

type DashboardResponse = {
  success: boolean;

  student: {
    id: string;
    name: string;
    role: string;
  };

  metrics: {
    skillsCount: number;
    careerMatches: number;
    skillGap: number;
    appliedJobs: number;
  };

  skills: Skill[];

  skillGap: SkillGap[];

  applications: Application[];

  matches: Match[];
};

/* =============================================================== */
/* DEFAULT APPLICATION STATS */
/* =============================================================== */

const EMPTY_APPLICATION_STATS: ApplicationStats = {
  applied: 0,
  shortlisted: 0,
  interviews: 0,
  offers: 0,
  selected: 0,
  rejected: 0,
  total: 0,
};

/* =============================================================== */
/* PAGE */
/* =============================================================== */

export default function HomePage() {
  const [data, setData] =
    useState<DashboardResponse | null>(null);

  const [applicationStats, setApplicationStats] =
    useState<ApplicationStats>(
      EMPTY_APPLICATION_STATS
    );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        /* =======================================================
           DASHBOARD API
           ======================================================= */

        const response = await fetch(
          "/api/dashboard?studentId=student-001",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load dashboard"
          );
        }

        const result: DashboardResponse =
          await response.json();

        if (!result.success) {
          throw new Error(
            "Dashboard API failed"
          );
        }

        setData(result);

        /* =======================================================
           APPLICATIONS API
           ======================================================= */

        const applicationsResponse =
          await fetch("/api/applications", {
            method: "GET",
            cache: "no-store",
          });

        if (!applicationsResponse.ok) {
          throw new Error(
            "Failed to load applications"
          );
        }

        const applicationsResult: ApplicationsResponse =
          await applicationsResponse.json();

        if (!applicationsResult.success) {
          throw new Error(
            "Applications API failed"
          );
        }

        /* =======================================================
           REAL APPLICATION STATS
           ======================================================= */

        setApplicationStats({
          applied:
            applicationsResult.stats?.applied ?? 0,

          shortlisted:
            applicationsResult.stats?.shortlisted ?? 0,

          interviews:
            applicationsResult.stats?.interviews ?? 0,

          offers:
            applicationsResult.stats?.offers ?? 0,

          selected:
            applicationsResult.stats?.selected ?? 0,

          rejected:
            applicationsResult.stats?.rejected ?? 0,

          total:
            applicationsResult.stats?.total ??
            applicationsResult.applications?.length ??
            0,
        });
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  /* =============================================================
     LOADING
     ============================================================= */

  if (loading) {
    return (
      <AppShell active="Dashboard">
        <LoadingState />
      </AppShell>
    );
  }

  /* =============================================================
     ERROR
     ============================================================= */

  if (error || !data) {
    return (
      <AppShell active="Dashboard">
        <ErrorState message={error} />
      </AppShell>
    );
  }

  /* =============================================================
     CONTENT
     ============================================================= */

  return (
    <AppShell active="Dashboard">
      <DashboardContent
        data={data}
        applicationStats={applicationStats}
      />
    </AppShell>
  );
}

/* =============================================================== */
/* DASHBOARD CONTENT */
/* =============================================================== */

function DashboardContent({
  data,
  applicationStats,
}: {
  data: DashboardResponse;
  applicationStats: ApplicationStats;
}) {
  const strongSkills = useMemo(() => {
    return Math.min(5, data.skills.length);
  }, [data.skills.length]);

  const averageSkills = useMemo(() => {
    return Math.min(
      2,
      Math.max(
        0,
        data.skills.length - strongSkills
      )
    );
  }, [data.skills.length, strongSkills]);

  const weakSkills = useMemo(() => {
    return Math.max(
      0,
      data.skills.length -
        strongSkills -
        averageSkills
    );
  }, [
    data.skills.length,
    strongSkills,
    averageSkills,
  ]);

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-8">

      {/* ========================================================= */}
      {/* HERO */}
      {/* ========================================================= */}

      <section className="mb-7">

        <p className="mb-1 text-xs font-medium text-violet-400 sm:text-sm">
          Dashboard
        </p>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
          Welcome back,{" "}
          {data.student.name.split(" ")[0]}! 👋
        </h1>

        <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
          Explore your skills, career opportunities and
          build your dream career.
        </p>

      </section>

      {/* ========================================================= */}
      {/* STATS */}
      {/* ========================================================= */}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">

        <StatCard
          title="Skills You Have"
          value={data.metrics.skillsCount}
          subtitle="From your skill graph"
          icon={<Sparkles size={19} />}
          type="purple"
        />

        <StatCard
          title="Career Matches"
          value={data.metrics.careerMatches}
          subtitle="Top matching jobs"
          icon={<BriefcaseBusiness size={19} />}
          type="blue"
        />

        <StatCard
          title="Skill Gap"
          value={data.metrics.skillGap}
          subtitle="Skills to learn"
          icon={<Target size={19} />}
          type="orange"
        />

        <StatCard
          title="Applied Jobs"
          value={applicationStats.total}
          subtitle="Live from CognoDB"
          icon={<TrendingUp size={19} />}
          type="green"
        />

      </section>

      {/* ========================================================= */}
      {/* APPLICATION PROGRESS */}
      {/* ========================================================= */}

      <section className="mt-5">

        <div className="mb-4">

          <h2 className="text-sm font-semibold sm:text-base">
            Application Progress
          </h2>

          <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
            Live application status from CognoDB
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

          <ApplicationStatCard
            title="Applied"
            value={applicationStats.applied}
            type="green"
          />

          <ApplicationStatCard
            title="Shortlisted"
            value={applicationStats.shortlisted}
            type="purple"
          />

          <ApplicationStatCard
            title="Interview"
            value={applicationStats.interviews}
            type="blue"
          />

          <ApplicationStatCard
            title="Offer"
            value={applicationStats.offers}
            type="orange"
          />

          <ApplicationStatCard
            title="Selected"
            value={applicationStats.selected}
            type="green"
          />

          <ApplicationStatCard
            title="Rejected"
            value={applicationStats.rejected}
            type="red"
          />

        </div>

      </section>

      {/* ========================================================= */}
      {/* MAIN DASHBOARD GRID */}
      {/* ========================================================= */}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">

        {/* =======================================================
            MATCHING JOBS
            ======================================================= */}

        <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

          <div className="mb-5 flex items-start justify-between gap-4">

            <div>

              <h2 className="text-sm font-semibold sm:text-base">
                Top Matching Job Roles
              </h2>

              <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                Based on your current skill graph
              </p>

            </div>

            <Link
              href="/career-match"
              className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300"
            >
              View all
              <ArrowRight size={13} />
            </Link>

          </div>

          <div className="space-y-5">

            {data.matches.slice(0, 5).map((job) => (
              <JobMatchRow
                key={job.jobId}
                job={job}
              />
            ))}

            {data.matches.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
                <p className="text-xs text-zinc-600">
                  No career matches available.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* =======================================================
            SKILLS
            ======================================================= */}

        <SkillsProgress
          total={data.metrics.skillsCount}
          strong={strongSkills}
          average={averageSkills}
          weak={weakSkills}
        />

      </section>

      {/* ========================================================= */}
      {/* SKILL GAPS */}
      {/* ========================================================= */}

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

        <div className="mb-5 flex items-start justify-between">

          <div>

            <h2 className="text-sm font-semibold sm:text-base">
              Current Skill Gaps
            </h2>

            <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
              Skills that could improve your career options
            </p>

          </div>

          <Link
            href="/skill-gap"
            className="flex items-center gap-1 text-[11px] text-violet-400"
          >
            View all
            <ArrowRight size={13} />
          </Link>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

          {data.skillGap.slice(0, 6).map((gap) => (
            <SkillGapCard
              key={gap.skillId}
              gap={gap}
            />
          ))}

          {data.skillGap.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center sm:col-span-2 xl:col-span-3">
              <p className="text-xs text-zinc-600">
                No current skill gaps found.
              </p>
            </div>
          )}

        </div>

      </section>

      {/* ========================================================= */}
      {/* APPLICATIONS */}
      {/* ========================================================= */}

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

        <div className="mb-5 flex items-start justify-between">

          <div>

            <h2 className="text-sm font-semibold sm:text-base">
              Recent Applications
            </h2>

            <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
              Your current application progress
            </p>

          </div>

          <Link
            href="/applications"
            className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
          >
            View all
            <ArrowRight size={13} />
          </Link>

        </div>

        <div className="grid gap-3 md:grid-cols-3">

          {data.applications.length > 0 ? (
            data.applications
              .slice(0, 6)
              .map((application) => (
                <ApplicationCard
                  key={application.jobId}
                  application={application}
                />
              ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center md:col-span-3">
              <p className="text-xs text-zinc-600">
                No applications yet.
              </p>

              <Link
                href="/jobs"
                className="mt-3 inline-flex rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-medium text-white hover:bg-violet-500"
              >
                Explore Jobs
              </Link>
            </div>
          )}

        </div>

      </section>

      {/* ========================================================= */}
      {/* RECOMMENDATIONS */}
      {/* ========================================================= */}

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

        <div className="mb-5">

          <h2 className="text-sm font-semibold sm:text-base">
            Recommended Next Steps
          </h2>

          <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
            Improve your career graph with focused learning
          </p>

        </div>

        <div className="grid gap-3 md:grid-cols-3">

          <RecommendationCard
            title="Improve SQL"
            description="Strengthen an important skill"
            href="/skills"
            icon={<TrendingUp size={18} />}
          />

          <RecommendationCard
            title="Learn System Design"
            description="Your current priority skill gap"
            href="/skill-gap"
            icon={<Target size={18} />}
          />

          <RecommendationCard
            title="Explore DevOps"
            description="Discover a new career path"
            href="/jobs"
            icon={<Sparkles size={18} />}
          />

        </div>

      </section>

    </div>
  );
}

/* =============================================================== */
/* STAT CARD */
/* =============================================================== */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  type,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  type: "purple" | "blue" | "orange" | "green";
}) {
  const styles = {
    purple:
      "bg-violet-500/10 text-violet-400",

    blue:
      "bg-blue-500/10 text-blue-400",

    orange:
      "bg-orange-500/10 text-orange-400",

    green:
      "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-[11px] text-zinc-500 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[10px] text-emerald-400 sm:text-[11px]">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${styles[type]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =============================================================== */
/* APPLICATION STAT CARD */
/* =============================================================== */

function ApplicationStatCard({
  title,
  value,
  type,
}: {
  title: string;
  value: number;
  type:
    | "purple"
    | "blue"
    | "orange"
    | "green"
    | "red";
}) {
  const styles = {
    purple:
      "bg-violet-500/10 text-violet-400",

    blue:
      "bg-blue-500/10 text-blue-400",

    orange:
      "bg-orange-500/10 text-orange-400",

    green:
      "bg-emerald-500/10 text-emerald-400",

    red:
      "bg-red-500/10 text-red-400",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-[10px] text-zinc-500 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 text-xl font-semibold sm:text-2xl">
            {value}
          </p>

        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[type]}`}
        >
          <TrendingUp size={16} />
        </div>

      </div>

    </div>
  );
}

/* =============================================================== */
/* JOB MATCH */
/* =============================================================== */

function JobMatchRow({
  job,
}: {
  job: Match;
}) {
  return (
    <Link
      href={`/jobs?jobId=${job.jobId}`}
      className="group block"
    >

      <div className="mb-2 flex items-end justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-xs font-medium sm:text-sm">
            {job.jobTitle}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-zinc-600 sm:text-[11px]">
            {job.company}
          </p>

        </div>

        <span className="shrink-0 text-xs font-semibold text-violet-400">
          {job.matchScore}%
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-700 group-hover:bg-violet-400"
          style={{
            width: `${Math.min(
              Math.max(job.matchScore, 0),
              100
            )}%`,
          }}
        />

      </div>

    </Link>
  );
}

/* =============================================================== */
/* SKILLS PROGRESS */
/* =============================================================== */

function SkillsProgress({
  total,
  strong,
  average,
  weak,
}: {
  total: number;
  strong: number;
  average: number;
  weak: number;
}) {
  const strongPercent = total
    ? (strong / total) * 100
    : 0;

  const averagePercent = total
    ? ((strong + average) / total) * 100
    : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

      <div className="mb-4">

        <h2 className="text-sm font-semibold sm:text-base">
          Skills Progress
        </h2>

        <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
          Your current skill distribution
        </p>

      </div>

      <div className="flex flex-col items-center justify-center gap-5 py-4 sm:flex-row sm:gap-7">

        <div
          className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(
              #22c55e 0 ${strongPercent}%,
              #3b82f6 ${strongPercent}% ${averagePercent}%,
              #f59e0b ${averagePercent}% 100%
            )`,
          }}
        >

          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0d1119]">

            <span className="text-3xl font-bold">
              {total}
            </span>

            <span className="text-[10px] text-zinc-600">
              Total Skills
            </span>

          </div>

        </div>

        <div className="w-full max-w-[170px] space-y-3">

          <SkillLegend
            label="Strong"
            value={strong}
            className="bg-emerald-500"
          />

          <SkillLegend
            label="Average"
            value={average}
            className="bg-blue-500"
          />

          <SkillLegend
            label="Weak"
            value={weak}
            className="bg-orange-500"
          />

        </div>

      </div>

    </div>
  );
}

/* =============================================================== */
/* SKILL LEGEND */
/* =============================================================== */

function SkillLegend({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">

      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${className}`}
        />

        <span className="text-zinc-400">
          {label}
        </span>

      </div>

      <span className="font-medium">
        {value}
      </span>

    </div>
  );
}

/* =============================================================== */
/* SKILL GAP */
/* =============================================================== */

function SkillGapCard({
  gap,
}: {
  gap: SkillGap;
}) {
  return (
    <Link
      href="/skill-gap"
      className="group rounded-xl border border-white/10 bg-white/[0.015] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
    >

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-xs font-medium sm:text-sm">
            {gap.skillName}
          </p>

          <p className="mt-1 text-[10px] text-zinc-600 sm:text-[11px]">
            {gap.category}
          </p>

        </div>

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
          <Target size={14} />
        </div>

      </div>

    </Link>
  );
}

/* =============================================================== */
/* APPLICATION */
/* =============================================================== */

function ApplicationCard({
  application,
}: {
  application: Application;
}) {
  return (
    <Link
      href={`/jobs?jobId=${application.jobId}`}
      className="rounded-xl border border-white/10 bg-white/[0.015] p-4 transition hover:border-violet-500/30 hover:bg-white/[0.03]"
    >

      <p className="truncate text-xs font-medium sm:text-sm">
        {application.jobTitle}
      </p>

      <p className="mt-1 truncate text-[10px] text-zinc-600 sm:text-[11px]">
        {application.company}
      </p>

      <StatusBadge
        status={application.status}
      />

    </Link>
  );
}

/* =============================================================== */
/* STATUS BADGE */
/* =============================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalizedStatus =
    status.toLowerCase();

  let className =
    "bg-violet-500/10 text-violet-400";

  if (normalizedStatus === "applied") {
    className =
      "bg-emerald-500/10 text-emerald-400";
  }

  if (normalizedStatus === "shortlisted") {
    className =
      "bg-violet-500/10 text-violet-400";
  }

  if (
    normalizedStatus === "interview" ||
    normalizedStatus ===
      "interview scheduled"
  ) {
    className =
      "bg-blue-500/10 text-blue-400";
  }

  if (normalizedStatus === "offer") {
    className =
      "bg-orange-500/10 text-orange-400";
  }

  if (normalizedStatus === "selected") {
    className =
      "bg-emerald-500/10 text-emerald-400";
  }

  if (normalizedStatus === "rejected") {
    className =
      "bg-red-500/10 text-red-400";
  }

  return (
    <span
      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {status}
    </span>
  );
}

/* =============================================================== */
/* RECOMMENDATION */
/* =============================================================== */

function RecommendationCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.015] p-3 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04] sm:p-4"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="truncate text-xs font-medium sm:text-sm">
          {title}
        </p>

        <p className="mt-1 truncate text-[10px] text-zinc-600 sm:text-[11px]">
          {description}
        </p>

      </div>

      <ArrowRight
        size={15}
        className="ml-auto shrink-0 text-zinc-700 transition group-hover:text-violet-400"
      />

    </Link>
  );
}

/* =============================================================== */
/* LOADING */
/* =============================================================== */

function LoadingState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">

      <div className="text-center">

        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

        <p className="mt-4 text-sm text-zinc-500">
          Loading your career dashboard...
        </p>

        <p className="mt-1 text-[10px] text-zinc-700">
          Fetching live application data
        </p>

      </div>

    </div>
  );
}

/* =============================================================== */
/* ERROR */
/* =============================================================== */

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">

      <div className="max-w-sm rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">

        <CircleAlert
          size={30}
          className="mx-auto text-red-400"
        />

        <h2 className="mt-4 text-sm font-semibold">
          Error
        </h2>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {message ||
            "Something went wrong while loading your data."}
        </p>

      </div>

    </div>
  );
}