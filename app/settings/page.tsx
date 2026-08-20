"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Check,
  Moon,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";

const STUDENT_ID = "student-001";

type Theme = "dark" | "light" | "system";

type Profile = {
  name: string;
  role: string;
  experience: string;
};

type Preferences = {
  profileType: string;
  careerFocus: string;
  workMode: string;
  experienceLevel: string;
  theme: Theme;
  applicationUpdates: boolean;
  careerMatches: boolean;
  skillRecommendations: boolean;
  rememberPreferences: boolean;
};

const DEFAULT_PROFILE: Profile = {
  name: "Rohit Verma",
  role: "Student",
  experience: "2 years",
};

const DEFAULT_PREFERENCES: Preferences = {
  profileType: "Career Explorer",
  careerFocus: "Software Engineering",
  workMode: "Remote",
  experienceLevel: "Mid Level",
  theme: "dark",
  applicationUpdates: true,
  careerMatches: true,
  skillRecommendations: true,
  rememberPreferences: true,
};

export default function SettingsPage() {
  const [profile, setProfile] =
    useState<Profile>(DEFAULT_PROFILE);

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  async function loadSettings() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/settings?studentId=${STUDENT_ID}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load settings"
        );
      }

      const loadedProfile: Profile =
        data.settings?.profile ?? DEFAULT_PROFILE;

      const loadedPreferences: Preferences =
        data.settings?.preferences ?? DEFAULT_PREFERENCES;

      setProfile(loadedProfile);
      setPreferences(loadedPreferences);

      applyTheme(loadedPreferences.theme);
    } catch (error) {
      console.error("Load settings error:", error);

      setMessage("Failed to load settings");

      // Keep defaults if API fails
      setProfile(DEFAULT_PROFILE);
      setPreferences(DEFAULT_PREFERENCES);
      applyTheme(DEFAULT_PREFERENCES.theme);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SAVE SETTINGS
  // =====================================================

  async function saveSettings(
    changes: Partial<Preferences> & {
      name?: string;
      role?: string;
      experience?: string;
    }
  ) {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        studentId: STUDENT_ID,

        name: changes.name ?? profile.name,
        role: changes.role ?? profile.role,
        experience:
          changes.experience ?? profile.experience,

        profileType:
          changes.profileType ??
          preferences.profileType,

        careerFocus:
          changes.careerFocus ??
          preferences.careerFocus,

        workMode:
          changes.workMode ??
          preferences.workMode,

        experienceLevel:
          changes.experienceLevel ??
          preferences.experienceLevel,

        theme:
          changes.theme ??
          preferences.theme,

        applicationUpdates:
          changes.applicationUpdates ??
          preferences.applicationUpdates,

        careerMatches:
          changes.careerMatches ??
          preferences.careerMatches,

        skillRecommendations:
          changes.skillRecommendations ??
          preferences.skillRecommendations,

        rememberPreferences:
          changes.rememberPreferences ??
          preferences.rememberPreferences,
      };

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save settings"
        );
      }

      // Update UI with returned DB data if available
      if (data.settings?.profile) {
        setProfile(data.settings.profile);
      }

      if (data.settings?.preferences) {
        setPreferences(data.settings.preferences);
      }

      if (changes.theme) {
        applyTheme(changes.theme);
      }

      setMessage("Changes saved successfully");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Save settings error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // PROFILE
  // =====================================================

  async function saveProfile() {
    await saveSettings({
      name: profile.name,
      role: profile.role,
      experience: profile.experience,
    });

    setEditing(false);
  }

  // =====================================================
  // CAREER PREFERENCES
  // =====================================================

  function updatePreference(
    key: keyof Preferences,
    value: string | boolean
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveCareerPreferences() {
    await saveSettings({
      profileType: preferences.profileType,
      careerFocus: preferences.careerFocus,
      workMode: preferences.workMode,
      experienceLevel: preferences.experienceLevel,
    });
  }

  // =====================================================
  // THEME
  // =====================================================

  async function changeTheme(theme: Theme) {
    setPreferences((current) => ({
      ...current,
      theme,
    }));

    applyTheme(theme);

    await saveSettings({
      theme,
    });
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  async function changeNotification(
    key:
      | "applicationUpdates"
      | "careerMatches"
      | "skillRecommendations"
  ) {
    const newValue = !preferences[key];

    setPreferences((current) => ({
      ...current,
      [key]: newValue,
    }));

    await saveSettings({
      [key]: newValue,
    });
  }

  // =====================================================
  // REMEMBER PREFERENCES
  // =====================================================

  async function changeRememberPreferences() {
    const newValue =
      !preferences.rememberPreferences;

    setPreferences((current) => ({
      ...current,
      rememberPreferences: newValue,
    }));

    await saveSettings({
      rememberPreferences: newValue,
    });
  }

  // =====================================================
  // RESET
  // =====================================================

  async function resetSettings() {
    const confirmed = window.confirm(
      "Reset all settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    setProfile(DEFAULT_PROFILE);
    setPreferences(DEFAULT_PREFERENCES);

    applyTheme("dark");

    await saveSettings({
      name: DEFAULT_PROFILE.name,
      role: DEFAULT_PROFILE.role,
      experience: DEFAULT_PROFILE.experience,

      profileType:
        DEFAULT_PREFERENCES.profileType,

      careerFocus:
        DEFAULT_PREFERENCES.careerFocus,

      workMode:
        DEFAULT_PREFERENCES.workMode,

      experienceLevel:
        DEFAULT_PREFERENCES.experienceLevel,

      theme: DEFAULT_PREFERENCES.theme,

      applicationUpdates:
        DEFAULT_PREFERENCES.applicationUpdates,

      careerMatches:
        DEFAULT_PREFERENCES.careerMatches,

      skillRecommendations:
        DEFAULT_PREFERENCES.skillRecommendations,

      rememberPreferences:
        DEFAULT_PREFERENCES.rememberPreferences,
    });

    setEditing(false);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="settings-page min-h-screen px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="settings-card rounded-2xl p-8">
            <div className="settings-muted text-sm">
              Loading settings...
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="settings-page min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/"
            className="settings-back mb-6 inline-flex items-center gap-2 text-xs"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="settings-accent text-xs uppercase tracking-wide">
                Preferences
              </p>

              <h1 className="settings-title mt-2 text-3xl font-semibold">
                Settings
              </h1>

              <p className="settings-muted mt-2 text-sm">
                Manage your CareerGraph AI preferences.
              </p>
            </div>

            {message && (
              <div className="settings-success rounded-lg px-3 py-2 text-xs">
                {message}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <section className="settings-card rounded-2xl p-5 sm:p-6">

          <div className="flex items-start justify-between">
            <SectionTitle
              icon={<UserRound size={18} />}
              title="Profile"
              description="Your CareerGraph AI profile."
            />

            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="settings-button flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-6 space-y-4">

              <Input
                label="Name"
                value={profile.name}
                onChange={(value) =>
                  setProfile((current) => ({
                    ...current,
                    name: value,
                  }))
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Role"
                  value={profile.role}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      role: value,
                    }))
                  }
                />

                <Input
                  label="Experience"
                  value={profile.experience}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      experience: value,
                    }))
                  }
                />

              </div>

              <div className="flex gap-2 pt-2">

                <button
                  type="button"
                  disabled={saving}
                  onClick={saveProfile}
                  className="settings-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium"
                >
                  <Save size={14} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    loadSettings();
                    setEditing(false);
                  }}
                  className="settings-button rounded-lg px-4 py-2.5 text-xs"
                >
                  Cancel
                </button>

              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <InfoCard
                label="Name"
                value={profile.name}
              />

              <InfoCard
                label="Role"
                value={profile.role}
              />

              <InfoCard
                label="Profile Type"
                value={preferences.profileType}
              />

              <InfoCard
                label="Experience"
                value={profile.experience}
              />

            </div>
          )}

        </section>

        {/* =====================================================
            CAREER PREFERENCES
        ===================================================== */}

        <section className="settings-card mt-5 rounded-2xl p-5 sm:p-6">

          <SectionTitle
            icon={<BriefcaseBusiness size={18} />}
            title="Career Preferences"
            description="Choose what matters for your career exploration."
          />

          <div className="mt-6 space-y-4">

            <Select
              label="Profile Type"
              value={preferences.profileType}
              options={[
                "Career Explorer",
                "Job Seeker",
                "Career Switcher",
                "Professional",
              ]}
              onChange={(value) =>
                updatePreference(
                  "profileType",
                  value
                )
              }
            />

            <Select
              label="Career Focus"
              value={preferences.careerFocus}
              options={[
                "Software Engineering",
                "Data Science",
                "Product Management",
                "Cybersecurity",
                "Cloud Engineering",
              ]}
              onChange={(value) =>
                updatePreference(
                  "careerFocus",
                  value
                )
              }
            />

            <Select
              label="Work Mode"
              value={preferences.workMode}
              options={[
                "Remote",
                "Hybrid",
                "On-site",
              ]}
              onChange={(value) =>
                updatePreference(
                  "workMode",
                  value
                )
              }
            />

            <Select
              label="Experience Level"
              value={
                preferences.experienceLevel
              }
              options={[
                "Entry Level",
                "Mid Level",
                "Senior Level",
              ]}
              onChange={(value) =>
                updatePreference(
                  "experienceLevel",
                  value
                )
              }
            />

            <button
              type="button"
              disabled={saving}
              onClick={saveCareerPreferences}
              className="settings-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium"
            >
              <Save size={14} />

              {saving
                ? "Saving..."
                : "Save Preferences"}
            </button>

          </div>

        </section>

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <section className="settings-card mt-5 rounded-2xl p-5 sm:p-6">

          <SectionTitle
            icon={<Bell size={18} />}
            title="Notifications"
            description="Control which career updates you receive."
          />

          <div className="mt-5">

            <Toggle
              title="Application updates"
              description="Show updates when application status changes."
              enabled={
                preferences.applicationUpdates
              }
              onChange={() =>
                changeNotification(
                  "applicationUpdates"
                )
              }
            />

            <Toggle
              title="Career match alerts"
              description="Show relevant career opportunities."
              enabled={
                preferences.careerMatches
              }
              onChange={() =>
                changeNotification(
                  "careerMatches"
                )
              }
            />

            <Toggle
              title="Skill gap recommendations"
              description="Show recommended skills to improve your matches."
              enabled={
                preferences.skillRecommendations
              }
              onChange={() =>
                changeNotification(
                  "skillRecommendations"
                )
              }
            />

          </div>

        </section>

        {/* =====================================================
            APPEARANCE
        ===================================================== */}

        <section className="settings-card mt-5 rounded-2xl p-5 sm:p-6">

          <SectionTitle
            icon={<Moon size={18} />}
            title="Appearance"
            description="Choose how CareerGraph AI looks on your device."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <ThemeButton
              title="Dark"
              icon={<Moon size={16} />}
              active={
                preferences.theme === "dark"
              }
              onClick={() =>
                changeTheme("dark")
              }
            />

            <ThemeButton
              title="Light"
              icon={<Sun size={16} />}
              active={
                preferences.theme === "light"
              }
              onClick={() =>
                changeTheme("light")
              }
            />

            <ThemeButton
              title="System"
              icon={<UserRound size={16} />}
              active={
                preferences.theme === "system"
              }
              onClick={() =>
                changeTheme("system")
              }
            />

          </div>

        </section>

        {/* =====================================================
            PRIVACY
        ===================================================== */}

        <section className="settings-card mt-5 rounded-2xl p-5 sm:p-6">

          <SectionTitle
            icon={<ShieldCheck size={18} />}
            title="Privacy & Data"
            description="Control how preferences are remembered."
          />

          <div className="settings-inner-card mt-5 flex items-center justify-between gap-4 rounded-xl p-4">

            <div>
              <p className="settings-text text-sm">
                Remember my preferences
              </p>

              <p className="settings-muted mt-1 text-xs">
                Save your UI preferences in the CareerGraph data layer.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={
                preferences.rememberPreferences
              }
              onClick={
                changeRememberPreferences
              }
              className={`settings-toggle ${
                preferences.rememberPreferences
                  ? "enabled"
                  : ""
              }`}
            >
              <span
                className={`settings-toggle-dot ${
                  preferences.rememberPreferences
                    ? "active"
                    : ""
                }`}
              />
            </button>

          </div>

        </section>

        {/* =====================================================
            RESET
        ===================================================== */}

        <section className="settings-reset mt-5 rounded-2xl p-5">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="settings-text text-sm">
                Reset Preferences
              </p>

              <p className="settings-muted mt-1 text-xs">
                Restore all settings to their default values.
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={resetSettings}
              className="settings-danger flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs"
            >
              <RotateCcw size={14} />
              Reset Settings
            </button>

          </div>

        </section>

        <div className="py-8 text-center">

          <Link
            href="/about"
            className="settings-accent text-xs hover:opacity-80"
          >
            Learn more about CareerGraph AI →
          </Link>

        </div>

      </div>
    </main>
  );
}

