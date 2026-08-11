"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Check,
  Moon,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
            Preferences
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your CareerGraph AI preferences.
          </p>
        </div>

        {/* Profile */}
        <section className="rounded-2xl border border-white/10 bg-[#0d1119] p-6">
          <SectionTitle
            icon={<UserRound size={18} />}
            title="Profile"
            description="Your CareerGraph AI profile."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoCard label="Name" value="Rohit Verma" />
            <InfoCard label="Role" value="Student" />
            <InfoCard label="Profile Type" value="Career Explorer" />
            <InfoCard label="Experience" value="2 years" />
          </div>
        </section>

        {/* Career Preferences */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-6">
          <SectionTitle
            icon={<BriefcaseBusiness size={18} />}
            title="Career Preferences"
            description="Your current career preferences."
          />

          <div className="mt-5 space-y-3">
            <Preference
              title="Career Focus"
              value="Software Engineering"
            />

            <Preference
              title="Work Mode"
              value="Remote"
            />

            <Preference
              title="Experience Level"
              value="Mid Level"
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-6">
          <SectionTitle
            icon={<Bell size={18} />}
            title="Notifications"
            description="Application and career notifications."
          />

          <div className="mt-5 space-y-1">
            <SettingRow
              title="Application updates"
              description="Show updates when application status changes."
            />

            <SettingRow
              title="Career match alerts"
              description="Show relevant career opportunities."
            />

            <SettingRow
              title="Skill gap recommendations"
              description="Show recommended skills to improve your matches."
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-6">
          <SectionTitle
            icon={<Moon size={18} />}
            title="Appearance"
            description="Current application appearance."
          />

          <div className="mt-5 rounded-xl border border-violet-500/30 bg-violet-500/[0.05] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Dark Mode
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  CareerGraph AI is currently using dark mode.
                </p>
              </div>

              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600">
                <Check size={12} />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1119] p-6">
          <SectionTitle
            icon={<ShieldCheck size={18} />}
            title="Privacy"
            description="Your graph data and application information."
          />

          <p className="mt-5 text-xs leading-6 text-zinc-500">
            CareerGraph AI connects students, skills, jobs, companies,
            courses, and applications through the career graph.
          </p>
        </section>

        {/* About */}
        <div className="mt-6 text-center">
          <Link
            href="/about"
            className="text-xs text-violet-400 transition hover:text-violet-300"
          >
            Learn more about CareerGraph AI →
          </Link>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}

function Preference({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <span className="text-sm text-zinc-300">
        {title}
      </span>

      <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-500">
        {value}
      </span>
    </div>
  );
}

function SettingRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-4 last:border-0">
      <div>
        <p className="text-sm text-zinc-300">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>
      </div>

      <div className="flex h-6 w-10 items-center justify-end rounded-full bg-violet-600 p-1">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
          <Check
            size={9}
            className="text-violet-600"
          />
        </div>
      </div>
    </div>
  );
}