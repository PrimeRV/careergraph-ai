"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  MapPin,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import AppShell from "../components/AppShell";

const STUDENT_ID = "student-001";

type Skill = {
  id: string;
  name: string;
  category?: string;
};

type Job = {
  id: string;
  title: string;
  company: string;
  level?: string;
  location?: string;
  description?: string;
  matchScore?: number;
  requiredSkills?: Skill[];
  matchedSkills?: Skill[];
};

type JobsResponse = {
  success: boolean;
  jobs?: Job[];
};

type CareerMatch = {
  jobId: string;
  jobTitle: string;
  company: string;
  level?: string;
  location?: string;
  matchScore: number;
  requiredSkills?: Skill[];
  matchedSkills?: Skill[];
};

type CareerMatchResponse = {
  success: boolean;
  studentId: string;
  matches: CareerMatch[];
};

type Application = {
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
};

type DashboardResponse = {
  success: boolean;
  applications?: Application[];
};

/* ============================================================= */
/* PAGE */
/* ============================================================= */

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] =
    useState<Job | null>(null);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [location, setLocation] =
    useState("All");

  /* =========================================================== */
  /* LOAD DATA */
  /* =========================================================== */

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const [
          jobsResponse,
          matchResponse,
          dashboardResponse,
        ] = await Promise.all([
          fetch("/api/jobs", {
            cache: "no-store",
          }),

          fetch(
            `/api/career-match?studentId=${STUDENT_ID}`,
            {
              cache: "no-store",
            }
          ),

          fetch(
            `/api/dashboard?studentId=${STUDENT_ID}`,
            {
              cache: "no-store",
            }
          ),
        ]);

        if (!jobsResponse.ok) {
          throw new Error(
            "Failed to load jobs"
          );
        }

        if (!matchResponse.ok) {
          throw new Error(
            "Failed to load career matches"
          );
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            "Failed to load application data"
          );
        }

        const jobsData: JobsResponse =
          await jobsResponse.json();

        const matchData: CareerMatchResponse =
          await matchResponse.json();

        const dashboardData: DashboardResponse =
          await dashboardResponse.json();

        if (!jobsData.success) {
          throw new Error(
            "Jobs API returned an error"
          );
        }

        if (!matchData.success) {
          throw new Error(
            "Career match API returned an error"
          );
        }

        if (!dashboardData.success) {
          throw new Error(
            "Dashboard API returned an error"
          );
        }

        setApplications(
          dashboardData.applications ?? []
        );

        const baseJobs =
          jobsData.jobs ?? [];

        const matches =
          matchData.matches ?? [];

        /*
         * Create career-match lookup.
         */
        const matchMap =
          new Map<string, CareerMatch>();

        for (const match of matches) {
          matchMap.set(
            match.jobId,
            match
          );
        }

        /*
         * Merge Jobs API with Career Match API.
         */
        const mergedJobs: Job[] =
          baseJobs.map((job) => {
            const match =
              matchMap.get(job.id);

            if (!match) {
              return {
                ...job,

                matchScore:
                  typeof job.matchScore ===
                  "number"
                    ? job.matchScore
                    : 0,

                requiredSkills:
                  job.requiredSkills ?? [],

                matchedSkills:
                  job.matchedSkills ?? [],
              };
            }

            return {
              ...job,

              /*
               * Career Match is source of truth
               * for match score.
               */
              matchScore:
                match.matchScore,

              requiredSkills:
                match.requiredSkills ??
                job.requiredSkills ??
                [],

              matchedSkills:
                match.matchedSkills ??
                job.matchedSkills ??
                [],

              title:
                job.title ||
                match.jobTitle,

              company:
                job.company ||
                match.company,

              level:
                job.level ||
                match.level,

              location:
                job.location ||
                match.location,
            };
          });

        /*
         * Add career-match jobs missing from
         * /api/jobs.
         */
        const existingJobIds =
          new Set(
            mergedJobs.map(
              (job) => job.id
            )
          );

        for (const match of matches) {
          if (
            !existingJobIds.has(
              match.jobId
            )
          ) {
            mergedJobs.push({
              id: match.jobId,

              title:
                match.jobTitle,

              company:
                match.company,

              level:
                match.level,

              location:
                match.location,

              matchScore:
                match.matchScore,

              requiredSkills:
                match.requiredSkills ??
                [],

              matchedSkills:
                match.matchedSkills ??
                [],
            });
          }
        }

        /*
         * Highest matches first.
         */
        mergedJobs.sort(
          (a, b) =>
            getMatchScore(b) -
            getMatchScore(a)
        );

        setJobs(mergedJobs);

        /*
         * Default selection.
         */
        if (
          mergedJobs.length > 0
        ) {
          setSelectedJob(
            mergedJobs[0]
          );
        }
      } catch (err) {
        console.error(
          "Failed to load jobs:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load jobs."
        );
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  /* =========================================================== */
  /* DEEP LINK */
  /* =========================================================== */

  useEffect(() => {
    if (!jobs.length) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const jobId =
      params.get("jobId");

    if (!jobId) {
      return;
    }

    const requestedJob =
      jobs.find(
        (job) =>
          job.id === jobId
      );

    if (requestedJob) {
      setSelectedJob(
        requestedJob
      );
    }
  }, [jobs]);

  /* =========================================================== */
  /* LOCATIONS */
  /* =========================================================== */

  const locations = useMemo(() => {
    const values = jobs
      .map(
        (job) => job.location
      )
      .filter(Boolean) as string[];

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];
  }, [jobs]);

  /* =========================================================== */
  /* FILTERED JOBS */
  /* =========================================================== */

  const filteredJobs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return jobs.filter(
        (job) => {
          const matchesSearch =
            !query ||
            job.title
              .toLowerCase()
              .includes(query) ||
            job.company
              .toLowerCase()
              .includes(query);

          const matchesLocation =
            location === "All" ||
            job.location ===
              location;

          return (
            matchesSearch &&
            matchesLocation
          );
        }
      );
    }, [
      jobs,
      search,
      location,
    ]);

  /* =========================================================== */
  /* APPLIED IDS */
  /* =========================================================== */

  const appliedJobIds =
    useMemo(() => {
      return new Set(
        applications
          .filter(
            (application) =>
              application.status !==
              "Rejected"
          )
          .map(
            (application) =>
              application.jobId
          )
      );
    }, [applications]);

  /* =========================================================== */
  /* STATS */
  /* =========================================================== */

  const highMatches =
    jobs.filter(
      (job) =>
        getMatchScore(job) >= 80
    ).length;

  const goodMatches =
    jobs.filter(
      (job) =>
        getMatchScore(job) >= 60 &&
        getMatchScore(job) < 80
    ).length;

  const appliedJobs =
    jobs.filter(
      (job) =>
        appliedJobIds.has(
          job.id
        )
    ).length;

  /* =========================================================== */
  /* LOADING */
  /* =========================================================== */

  if (loading) {
    return (
      <AppShell active="Jobs">
        <LoadingState />
      </AppShell>
    );
  }

  /* =========================================================== */
  /* ERROR */
  /* =========================================================== */

  if (error) {
    return (
      <AppShell active="Jobs">
        <ErrorState
          message={error}
        />
      </AppShell>
    );
  }

  /* =========================================================== */
  /* UI */
  /* =========================================================== */

  return (
    <AppShell
      active="Jobs"
      searchPlaceholder="Search jobs, companies..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-8">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="mb-1 text-xs font-medium text-violet-400 sm:text-sm">
                Career Opportunities
              </p>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Job Explorer
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                Discover jobs that match your
                current skills and career profile.
              </p>
            </div>

            <Link
              href="/career-match"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-zinc-400 transition hover:border-violet-500/30 hover:text-white"
            >
              <Target size={14} />

              Career Matches

              <ArrowRight size={13} />
            </Link>

          </div>
        </section>

        {/* ===================================================== */}
        {/* STATS */}
        {/* ===================================================== */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <JobStat
            title="Available Jobs"
            value={jobs.length}
            icon={
              <BriefcaseBusiness
                size={18}
              />
            }
          />

          <JobStat
            title="High Matches"
            value={highMatches}
            icon={
              <Target size={18} />
            }
          />

          <JobStat
            title="Good Matches"
            value={goodMatches}
            icon={
              <Sparkles
                size={18}
              />
            }
          />

          <JobStat
            title="Applied Jobs"
            value={appliedJobs}
            icon={
              <CheckCircle2
                size={18}
              />
            }
          />

        </section>

        {/* ===================================================== */}
        {/* SEARCH / FILTERS */}
        {/* ===================================================== */}

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">

              <Search
                size={16}
                className="shrink-0 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search job title or company..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="text-zinc-600 transition hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {locations.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setLocation(
                        item
                      )
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs transition ${
                      location === item
                        ? "bg-violet-600 text-white"
                        : "border border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            </div>

          </div>

        </section>

        {/* ===================================================== */}
        {/* MAIN */}
        {/* ===================================================== */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">

          {/* =================================================== */}
          {/* JOB LIST */}
          {/* =================================================== */}

          <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div>
                <h2 className="text-sm font-semibold sm:text-base">
                  Recommended Jobs
                </h2>

                <p className="mt-1 text-[11px] text-zinc-600">
                  Based on your current career graph
                </p>
              </div>

              <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-500">
                {filteredJobs.length} jobs
              </span>

            </div>

            <div className="space-y-2">

              {filteredJobs.map(
                (job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() =>
                      setSelectedJob(
                        job
                      )
                    }
                    className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                      selectedJob?.id ===
                      job.id
                        ? "border-violet-500/40 bg-violet-500/[0.06]"
                        : "border-white/5 bg-white/[0.015] hover:border-violet-500/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <JobListItem
                      job={job}
                      applied={appliedJobIds.has(
                        job.id
                      )}
                    />
                  </button>
                )
              )}

              {filteredJobs.length ===
                0 && (
                <EmptyState
                  onClear={() => {
                    setSearch("");
                    setLocation(
                      "All"
                    );
                  }}
                />
              )}

            </div>
          </div>

          {/* =================================================== */}
          {/* DETAILS */}
          {/* =================================================== */}

          <JobDetails
            job={selectedJob}
            appliedJobIds={
              appliedJobIds
            }
            onApplied={(jobId) => {
              setApplications(
                (current) => {
                  if (
                    current.some(
                      (application) =>
                        application.jobId ===
                        jobId
                    )
                  ) {
                    return current;
                  }

                  const job =
                    jobs.find(
                      (item) =>
                        item.id ===
                        jobId
                    );

                  if (!job) {
                    return current;
                  }

                  return [
                    ...current,
                    {
                      jobId,
                      jobTitle:
                        job.title,
                      company:
                        job.company,
                      status:
                        "Applied",
                    },
                  ];
                }
              );
            }}
          />

        </section>
      </div>
    </AppShell>
  );
}

/* ============================================================= */
/* STAT */
/* ============================================================= */

function JobStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-[10px] text-zinc-500 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* ============================================================= */
/* JOB LIST ITEM */
/* ============================================================= */

function JobListItem({
  job,
  applied,
}: {
  job: Job;
  applied: boolean;
}) {
  const score =
    getMatchScore(job);

  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <Building2 size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-xs font-medium sm:text-sm">
          {job.title}
        </p>

        <p className="mt-1 truncate text-[10px] text-zinc-600 sm:text-[11px]">
          {job.company}

          {job.location
            ? ` • ${job.location}`
            : ""}
        </p>

        {applied && (
          <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-400">
            <CheckCircle2 size={10} />
            Applied
          </div>
        )}

      </div>

      <div className="shrink-0 text-right">

        <p
          className={`text-xs font-semibold ${
            score >= 80
              ? "text-emerald-400"
              : score >= 60
                ? "text-violet-400"
                : "text-orange-400"
          }`}
        >
          {score}%
        </p>

        <p className="mt-0.5 text-[9px] text-zinc-700">
          match
        </p>

      </div>

    </div>
  );
}

/* ============================================================= */
/* JOB DETAILS */
/* ============================================================= */

function JobDetails({
  job,
  appliedJobIds,
  onApplied,
}: {
  job: Job | null;
  appliedJobIds: Set<string>;
  onApplied: (
    jobId: string
  ) => void;
}) {
  const [applying, setApplying] =
    useState(false);

  const [applicationError, setApplicationError] =
    useState("");

  const applied = job
    ? appliedJobIds.has(job.id)
    : false;

  async function handleApply() {
    if (
      !job ||
      applying ||
      applied
    ) {
      return;
    }

    try {
      setApplying(true);
      setApplicationError("");

      const response =
        await fetch(
          "/api/applications",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              studentId:
                STUDENT_ID,

              jobId: job.id,

              status:
                "Applied",
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to apply"
        );
      }

      onApplied(job.id);
    } catch (error) {
      console.error(
        error
      );

      setApplicationError(
        error instanceof Error
          ? error.message
          : "Failed to apply for this job."
      );
    } finally {
      setApplying(false);
    }
  }

  if (!job) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-white/10 bg-[#0d1119] p-6 text-center">

        <div>

          <BriefcaseBusiness
            size={32}
            className="mx-auto mb-3 text-zinc-700"
          />

          <p className="text-sm text-zinc-500">
            Select a job
          </p>

          <p className="mt-1 text-xs text-zinc-700">
            Job details will appear here
          </p>

        </div>

      </div>
    );
  }

  const score =
    getMatchScore(job);

  const requiredSkills =
    job.requiredSkills ?? [];

  const matchedSkills =
    job.matchedSkills ?? [];

  const matchedIds =
    new Set(
      matchedSkills.map(
        (skill) => skill.id
      )
    );

  const missingCount =
    requiredSkills.filter(
      (skill) =>
        !matchedIds.has(
          skill.id
        )
    ).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-6">

      {/* ======================================================= */}
      {/* TITLE */}
      {/* ======================================================= */}

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <Building2 size={22} />
        </div>

        <div className="min-w-0 flex-1">

          <h2 className="text-lg font-semibold sm:text-xl">
            {job.title}
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            {job.company}
          </p>

        </div>

        <div
          className={`rounded-xl px-3 py-2 text-center ${
            score >= 80
              ? "bg-emerald-500/10"
              : score >= 60
                ? "bg-violet-500/10"
                : "bg-orange-500/10"
          }`}
        >

          <p
            className={`text-lg font-bold ${
              score >= 80
                ? "text-emerald-400"
                : score >= 60
                  ? "text-violet-400"
                  : "text-orange-400"
            }`}
          >
            {score}%
          </p>

          <p className="text-[9px] text-zinc-600">
            Match
          </p>

        </div>

      </div>

      {/* ======================================================= */}
      {/* META */}
      {/* ======================================================= */}

      <div className="mt-6 grid grid-cols-2 gap-3">

        <MetaCard
          label="Level"
          value={
            job.level ||
            "Not specified"
          }
        />

        <MetaCard
          label="Location"
          value={
            job.location ||
            "Not specified"
          }
        />

      </div>

      {/* ======================================================= */}
      {/* DESCRIPTION */}
      {/* ======================================================= */}

      {job.description && (
        <div className="mt-6">

          <h3 className="mb-2 text-xs font-semibold">
            About the Role
          </h3>

          <p className="text-xs leading-6 text-zinc-500">
            {job.description}
          </p>

        </div>
      )}

      {/* ======================================================= */}
      {/* SCORE */}
      {/* ======================================================= */}

      <div className="mt-6">

        <div className="mb-2 flex items-center justify-between">

          <p className="text-xs text-zinc-500">
            Career Match
          </p>

          <p className="text-xs font-medium text-violet-400">
            {score}%
          </p>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">

          <div
            className={`h-full rounded-full transition-all ${
              score >= 80
                ? "bg-emerald-500"
                : score >= 60
                  ? "bg-violet-500"
                  : "bg-orange-500"
            }`}
            style={{
              width: `${score}%`,
            }}
          />

        </div>

      </div>

      {/* ======================================================= */}
      {/* SKILLS SUMMARY */}
      {/* ======================================================= */}

      <div className="mt-6 grid grid-cols-2 gap-3">

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3">

          <p className="text-[10px] text-zinc-600">
            Matched Skills
          </p>

          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {matchedSkills.length}
          </p>

        </div>

        <div className="rounded-xl border border-orange-500/10 bg-orange-500/[0.03] p-3">

          <p className="text-[10px] text-zinc-600">
            Skills to Develop
          </p>

          <p className="mt-1 text-lg font-semibold text-orange-400">
            {missingCount}
          </p>

        </div>

      </div>

      {/* ======================================================= */}
      {/* REQUIRED SKILLS */}
      {/* ======================================================= */}

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <h3 className="text-xs font-semibold">
            Required Skills
          </h3>

          <span className="text-[10px] text-zinc-600">
            {requiredSkills.length} skills
          </span>

        </div>

        {requiredSkills.length ===
        0 ? (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-600">
            Skill requirements not available.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">

            {requiredSkills.map(
              (skill) => {
                const matched =
                  matchedIds.has(
                    skill.id
                  );

                return (
                  <div
                    key={skill.id}
                    className={`flex items-center gap-2 rounded-lg border p-3 ${
                      matched
                        ? "border-emerald-500/10 bg-emerald-500/[0.03]"
                        : "border-orange-500/10 bg-orange-500/[0.025]"
                    }`}
                  >

                    <CheckCircle2
                      size={14}
                      className={`shrink-0 ${
                        matched
                          ? "text-emerald-400"
                          : "text-zinc-700"
                      }`}
                    />

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[11px] font-medium">
                        {skill.name}
                      </p>

                      {skill.category && (
                        <p className="mt-0.5 truncate text-[9px] text-zinc-700">
                          {skill.category}
                        </p>
                      )}

                    </div>

                    <span
                      className={`text-[9px] ${
                        matched
                          ? "text-emerald-400"
                          : "text-orange-400"
                      }`}
                    >
                      {matched
                        ? "Matched"
                        : "Missing"}
                    </span>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* ======================================================= */}
      {/* ACTIONS */}
      {/* ======================================================= */}

      <div className="mt-6">

        <div className="flex flex-col gap-2 sm:flex-row">

          <button
            type="button"
            onClick={
              handleApply
            }
            disabled={
              applying ||
              applied
            }
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition ${
              applied
                ? "cursor-default bg-emerald-500/10 text-emerald-400"
                : applying
                  ? "cursor-wait bg-violet-600/50 text-white"
                  : "bg-violet-600 text-white hover:bg-violet-500"
            }`}
          >

            {applied ? (
              <>
                <CheckCircle2
                  size={14}
                />

                Applied
              </>
            ) : applying ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Applying...
              </>
            ) : (
              <>
                Apply / Track Job

                <ArrowRight
                  size={14}
                />
              </>
            )}

          </button>

          <Link
            href="/career-match"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            View Career Match
          </Link>

        </div>

        {applicationError && (
          <p className="mt-3 text-center text-[11px] text-red-400">
            {applicationError}
          </p>
        )}

        {applied && (
          <p className="mt-3 text-center text-[11px] text-emerald-400">
            Application saved successfully.
            You can track it from your dashboard.
          </p>
        )}

      </div>

    </div>
  );
}

/* ============================================================= */
/* META */
/* ============================================================= */

function MetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">

      <p className="text-[9px] uppercase tracking-wide text-zinc-700">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {label ===
          "Location" && (
          <MapPin
            size={13}
            className="shrink-0 text-violet-400"
          />
        )}

        <p className="truncate text-xs text-zinc-400">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ============================================================= */
/* SCORE */
/* ============================================================= */

function getMatchScore(
  job: Job
) {
  if (
    typeof job.matchScore ===
    "number"
  ) {
    return Math.max(
      0,
      Math.min(
        100,
        job.matchScore
      )
    );
  }

  const required =
    job.requiredSkills
      ?.length ?? 0;

  const matched =
    job.matchedSkills
      ?.length ?? 0;

  if (required > 0) {
    return Math.round(
      (matched / required) *
        100
    );
  }

  return 0;
}

/* ============================================================= */
/* EMPTY */
/* ============================================================= */

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">

      <Search
        size={25}
        className="mx-auto text-zinc-700"
      />

      <p className="mt-3 text-xs text-zinc-500">
        No jobs found
      </p>

      <p className="mt-1 text-[10px] text-zinc-700">
        Try changing your search or location.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-medium text-white transition hover:bg-violet-500"
      >
        Clear Filters
      </button>

    </div>
  );
}

/* ============================================================= */
/* LOADING */
/* ============================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">

      <div className="text-center">

        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

        <p className="mt-4 text-xs text-zinc-500">
          Loading jobs...
        </p>

      </div>

    </div>
  );
}

/* ============================================================= */
/* ERROR */
/* ============================================================= */

function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">

      <div className="max-w-sm rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">

        <BriefcaseBusiness
          size={28}
          className="mx-auto text-red-400"
        />

        <p className="mt-4 text-sm font-semibold">
          Jobs unavailable
        </p>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {message}
        </p>

      </div>

    </div>
  );
}