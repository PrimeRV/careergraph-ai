"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import AppShell from "../components/AppShell";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

const STUDENT_ID = "student-001";

type Skill = {
  id: string;
  name: string;
  category?: string;
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
  matches?: CareerMatch[];
  totalMatches?: number;
};

type FilterType = "all" | "high" | "good" | "explore";

export default function CareerMatchPage() {
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/career-match?studentId=${encodeURIComponent(STUDENT_ID)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: CareerMatchResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Career Match API returned an error.");
      }

      const normalized = (data.matches ?? [])
        .map(normalizeMatch)
        .sort((a, b) => b.matchScore - a.matchScore);

      setMatches(normalized);

      if (normalized.length > 0) {
        setSelectedJobId((current) => current ?? normalized[0].jobId);
      } else {
        setSelectedJobId(null);
      }
    } catch (err) {
      console.error("Career match error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load career matches."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const highMatches = useMemo(
    () => matches.filter((m) => m.matchScore >= 80).length,
    [matches]
  );

  const goodMatches = useMemo(
    () =>
      matches.filter(
        (m) => m.matchScore >= 60 && m.matchScore < 80
      ).length,
    [matches]
  );

  const exploreMatches = useMemo(
    () => matches.filter((m) => m.matchScore < 60).length,
    [matches]
  );

  const averageMatch = useMemo(() => {
    if (matches.length === 0) return 0;

    return Math.round(
      matches.reduce((sum, match) => sum + match.matchScore, 0) /
        matches.length
    );
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return matches.filter((match) => {
      const skills = [
        ...(match.requiredSkills ?? []),
        ...(match.matchedSkills ?? []),
      ];

      const matchesSearch =
        !query ||
        match.jobTitle.toLowerCase().includes(query) ||
        match.company.toLowerCase().includes(query) ||
        (match.location ?? "").toLowerCase().includes(query) ||
        skills.some((skill) =>
          skill.name.toLowerCase().includes(query)
        );

      let matchesFilter = true;

      if (filter === "high") {
        matchesFilter = match.matchScore >= 80;
      } else if (filter === "good") {
        matchesFilter =
          match.matchScore >= 60 && match.matchScore < 80;
      } else if (filter === "explore") {
        matchesFilter = match.matchScore < 60;
      }

      return matchesSearch && matchesFilter;
    });
  }, [matches, search, filter]);

  const selectedMatch =
    matches.find((match) => match.jobId === selectedJobId) ??
    filteredMatches[0] ??
    null;

  return (
    <AppShell
      active="Career Match"
      searchPlaceholder="Search jobs, companies..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-8">
        {/* HEADER */}
        <section className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-violet-400 sm:text-sm">
                Career Intelligence
              </p>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Career Match
              </h1>

              <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                Find the roles where your current skills give you
                the strongest career advantage.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-zinc-400 transition hover:border-violet-500/30 hover:text-white"
            >
              <BriefcaseBusiness size={14} />
              Explore Jobs
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* PROFILE SUMMARY */}
        <section className="mb-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-violet-400">
                Your Profile Summary
              </p>

              <h2 className="mt-1 text-base font-semibold sm:text-lg">
                Rohit Verma
              </h2>
            </div>

            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
              <Target size={18} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <ProfileBlock
              title="Skills"
              value={getUniqueSkills(matches).slice(0, 8)}
            />

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                Experience Level
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {getMostCommonLevel(matches) || "Fresher"}
              </p>

              <p className="mt-1 text-[10px] text-zinc-600">
                Based on matched roles
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                Your Strengths
              </p>

              <div className="mt-2 space-y-1.5">
                {getStrengths(matches).map((strength) => (
                  <div
                    key={strength}
                    className="flex items-center gap-2 text-xs text-zinc-300"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-emerald-400"
                    />
                    {strength}
                  </div>
                ))}

                {getStrengths(matches).length === 0 && (
                  <p className="text-xs text-zinc-600">
                    No strengths found yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            title="Career Matches"
            value={matches.length}
            subtitle="Available opportunities"
            icon={<Target size={18} />}
          />

          <SummaryCard
            title="Average Match"
            value={`${averageMatch}%`}
            subtitle="Across all roles"
            icon={<TrendingUp size={18} />}
          />

          <SummaryCard
            title="High Matches"
            value={highMatches}
            subtitle="80%+ compatibility"
            icon={<Sparkles size={18} />}
          />

          <SummaryCard
            title="Skills to Improve"
            value={getMissingSkillCount(matches)}
            subtitle="Across matched roles"
            icon={<XCircle size={18} />}
          />
        </section>

        {/* FILTERS */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <Search
                size={16}
                className="shrink-0 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search roles, companies or skills..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-zinc-600 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All ({matches.length})
              </FilterButton>

              <FilterButton
                active={filter === "high"}
                onClick={() => setFilter("high")}
              >
                High Match ({highMatches})
              </FilterButton>

              <FilterButton
                active={filter === "good"}
                onClick={() => setFilter("good")}
              >
                Good Match ({goodMatches})
              </FilterButton>

              <FilterButton
                active={filter === "explore"}
                onClick={() => setFilter("explore")}
              >
                Explore ({exploreMatches})
              </FilterButton>
            </div>
          </div>
        </section>

        {/* MAIN */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => void loadMatches()}
          />
        ) : (
          <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            {/* MATCH LIST */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold sm:text-base">
                    Top Career Matches
                  </h2>

                  <p className="mt-1 text-[11px] text-zinc-600">
                    Ranked by your current skill compatibility
                  </p>
                </div>

                <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-500">
                  {filteredMatches.length} matches
                </span>
              </div>

              <div className="space-y-2">
                {filteredMatches.map((match) => (
                  <button
                    key={match.jobId}
                    type="button"
                    onClick={() => setSelectedJobId(match.jobId)}
                    className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${
                      selectedJobId === match.jobId
                        ? "border-violet-500/40 bg-violet-500/[0.07]"
                        : "border-white/5 bg-white/[0.015] hover:border-violet-500/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <MatchListItem match={match} />
                  </button>
                ))}

                {filteredMatches.length === 0 && (
                  <EmptyState
                    onClear={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                  />
                )}
              </div>
            </div>

            {/* DETAIL */}
            {selectedMatch ? (
              <CareerMatchDetails match={selectedMatch} />
            ) : (
              <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-white/10 bg-[#0d1119] p-6 text-center">
                <div>
                  <Target
                    size={32}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-3 text-sm text-zinc-500">
                    Select a career match
                  </p>

                  <p className="mt-1 text-xs text-zinc-700">
                    Detailed compatibility will appear here.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

/* ============================================================= */
/* DETAIL PANEL */
/* ============================================================= */

function CareerMatchDetails({
  match,
}: {
  match: CareerMatch;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    setApplied(false);
    setApplicationError("");
  }, [match.jobId]);

  async function handleApply() {
    if (applying || applied) return;

    try {
      setApplying(true);
      setApplicationError("");

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: STUDENT_ID,
          jobId: match.jobId,
          status: "Applied",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to apply for this job."
        );
      }

      setApplied(true);
    } catch (error) {
      console.error("Application error:", error);

      setApplicationError(
        error instanceof Error
          ? error.message
          : "Failed to apply for this job."
      );
    } finally {
      setApplying(false);
    }
  }

  const requiredSkills = match.requiredSkills ?? [];
  const matchedSkills = match.matchedSkills ?? [];

  const matchedIds = new Set(
    matchedSkills.map((skill) => skill.id)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !matchedIds.has(skill.id)
  );

  const scoreTone =
    match.matchScore >= 80
      ? {
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
          bar: "bg-emerald-500",
        }
      : match.matchScore >= 60
        ? {
            text: "text-violet-400",
            bg: "bg-violet-500/10",
            bar: "bg-violet-500",
          }
        : {
            text: "text-orange-400",
            bg: "bg-orange-500/10",
            bar: "bg-orange-500",
          };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-6">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <BriefcaseBusiness size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold sm:text-xl">
            {match.jobTitle}
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            {match.company}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-zinc-500 sm:text-xs">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {match.location || "Location not specified"}
            </span>

            <span>
              {match.level || "Fresher"}
            </span>
          </div>
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-center ${scoreTone.bg}`}
        >
          <p
            className={`text-xl font-bold ${scoreTone.text}`}
          >
            {match.matchScore}%
          </p>

          <p className="text-[9px] text-zinc-600">
            Match
          </p>
        </div>
      </div>

      {/* MATCH BAR */}
      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Career Match
          </p>

          <p
            className={`text-xs font-medium ${scoreTone.text}`}
          >
            {match.matchScore}%
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${scoreTone.bar}`}
            style={{
              width: `${match.matchScore}%`,
            }}
          />
        </div>
      </div>

      {/* MATCH STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-wide text-zinc-600">
            Matched Skills
          </p>

          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {matchedSkills.length}
          </p>
        </div>

        <div className="rounded-xl border border-orange-500/10 bg-orange-500/[0.025] p-4">
          <p className="text-[10px] uppercase tracking-wide text-zinc-600">
            Skills To Develop
          </p>

          <p className="mt-1 text-xl font-semibold text-orange-400">
            {missingSkills.length}
          </p>
        </div>
      </div>

      {/* REQUIRED SKILLS */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold">
            Required Skills
          </h3>

          <span className="text-[10px] text-zinc-600">
            {requiredSkills.length} skills
          </span>
        </div>

        {requiredSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-600">
            Skill requirements are not available.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {requiredSkills.map((skill) => {
              const matched = matchedIds.has(skill.id);

              return (
                <div
                  key={skill.id}
                  className={`flex items-center gap-2 rounded-xl border p-3 ${
                    matched
                      ? "border-emerald-500/10 bg-emerald-500/[0.03]"
                      : "border-orange-500/10 bg-orange-500/[0.025]"
                  }`}
                >
                  {matched ? (
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-emerald-400"
                    />
                  ) : (
                    <XCircle
                      size={14}
                      className="shrink-0 text-orange-400"
                    />
                  )}

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
                    {matched ? "Matched" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/jobs?jobId=${encodeURIComponent(
            match.jobId
          )}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          View Job
          <ArrowRight size={14} />
        </Link>

        <button
          type="button"
          onClick={handleApply}
          disabled={applying || applied}
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
              <CheckCircle2 size={14} />
              Applied
            </>
          ) : applying ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Applying...
            </>
          ) : (
            <>
              Apply / Track
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {applicationError && (
        <p className="mt-3 text-center text-[11px] text-red-400">
          {applicationError}
        </p>
      )}

      {applied && (
        <p className="mt-3 text-center text-[11px] text-emerald-400">
          Application saved successfully. You can track it
          from your dashboard.
        </p>
      )}
    </div>
  );
}

/* ============================================================= */
/* LIST ITEM */
/* ============================================================= */

function MatchListItem({
  match,
}: {
  match: CareerMatch;
}) {
  const scoreClass =
    match.matchScore >= 80
      ? "text-emerald-400"
      : match.matchScore >= 60
        ? "text-violet-400"
        : "text-orange-400";

  const barClass =
    match.matchScore >= 80
      ? "bg-emerald-500"
      : match.matchScore >= 60
        ? "bg-violet-500"
        : "bg-orange-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <BriefcaseBusiness size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium sm:text-sm">
          {match.jobTitle}
        </p>

        <p className="mt-1 truncate text-[10px] text-zinc-600 sm:text-[11px]">
          {match.company}
          {match.location
            ? ` • ${match.location}`
            : ""}
        </p>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={`h-full rounded-full ${barClass}`}
            style={{
              width: `${match.matchScore}%`,
            }}
          />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${scoreClass}`}
        >
          {match.matchScore}%
        </p>

        <p className="text-[9px] text-zinc-700">
          match
        </p>
      </div>

      <ChevronRight
        size={15}
        className="shrink-0 text-zinc-700"
      />
    </div>
  );
}

/* ============================================================= */
/* PROFILE */
/* ============================================================= */

function ProfileBlock({
  title,
  value,
}: {
  title: string;
  value: string[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {value.length > 0 ? (
          value.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400"
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-xs text-zinc-600">
            No skills found
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================= */
/* SUMMARY */
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
  icon: ReactNode;
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

          <p className="mt-1 text-[10px] text-zinc-600 sm:text-xs">
            {subtitle}
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
/* FILTER */
/* ============================================================= */

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-[10px] font-medium transition sm:text-xs ${
        active
          ? "bg-violet-600 text-white"
          : "border border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================= */
/* HELPERS */
/* ============================================================= */

function normalizeMatch(
  match: CareerMatch
): CareerMatch {
  return {
    ...match,

    matchScore: Math.max(
      0,
      Math.min(
        100,
        Number(match.matchScore) || 0
      )
    ),

    requiredSkills:
      match.requiredSkills ?? [],

    matchedSkills:
      match.matchedSkills ?? [],

    company:
      match.company || "Company not available",
  };
}

function getUniqueSkills(
  matches: CareerMatch[]
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const match of matches) {
    for (const skill of match.matchedSkills ?? []) {
      if (!seen.has(skill.name)) {
        seen.add(skill.name);
        result.push(skill.name);
      }
    }
  }

  return result;
}

function getStrengths(
  matches: CareerMatch[]
): string[] {
  const counts = new Map<string, number>();

  for (const match of matches) {
    for (const skill of match.matchedSkills ?? []) {
      counts.set(
        skill.name,
        (counts.get(skill.name) ?? 0) + 1
      );
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

function getMostCommonLevel(
  matches: CareerMatch[]
): string | undefined {
  const counts = new Map<string, number>();

  for (const match of matches) {
    if (!match.level) continue;

    counts.set(
      match.level,
      (counts.get(match.level) ?? 0) + 1
    );
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0];
}

function getMissingSkillCount(
  matches: CareerMatch[]
): number {
  const missing = new Set<string>();

  for (const match of matches) {
    const matchedIds = new Set(
      (match.matchedSkills ?? []).map(
        (skill) => skill.id
      )
    );

    for (const skill of match.requiredSkills ?? []) {
      if (!matchedIds.has(skill.id)) {
        missing.add(skill.id);
      }
    }
  }

  return missing.size;
}

/* ============================================================= */
/* STATES */
/* ============================================================= */

function LoadingState() {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-12 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

      <p className="mt-4 text-xs text-zinc-500">
        Analyzing your career graph...
      </p>

      <p className="mt-1 text-[10px] text-zinc-700">
        Calculating skill compatibility
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
      <Target
        size={30}
        className="mx-auto text-red-400"
      />

      <p className="mt-4 text-sm font-medium">
        Unable to load career matches
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-500"
      >
        Try Again
      </button>
    </div>
  );
}

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
        No career matches found
      </p>

      <p className="mt-1 text-[10px] text-zinc-700">
        Try changing your search or filter.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-medium text-white hover:bg-violet-500"
      >
        Clear Filters
      </button>
    </div>
  );
}