"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Database,
  GitBranch,
  GraduationCap,
  Layers3,
  Network,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Hero */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
            <Sparkles size={16} />
            About CareerGraph AI
          </div>

          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Build your career with a graph-powered career intelligence platform.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            CareerGraph AI connects your skills, career goals, jobs,
            applications, and skill gaps into one connected career graph.
            The platform helps you understand where you are, what opportunities
            match your profile, and what skills you can develop next.
          </p>
        </section>

        {/* What is CareerGraph */}
        <section className="grid gap-5 lg:grid-cols-2">

          <InfoCard
            icon={<BrainCircuit size={20} />}
            title="What is CareerGraph AI?"
            description="CareerGraph AI is a career intelligence application that uses connected graph data to bring together students, skills, jobs, career matches, skill gaps, and applications."
          />

          <InfoCard
            icon={<Network size={20} />}
            title="Why a Career Graph?"
            description="Career decisions are connected. Your skills influence job matches, jobs influence applications, and missing skills can guide your learning path. A graph makes these relationships easier to explore."
          />

        </section>

        {/* Features */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-7">

          <div className="mb-6">
            <p className="text-xs font-medium text-violet-400">
              PLATFORM FEATURES
            </p>

            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              Everything connected in one place
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
              CareerGraph AI provides a connected workflow from skills
              discovery to job applications and career progress.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <FeatureCard
              icon={<GraduationCap size={18} />}
              title="Skills"
              description="View and manage the skills connected to your career profile."
            />

            <FeatureCard
              icon={<BriefcaseIcon />}
              title="Jobs"
              description="Explore available job opportunities and their required skills."
            />

            <FeatureCard
              icon={<Target size={18} />}
              title="Career Match"
              description="Find job roles that match your current skills and profile."
            />

            <FeatureCard
              icon={<Layers3 size={18} />}
              title="Skill Gap"
              description="Identify skills that can improve your career opportunities."
            />

            <FeatureCard
              icon={<Workflow size={18} />}
              title="Applications"
              description="Track applications and update their progress from Applied to Offer, Selected, or Rejected."
            />

            <FeatureCard
              icon={<GitBranch size={18} />}
              title="Career Graph"
              description="Explore the relationships between students, skills, jobs, and career opportunities."
            />

          </div>
        </section>

        {/* Architecture */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-7">

          <div className="mb-6">
            <p className="text-xs font-medium text-violet-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              Connected career workflow
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-5">

            <FlowStep
              number="01"
              title="Profile"
              description="Student profile and skills"
            />

            <FlowArrow />

            <FlowStep
              number="02"
              title="Match"
              description="Skills matched with jobs"
            />

            <FlowArrow />

            <FlowStep
              number="03"
              title="Apply"
              description="Track job applications"
            />

          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-5">

            <FlowStep
              number="04"
              title="Improve"
              description="Identify skill gaps"
            />

            <FlowArrow />

            <FlowStep
              number="05"
              title="Progress"
              description="Track application status"
            />

          </div>

        </section>

        {/* Technology */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-7">

          <div className="mb-6">
            <p className="text-xs font-medium text-violet-400">
              TECHNOLOGY
            </p>

            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              Built with a modern web stack
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <TechCard
              icon={<Layers3 size={18} />}
              title="Next.js"
              description="Application framework"
            />

            <TechCard
              icon={<Sparkles size={18} />}
              title="React"
              description="Interactive UI"
            />

            <TechCard
              icon={<Database size={18} />}
              title="CognoDB"
              description="Graph data layer"
            />

            <TechCard
              icon={<Network size={18} />}
              title="Neo4j"
              description="Graph database technology"
            />

          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6 text-center sm:p-8">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            <Sparkles size={22} />
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            Ready to explore your career graph?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
            Explore jobs, discover career matches, identify skill gaps,
            and track your applications from one connected platform.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">

            <Link
              href="/career-match"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-violet-500"
            >
              Explore Career Match
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06]"
            >
              Browse Jobs
            </Link>

          </div>

        </section>

        <p className="mt-8 text-center text-[11px] text-zinc-700">
          CareerGraph AI — Connected career intelligence
        </p>

      </div>
    </main>
  );
}

/* ============================================================
   INFO CARD
   ============================================================ */

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1119] p-5 sm:p-6">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <h2 className="mt-4 text-base font-semibold sm:text-lg">
        {title}
      </h2>

      <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   FEATURE CARD
   ============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-medium">
        {title}
      </h3>

      <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   FLOW STEP
   ============================================================ */

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4">

      <div className="text-[10px] font-semibold text-violet-400">
        {number}
      </div>

      <h3 className="mt-2 text-sm font-medium">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-4 text-zinc-600">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   FLOW ARROW
   ============================================================ */

function FlowArrow() {
  return (
    <div className="hidden items-center justify-center text-zinc-700 md:flex">
      <ArrowRight size={18} />
    </div>
  );
}

/* ============================================================
   TECH CARD
   ============================================================ */

function TechCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.015] p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-zinc-600">
          {description}
        </p>
      </div>

    </div>
  );
}

/* ============================================================
   BRIEFCASE ICON
   ============================================================ */

function BriefcaseIcon() {
  return (
    <span className="text-[17px] leading-none">
      💼
    </span>
  );
}