"use client";

import { ReactNode } from "react";
import { Bell, Search } from "lucide-react";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

type AppShellProps = {
  children: ReactNode;
  active?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

export default function AppShell({
  children,
  active,
  searchPlaceholder = "Search skills, jobs, companies...",
  searchValue = "",
  onSearchChange,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <Sidebar active={active} />

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-xl">

            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

              {/* Mobile Brand */}
              <div className="flex items-center gap-2 md:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <span className="text-sm font-bold">
                    CG
                  </span>
                </div>

                <span className="text-sm font-semibold">
                  CareerGraph AI
                </span>
              </div>

              {/* Search */}
              <div className="hidden w-full max-w-md sm:flex md:ml-auto">

                <div className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">

                  <Search
                    size={16}
                    className="shrink-0 text-zinc-600"
                  />

                  <input
                    value={searchValue}
                    onChange={(event) =>
                      onSearchChange?.(event.target.value)
                    }
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                  />

                </div>

              </div>

              {/* Right */}
              <div className="flex shrink-0 items-center gap-2">

                <button
                  type="button"
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Bell size={18} />
                </button>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-violet-600/20 text-xs font-semibold text-violet-300">
                  RV
                </div>

              </div>

            </div>

            {/* Mobile Search */}
            <div className="border-t border-white/5 px-4 py-3 sm:hidden">

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">

                <Search
                  size={16}
                  className="shrink-0 text-zinc-600"
                />

                <input
                  value={searchValue}
                  onChange={(event) =>
                    onSearchChange?.(event.target.value)
                  }
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-zinc-600"
                />

              </div>

            </div>

          </header>

          {/* Page */}
          <div className="min-w-0 flex-1 pb-20 md:pb-0">
            {children}
          </div>

        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav active={active} />
    </main>
  );
}