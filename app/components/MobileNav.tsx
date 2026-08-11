"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  ClipboardList,
  GitBranch,
  Home,
  Info,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const items = [
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
    label: "Graph",
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
    href: "/about",
    icon: Info,
  },
];

export default function MobileNav({
  active,
}: {
  active?: string;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080b12]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-md items-stretch gap-0.5 overflow-x-auto px-1 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1.5 transition ${
                isActive
                  ? "text-violet-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActive ? "bg-violet-500/15" : ""
                }`}
              >
                <Icon size={16} />
              </div>

              <span
                className={`w-full truncate text-center text-[8px] leading-3 ${
                  isActive ? "font-medium" : "font-normal"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}