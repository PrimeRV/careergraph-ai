"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Cloud,
  Code2,
  Container,
  GitBranch,
  Home,
  Layers3,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

const DEFAULT_STUDENT_ID = "student-001";
const DEFAULT_JOB_ID = "job-001";

type SkillGap = {
  skillId: string;
  skillName: string;
  category: string;
};

type SkillGapResponse = {
  success: boolean;
  studentId?: string;
  skillGap?: unknown;
  totalGaps?: number;
};

type Priority = "High" | "Medium" | "Recommended";

export default function SkillGapPage() {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSkillGaps() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams(window.location.search);

        const studentId =
          params.get("studentId") || DEFAULT_STUDENT_ID;

        const jobId =
          params.get("jobId") || DEFAULT_JOB_ID;

        const response = await fetch(
          `/api/skill-gap?studentId=${encodeURIComponent(
            studentId
          )}&jobId=${encodeURIComponent(jobId)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load skill gaps (${response.status})`
          );
        }

        const data: SkillGapResponse = await response.json();

        if (!data.success) {
          throw new Error(
            "Skill Gap API returned an error"
          );
        }

        const safeSkillGaps = normalizeSkillGaps(
          data.skillGap
        );

        if (!cancelled) {
          setSkillGaps(safeSkillGaps);
        }
      } catch (err) {
        console.error("Skill gap error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load skill gaps."
          );

          setSkillGaps([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSkillGaps();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    const query = String(search ?? "")
      .trim()
      .toLowerCase();

    if (!query) {
      return skillGaps;
    }

    return skillGaps.filter((skill) => {
      const skillName = String(
        skill?.skillName ?? ""
      ).toLowerCase();

      const category = String(
        skill?.category ?? ""
      ).toLowerCase();

      return (
        skillName.includes(query) ||
        category.includes(query)
      );
    });
  }, [skillGaps, search]);

  const categoryCount = useMemo(() => {
    const categories = skillGaps
      .map((skill) =>
        String(skill?.category ?? "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

    return new Set(categories).size;
  }, [skillGaps]);

  const careerImpact =
    skillGaps.length === 0
      ? "Low"
      : skillGaps.length <= 2
        ? "High"
        : skillGaps.length <= 5
          ? "Medium"
          : "High";

  if (loading) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#09090f] text-white">
      <div className="flex min-h-screen">
        {/* ===================================================== */}
        {/* SIDEBAR */}
        {/* ===================================================== */}

        <aside className="hidden w-[255px] shrink-0 border-r border-white/10 bg-[#0b0b12] lg:flex lg:flex-col">
          <div className="px-5 pt-6">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20">
                <GitBranch size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  CareerGraph AI
                </p>

                <p className="text-[11px] text-zinc-500">
                  Career Intelligence
                </p>
              </div>
            </Link>
          </div>

          <nav className="mt-8 space-y-1 px-4">
            <SidebarLink
              href="/"
              label="Dashboard"
              icon={<Home size={18} />}
            />

            <SidebarLink
              href="/skills"
              label="Skills"
              icon={<Sparkles size={18} />}
            />

            <SidebarLink
              href="/jobs"
              label="Jobs"
              icon={<Layers3 size={18} />}
            />

            <SidebarLink
              href="/career-match"
              label="Career Match"
              icon={<Target size={18} />}
            />

            <SidebarLink
              href="/skill-gap"
              label="Skill Gap"
              icon={<TrendingUp size={18} />}
              active
            />

            <SidebarLink
              href="/graph"
              label="Graph Explorer"
              icon={<GitBranch size={18} />}
            />
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <p className="text-[10px] text-zinc-500">
                Career Profile
              </p>

              <p className="mt-1 text-sm font-medium">
                Rohit Verma
              </p>

              <p className="mt-1 text-[11px] text-zinc-600">
                Computer Science Student
              </p>
            </div>
          </div>
        </aside>

        {/* ===================================================== */}
        {/* MAIN */}
        {/* ===================================================== */}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#09090f]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>

              <div className="min-w-0">
                <p className="text-[10px] text-violet-400 sm:text-xs">
                  Career Intelligence
                </p>

                <h2 className="truncate text-sm font-semibold sm:text-base">
                  Skill Gap
                </h2>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden w-[320px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 md:flex">
              <Search
                size={16}
                className="shrink-0 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search skills..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-zinc-600 transition hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1450px] p-4 sm:p-6 lg:p-8">
            {/* MOBILE SEARCH */}

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 md:hidden">
              <Search
                size={16}
                className="shrink-0 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search skills..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-zinc-600 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* PAGE HEADING */}

            <section className="mb-7">
              <p className="mb-1 text-xs font-medium text-violet-400 sm:text-sm">
                Career Development
              </p>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Your Skill Gaps
                  </h1>

                  <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                    Skills you can develop to unlock more
                    career opportunities and improve your
                    job matches.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/career-match"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs text-zinc-400 transition hover:border-violet-500/30 hover:text-white"
                  >
                    <Target size={14} />
                    Career Match
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    href="/skills"
                    className="hidden items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500 sm:inline-flex"
                  >
                    Explore Skills
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </section>

            {/* SUMMARY */}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard
                title="Skills To Develop"
                value={skillGaps.length}
                subtitle="Identified from your career graph"
                icon={<Target size={19} />}
              />

              <SummaryCard
                title="Skill Categories"
                value={categoryCount}
                subtitle="Areas to strengthen"
                icon={<Layers3 size={19} />}
              />

              <SummaryCard
                title="Career Impact"
                value={careerImpact}
                subtitle="Potential to improve matches"
                icon={<TrendingUp size={19} />}
              />
            </section>

            {/* ERROR */}

            {!loading && error && (
              <ErrorState message={error} />
            )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              skillGaps.length === 0 && (
                <EmptyGapState />
              )}

            {/* DATA */}

            {!loading &&
              !error &&
              skillGaps.length > 0 && (
                <>
                  {/* PRIORITY BANNER */}

                  <section className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.045] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                          <Sparkles size={19} />
                        </div>

                        <div>
                          <h2 className="text-sm font-semibold sm:text-base">
                            Close your skill gaps
                          </h2>

                          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-zinc-500 sm:text-xs">
                            Learning these skills can improve
                            your compatibility with more career
                            opportunities.
                          </p>
                        </div>
                      </div>

                      <span className="w-fit shrink-0 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[10px] text-violet-300 sm:text-xs">
                        {skillGaps.length}{" "}
                        {skillGaps.length === 1
                          ? "skill"
                          : "skills"}{" "}
                        identified
                      </span>
                    </div>
                  </section>

                  {/* SKILLS */}

                  <section className="mt-7">
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold sm:text-lg">
                          Skills To Learn
                        </h2>

                        <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                          Based on your current career graph
                        </p>
                      </div>

                      <span className="text-[10px] text-zinc-600 sm:text-xs">
                        {filteredSkills.length} results
                      </span>
                    </div>

                    {filteredSkills.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredSkills.map(
                          (skill, index) => (
                            <SkillGapCard
                              key={`${skill.skillId}-${index}`}
                              skill={skill}
                              priority={getPriority(index)}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-10 text-center">
                        <Search
                          size={28}
                          className="mx-auto text-zinc-700"
                        />

                        <p className="mt-3 text-sm text-zinc-400">
                          No skills found
                        </p>

                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-4 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </section>

                  {/* LEARNING PATH */}

                  <section className="mt-7 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5 lg:p-6">
                    <div className="mb-5">
                      <h2 className="text-base font-semibold sm:text-lg">
                        Recommended Learning Path
                      </h2>

                      <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                        A simple progression for closing your
                        career gaps.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <LearningStep
                        step="01"
                        title="Build Foundations"
                        description="Strengthen programming, backend and cloud fundamentals."
                      />

                      <LearningStep
                        step="02"
                        title="Practice Projects"
                        description="Apply new skills through practical projects and real-world problems."
                      />

                      <LearningStep
                        step="03"
                        title="Target Jobs"
                        description="Recheck your career matches after improving your skills."
                      />
                    </div>
                  </section>

                  {/* NEXT ACTION */}

                  <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                      <p className="text-sm font-medium">
                        Ready to improve your career match?
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-600">
                        Explore jobs and see which roles become
                        available as you close your skill gaps.
                      </p>
                    </div>

                    <Link
                      href="/jobs"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
                    >
                      Explore Jobs
                      <ArrowRight size={14} />
                    </Link>
                  </section>
                </>
              )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================= */
/* NORMALIZE API DATA */
/* ============================================================= */

function normalizeSkillGaps(
  value: unknown
): SkillGap[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index): SkillGap | null => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const record =
        item as Record<string, unknown>;

      const skillId = String(
        record.skillId ??
          record.id ??
          `skill-gap-${index}`
      );

      const skillName = String(
        record.skillName ??
          record.name ??
          "Unknown Skill"
      ).trim();

      const category = String(
        record.category ??
          "General"
      ).trim();

      return {
        skillId,
        skillName:
          skillName || "Unknown Skill",
        category:
          category || "General",
      };
    })
    .filter(
      (skill): skill is SkillGap =>
        skill !== null
    );
}

/* ============================================================= */
/* SIDEBAR LINK */
/* ============================================================= */

function SidebarLink({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

/* ============================================================= */
/* SUMMARY CARD */
/* ============================================================= */

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 sm:text-xs">
            {title}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-zinc-700 sm:text-[10px]">
            {subtitle}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 sm:h-10 sm:w-10">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* SKILL GAP CARD */
/* ============================================================= */

function SkillGapCard({
  skill,
  priority,
}: {
  skill: SkillGap;
  priority: Priority;
}) {
  const icon = getSkillIcon(skill.category);

  const priorityClass =
    priority === "High"
      ? "bg-red-500/10 text-red-300 border-red-500/10"
      : priority === "Medium"
        ? "bg-amber-500/10 text-amber-300 border-amber-500/10"
        : "bg-violet-500/10 text-violet-300 border-violet-500/10";

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#0d1119] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.025] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 sm:h-11 sm:w-11">
          {icon}
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] sm:text-[10px] ${priorityClass}`}
        >
          {priority}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold sm:text-base">
          {skill.skillName || "Unknown Skill"}
        </h3>

        <p className="mt-1 text-[10px] text-zinc-600 sm:text-xs">
          {skill.category || "General"}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-[10px] text-zinc-600 sm:text-xs">
          <BookOpen size={13} />
          Skill gap
        </div>

        <Link
          href={`/skills?skill=${encodeURIComponent(
            skill.skillName || ""
          )}`}
          className="flex items-center gap-1 text-[10px] text-violet-400 transition hover:text-violet-300 sm:text-xs"
        >
          Learn
          <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

/* ============================================================= */
/* LEARNING STEP */
/* ============================================================= */

function LearningStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4 transition hover:border-violet-500/20">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-semibold text-violet-400">
          {step}
        </span>

        <h3 className="text-xs font-medium sm:text-sm">
          {title}
        </h3>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-zinc-600 sm:text-xs">
        {description}
      </p>
    </div>
  );
}

/* ============================================================= */
/* PRIORITY */
/* ============================================================= */

function getPriority(index: number): Priority {
  if (index < 2) {
    return "High";
  }

  if (index < 4) {
    return "Medium";
  }

  return "Recommended";
}

/* ============================================================= */
/* ICON */
/* ============================================================= */

function getSkillIcon(category?: string) {
  const normalized = String(
    category ?? ""
  ).toLowerCase();

  if (normalized.includes("cloud")) {
    return <Cloud size={20} />;
  }

  if (
    normalized.includes("devops") ||
    normalized.includes("container")
  ) {
    return <Container size={20} />;
  }

  if (
    normalized.includes("programming") ||
    normalized.includes("architecture") ||
    normalized.includes("backend")
  ) {
    return <Code2 size={20} />;
  }

  return <Target size={20} />;
}

/* ============================================================= */
/* LOADING */
/* ============================================================= */

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
        <div className="w-full rounded-2xl border border-white/10 bg-[#0d1119] p-12 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

          <p className="mt-4 text-xs text-zinc-500 sm:text-sm">
            Analyzing your skill gaps...
          </p>
        </div>
      </div>
    </main>
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
    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <AlertTriangle size={17} />
        </div>

        <div>
          <p className="text-sm font-medium text-red-300">
            Unable to load skill gaps
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {message}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-[10px] text-red-300 transition hover:bg-red-500/20"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* EMPTY */
/* ============================================================= */

function EmptyGapState() {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] p-8 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <Sparkles size={22} />
      </div>

      <h2 className="mt-4 text-base font-semibold sm:text-lg">
        Your skill profile looks strong
      </h2>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
        We couldn't identify any major skill gaps for
        this career path. Explore more jobs or continue
        strengthening your current skills.
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-violet-500"
        >
          Explore Jobs
          <ArrowRight size={13} />
        </Link>

        <Link
          href="/skills"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs text-zinc-400 hover:text-white"
        >
          View Skills
        </Link>
      </div>
    </div>
  );
}