// =====================================================
// THEME
// =====================================================

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.classList.remove("theme-light");

  if (theme === "light") {
    root.classList.add("theme-light");
    root.style.colorScheme = "light";
    return;
  }

  if (theme === "dark") {
    root.style.colorScheme = "dark";
    return;
  }

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (prefersDark) {
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("theme-light");
    root.style.colorScheme = "light";
  }
}

// =====================================================
// SECTION TITLE
// =====================================================

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

      <div className="settings-icon flex h-9 w-9 items-center justify-center rounded-lg">
        {icon}
      </div>

      <div>
        <h2 className="settings-title text-sm font-semibold">
          {title}
        </h2>

        <p className="settings-muted mt-1 text-xs">
          {description}
        </p>
      </div>

    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="settings-inner-card rounded-xl p-4">

      <p className="settings-label text-[10px] uppercase tracking-wide">
        {label}
      </p>

      <p className="settings-text mt-2 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

// =====================================================
// INPUT
// =====================================================

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">

      <span className="settings-label mb-2 block text-[10px] uppercase tracking-wide">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="settings-input w-full rounded-xl px-4 py-3 text-sm outline-none"
      />

    </label>
  );
}

// =====================================================
// SELECT
// =====================================================

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">

      <span className="settings-label mb-2 block text-[10px] uppercase tracking-wide">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="settings-input w-full rounded-xl px-4 py-3 text-sm outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </label>
  );
}

// =====================================================
// TOGGLE
// =====================================================

function Toggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="settings-toggle-row flex items-center justify-between gap-4 py-4">

      <div>
        <p className="settings-text text-sm">
          {title}
        </p>

        <p className="settings-muted mt-1 text-xs">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`settings-toggle ${
          enabled ? "enabled" : ""
        }`}
      >
        <span
          className={`settings-toggle-dot ${
            enabled ? "active" : ""
          }`}
        >
          {enabled && (
            <Check
              size={9}
              className="text-violet-600"
            />
          )}
        </span>
      </button>

    </div>
  );
}

// =====================================================
// THEME BUTTON
// =====================================================

function ThemeButton({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`settings-theme-button ${
        active ? "active" : ""
      }`}
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={
              active
                ? "text-violet-500"
                : "settings-muted"
            }
          >
            {icon}
          </span>

          <span className="settings-text text-sm">
            {title}
          </span>

        </div>

        {active && (
          <span className="settings-theme-check flex h-5 w-5 items-center justify-center rounded-full">
            <Check size={10} />
          </span>
        )}

      </div>
    </button>
  );
}