"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Search,
  X,
} from "lucide-react";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

type AppShellProps = {
  children: ReactNode;
  active?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type SearchContextValue = {
  search: string;
};

const SearchContext = createContext<SearchContextValue>({
  search: "",
});

export function useAppSearch(): string {
  return useContext(SearchContext).search;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Career matches updated",
    message:
      "New job opportunities match your current skill graph.",
    time: "Recently",
    unread: false,
  },
  {
    id: 2,
    title: "Skill gap recommendation",
    message:
      "Check the skills recommended for your target roles.",
    time: "Today",
    unread: false,
  },
  {
    id: 3,
    title: "Application activity",
    message:
      "Your application progress has been updated.",
    time: "Today",
    unread: false,
  },
];

export default function AppShell({
  children,
  active,
  searchPlaceholder = "Search skills, jobs, companies...",
  searchValue,
  onSearchChange,
}: AppShellProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [localSearch, setLocalSearch] = useState("");

  const currentSearch =
    searchValue !== undefined ? searchValue : localSearch;

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    onSearchChange?.(value);
  }

  function clearSearch() {
    handleSearchChange("");
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  }

  return (
    <SearchContext.Provider value={{ search: currentSearch }}>
      <main className="min-h-screen bg-[#080b12] text-white">
        <div className="flex min-h-screen">
          <Sidebar active={active} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b12]/90 backdrop-blur-xl">
              <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 md:hidden">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                    <span className="text-sm font-bold">CG</span>
                  </div>

                  <span className="text-sm font-semibold">
                    CareerGraph AI
                  </span>
                </div>

                <div className="hidden w-full max-w-md sm:flex md:ml-auto">
                  <div className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">
                    <Search
                      size={16}
                      className="shrink-0 text-zinc-600"
                    />

                    <input
                      type="search"
                      value={currentSearch}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder={searchPlaceholder}
                      autoComplete="off"
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                    />

                    {currentSearch.length > 0 && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={clearSearch}
                        className="shrink-0 rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() =>
                      setShowNotifications((current) => !current)
                    }
                    className={`relative rounded-lg p-2 transition ${
                      showNotifications
                        ? "bg-violet-500/10 text-violet-300"
                        : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Bell size={18} />

                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1119] shadow-2xl shadow-black/40">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Notifications
                          </h3>

                          <p className="mt-0.5 text-[10px] text-zinc-600">
                            {unreadCount > 0
                              ? `${unreadCount} unread notification${
                                  unreadCount > 1 ? "s" : ""
                                }`
                              : "You're all caught up"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              title="Mark all as read"
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-violet-300"
                            >
                              <CheckCheck size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            title="Close"
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-10 text-center">
                            <Bell
                              size={24}
                              className="mx-auto text-zinc-700"
                            />

                            <p className="mt-3 text-sm text-zinc-400">
                              No notifications
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() =>
                                markAsRead(notification.id)
                              }
                              className={`flex w-full gap-3 border-b border-white/5 px-4 py-4 text-left transition last:border-b-0 hover:bg-white/[0.025] ${
                                notification.unread
                                  ? "bg-violet-500/[0.025]"
                                  : ""
                              }`}
                            >
                              <div
                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  notification.unread
                                    ? "bg-violet-500/10 text-violet-400"
                                    : "bg-white/[0.04] text-zinc-600"
                                }`}
                              >
                                {notification.unread ? (
                                  <Bell size={14} />
                                ) : (
                                  <Check size={14} />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-xs font-medium ${
                                      notification.unread
                                        ? "text-white"
                                        : "text-zinc-400"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>

                                  {notification.unread && (
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                                  )}
                                </div>

                                <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                  {notification.message}
                                </p>

                                <p className="mt-1.5 text-[9px] text-zinc-700">
                                  {notification.time}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="border-t border-white/10 px-4 py-3">
                        <Link
                          href="/applications"
                          onClick={() =>
                            setShowNotifications(false)
                          }
                          className="block text-center text-[10px] font-medium text-violet-400 transition hover:text-violet-300"
                        >
                          View application activity →
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-violet-600/20 text-xs font-semibold text-violet-300">
                    RV
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 px-4 py-3 sm:hidden">
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2">
                  <Search
                    size={16}
                    className="shrink-0 text-zinc-600"
                  />

                  <input
                    type="search"
                    value={currentSearch}
                    onChange={(event) =>
                      handleSearchChange(event.target.value)
                    }
                    placeholder={searchPlaceholder}
                    autoComplete="off"
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                  />

                  {currentSearch.length > 0 && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={clearSearch}
                      className="shrink-0 rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </header>

            <div className="min-w-0 flex-1 pb-20 md:pb-0">
              {children}
            </div>
          </div>
        </div>

        <MobileNav active={active} />
      </main>
    </SearchContext.Provider>
  );
}
