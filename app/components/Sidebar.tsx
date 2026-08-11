"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  ClipboardList,
  GitBranch,
  Home,
  Info,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Skills",
    href: "/skills",
    icon: Sparkles,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Career Match",
    href: "/career-match",
    icon: Target,
  },
  {
    label: "Skill Gap",
    href: "/skill-gap",
    icon: TrendingUp,
  },
  {
    label: "Graph Explorer",
    href: "/graph",
    icon: GitBranch,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: ClipboardList,
  },
  {
    label: "About",
    href: "#",
    icon: Info,
  },
];

export default function Sidebar({
  active,
}: {
  active?: string;
}) {
  return (
    <aside className="hidden w-44 shrink-0 flex-col border-r border-white/10 bg-[#0b0e16] md:flex">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-600/20">
            <GitBranch size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              CareerGraph AI
            </p>

            <p className="truncate text-[10px] text-zinc-500">
              Career Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/10"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon
                  size={16}
                  className="shrink-0"
                />

                <span className="truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="space-y-3 p-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white"
        >
          <Settings size={16} />
          Settings
        </Link>

        {/* Profile */}
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-300">
              <UserRound size={15} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                Rohit Verma
              </p>

              <p className="truncate text-[10px] text-zinc-600">
                Student
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}