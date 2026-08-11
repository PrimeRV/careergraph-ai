"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Database,
  GitBranch,
  Layers3,
  Search,
  Server,
  Sparkles,
  Target,
  Wrench,
  X,
} from "lucide-react";

import AppShell from "../components/AppShell";

type Skill = { id: string; name: string; category: string };
type SkillGap = { skillId: string; skillName: string; category?: string };

type SkillsResponse = {
  success: boolean;
  studentId: string;
  skills: Skill[];
};

type DashboardResponse = {
  success: boolean;
  metrics?: {
    skillsCount: number;
    careerMatches: number;
    skillGap: number;
    appliedJobs: number;
  };
  skills?: Skill[];
  skillGap?: SkillGap[];
};

const strengthMap: Record<string, "Strong" | "Average" | "Weak"> = {
  "skill-001": "Strong",
  "skill-002": "Strong",
  "skill-004": "Strong",
  "skill-005": "Average",
  "skill-007": "Average",
  "skill-012": "Strong",
  "skill-013": "Strong",
  "skill-015": "Strong",
};

const graphPositions = [
  { x: 16, y: 28 },
  { x: 84, y: 28 },
  { x: 18, y: 75 },
  { x: 82, y: 75 },
  { x: 50, y: 13 },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    async function loadSkillData() {
      try {
        setLoading(true);
        setError("");

        const [skillsResponse, dashboardResponse] = await Promise.all([
          fetch("/api/skills?studentId=student-001", { cache: "no-store" }),
          fetch("/api/dashboard?studentId=student-001", { cache: "no-store" }),
        ]);

        if (!skillsResponse.ok) throw new Error("Failed to load skills");
        if (!dashboardResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const skillsData: SkillsResponse = await skillsResponse.json();
        const dashboardData: DashboardResponse =
          await dashboardResponse.json();

        if (!skillsData.success) throw new Error("Skills API failed");
        if (!dashboardData.success) throw new Error("Dashboard API failed");

        const loadedSkills = skillsData.skills ?? [];
        setSkills(loadedSkills);
        setSkillGaps(dashboardData.skillGap ?? []);
        setSelectedSkill(loadedSkills[0] ?? null);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Unable to load your skill data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkillData();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(skills.map((skill) => skill.category).filter(Boolean))),
    ],
    [skills]
  );

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (category === "All" || skill.category === category)
      );
    });
  }, [skills, search, category]);

  const strongCount = skills.filter(
    (skill) => getStrength(skill) === "Strong"
  ).length;

  const averageCount = skills.filter(
    (skill) => getStrength(skill) === "Average"
  ).length;

  const weakCount = skillGaps.length;

  if (loading) {
    return (
      <AppShell active="Skills">
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell active="Skills">
        <ErrorState message={error} />
      </AppShell>
    );
  }

  return (
    <AppShell
      active="Skills"
      searchPlaceholder="Search skills..."
      searchValue={search}
      onSearchChange={setSearch}
    >
      <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium text-violet-400 sm:text-sm">
                Career Intelligence
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Skill Explorer
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                Explore your skills, identify skill gaps and understand how
                your skills connect.
              </p>
            </div>

            <Link
              href="/graph"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#0d1119] px-3 py-2.5 text-xs text-zinc-400 transition hover:border-violet-500/40 hover:text-white"
            >
              <GitBranch size={14} />
              Explore in Graph
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SkillStat title="Total Skills" value={skills.length} icon={<Sparkles size={18} />} />
          <SkillStat title="Your Skills" value={skills.length} icon={<Layers3 size={18} />} />
          <SkillStat title="Strong Skills" value={strongCount} icon={<Sparkles size={18} />} />
          <SkillStat title="Skills to Learn" value={weakCount} icon={<Target size={18} />} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <section className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold sm:text-base">All Skills</h2>
                <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                  Skills currently present in your career graph
                </p>
              </div>
              <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-500">
                {filteredSkills.length}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
              <Search size={15} className="shrink-0 text-zinc-600" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skills..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-zinc-600"
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

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] transition ${
                    category === item
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10"
                      : "border border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setSelectedSkill(skill)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedSkill?.id === skill.id
                      ? "border-violet-500/40 bg-violet-500/[0.07]"
                      : "border-white/5 bg-white/[0.015] hover:border-violet-500/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <SkillListItem skill={skill} strength={getStrength(skill)} />
                </button>
              ))}
              {filteredSkills.length === 0 && <EmptyState />}
            </div>
          </section>

          <SkillRelationshipPanel
            skills={skills}
            selectedSkill={selectedSkill}
            onSelect={setSelectedSkill}
          />
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold sm:text-base">Skill Distribution</h2>
            <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
              Understand your current skill strengths.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DistributionCard
              title="Strong"
              count={strongCount}
              description="Skills you're confident with"
              className="border-emerald-500/20 bg-emerald-500/[0.04]"
              textClass="text-emerald-400"
            />
            <DistributionCard
              title="Average"
              count={averageCount}
              description="Skills worth improving"
              className="border-blue-500/20 bg-blue-500/[0.04]"
              textClass="text-blue-400"
            />
            <DistributionCard
              title="To Learn"
              count={weakCount}
              description="Priority career skills"
              className="border-orange-500/20 bg-orange-500/[0.04]"
              textClass="text-orange-400"
            />
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Skills to Learn</h2>
              <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                Skills that can improve your career opportunities.
              </p>
            </div>
            <Link
              href="/skill-gap"
              className="flex shrink-0 items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300"
            >
              View Skill Gap <ArrowRight size={12} />
            </Link>
          </div>

          {skillGaps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <Sparkles size={24} className="mx-auto text-zinc-700" />
              <p className="mt-3 text-xs text-zinc-500">No skill gaps found.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {skillGaps.map((gap) => (
                <Link
                  key={gap.skillId}
                  href="/skill-gap"
                  className="group rounded-xl border border-orange-500/10 bg-orange-500/[0.025] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                      <Target size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium sm:text-sm">{gap.skillName}</p>
                      <p className="mt-1 truncate text-[10px] text-zinc-600">
                        {gap.category || "Skill Gap"}
                      </p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-zinc-700 group-hover:text-violet-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}

function SkillStat({
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
          <p className="text-[10px] text-zinc-500 sm:text-xs">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{value}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SkillListItem({
  skill,
  strength,
}: {
  skill: Skill;
  strength: "Strong" | "Average" | "Weak";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {getSkillIcon(skill.category)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-white sm:text-sm">{skill.name}</p>
        <p className="mt-0.5 truncate text-[10px] text-zinc-600">{skill.category}</p>
      </div>
      <StrengthBadge strength={strength} />
    </div>
  );
}

function SkillRelationshipPanel({
  skills,
  selectedSkill,
  onSelect,
}: {
  skills: Skill[];
  selectedSkill: Skill | null;
  onSelect: (skill: Skill) => void;
}) {
  const relatedSkills = skills
    .filter((skill) => skill.id !== selectedSkill?.id)
    .slice(0, 5);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0d1119] p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold sm:text-base">Skill Relationships</h2>
        <p className="mt-1 text-[11px] text-zinc-600">
          Skills connected to your career graph
        </p>
      </div>

      <div className="relative h-[360px] overflow-hidden rounded-xl border border-white/5 bg-[#090d15] sm:h-[410px]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {relatedSkills.map((skill, index) => {
            const target = graphPositions[index] ?? graphPositions[0];
            return (
              <line
                key={skill.id}
                x1="50"
                y1="50"
                x2={target.x}
                y2={target.y}
                stroke="rgba(139,92,246,.35)"
                strokeWidth="0.45"
              />
            );
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-violet-400/50 bg-violet-600/25 text-center shadow-[0_0_35px_rgba(139,92,246,.18)]">
          <div className="min-w-0 px-2">
            <Sparkles size={17} className="mx-auto mb-1 text-violet-300" />
            <p className="truncate text-[10px] font-semibold text-white">
              {selectedSkill?.name ?? "Skills"}
            </p>
          </div>
        </div>

        {relatedSkills.map((skill, index) => {
          const position = graphPositions[index] ?? graphPositions[0];

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => onSelect(skill)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center transition hover:scale-105 hover:border-violet-400/50 hover:bg-violet-500/10"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <p className="max-w-[85px] truncate text-[9px] font-medium text-blue-300">
                {skill.name}
              </p>
              <p className="mt-0.5 max-w-[85px] truncate text-[8px] text-zinc-600">
                {skill.category}
              </p>
            </button>
          );
        })}

        {relatedSkills.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600">
            Select a skill to explore its relationships.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[10px] text-zinc-600">Click another skill to explore</p>
        <Link
          href="/graph"
          className="flex shrink-0 items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300"
        >
          Open Graph <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function DistributionCard({
  title,
  count,
  description,
  className,
  textClass,
}: {
  title: string;
  count: number;
  description: string;
  className: string;
  textClass: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${textClass}`}>{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{count}</p>
        </div>
        <Sparkles size={18} className={textClass} />
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{description}</p>
    </div>
  );
}

function StrengthBadge({
  strength,
}: {
  strength: "Strong" | "Average" | "Weak";
}) {
  const styles = {
    Strong: "bg-emerald-500/10 text-emerald-400",
    Average: "bg-blue-500/10 text-blue-400",
    Weak: "bg-orange-500/10 text-orange-400",
  };

  return (
    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${styles[strength]}`}>
      {strength}
    </span>
  );
}

function getSkillIcon(category?: string) {
  const normalized = (category ?? "").toLowerCase();

  if (normalized.includes("database")) return <Database size={15} />;
  if (normalized.includes("backend") || normalized.includes("server")) {
    return <Server size={15} />;
  }
  if (normalized.includes("programming") || normalized.includes("frontend")) {
    return <Code2 size={15} />;
  }
  if (normalized.includes("tools")) return <Wrench size={15} />;
  return <Layers3 size={15} />;
}

function getStrength(skill: Skill): "Strong" | "Average" | "Weak" {
  return strengthMap[skill.id] ?? "Average";
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
      <Search size={24} className="mx-auto text-zinc-700" />
      <p className="mt-3 text-xs text-zinc-500">No skills found</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
        <p className="mt-4 text-xs text-zinc-500">Loading your skills...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm font-semibold text-white">Skills unavailable</p>
        <p className="mt-2 text-xs leading-5 text-zinc-500">{message}</p>
      </div>
    </div>
  );
}
