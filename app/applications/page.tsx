"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ============================================================
   TYPES
   ============================================================ */

type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Selected"
  | "Rejected";

type Application = {
  id: string;
  studentId: string;
  studentName?: string | null;
  jobId: string;
  jobTitle?: string | null;
  company?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
};

type Stats = {
  applied: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  selected: number;
  rejected: number;
  total: number;
};

type ApplicationsResponse = {
  success: boolean;
  applications: Application[];
  stats?: Partial<Stats>;
  message?: string;
};

/* ============================================================
   STATUS OPTIONS
   ============================================================ */

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Applied",
  "Shortlisted",
  "Interview",
  "Offer",
  "Selected",
  "Rejected",
];

/* ============================================================
   EMPTY STATS
   ============================================================ */

const EMPTY_STATS: Stats = {
  applied: 0,
  shortlisted: 0,
  interviews: 0,
  offers: 0,
  selected: 0,
  rejected: 0,
  total: 0,
};

/* ============================================================
   PAGE
   ============================================================ */

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<
    Application[]
  >([]);

  const [stats, setStats] =
    useState<Stats>(EMPTY_STATS);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  /* ==========================================================
     LOAD APPLICATIONS
     ========================================================== */

  const loadApplications = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/applications",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ApplicationsResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to fetch applications"
          );
        }

        const loadedApplications =
          data.applications ?? [];

        setApplications(
          loadedApplications
        );

        setStats({
          applied:
            data.stats?.applied ?? 0,

          shortlisted:
            data.stats?.shortlisted ?? 0,

          interviews:
            data.stats?.interviews ?? 0,

          offers:
            data.stats?.offers ?? 0,

          selected:
            data.stats?.selected ?? 0,

          rejected:
            data.stats?.rejected ?? 0,

          total:
            data.stats?.total ??
            loadedApplications.length,
        });
      } catch (error) {
        console.error(
          "Applications fetch error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load applications"
        );

        setApplications([]);
        setStats(EMPTY_STATS);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ==========================================================
     INITIAL LOAD
     ========================================================== */

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  /* ==========================================================
     UPDATE APPLICATION STATUS
     ========================================================== */

  const updateApplicationStatus = async (
    application: Application,
    newStatus: ApplicationStatus
  ) => {
    if (
      application.status === newStatus
    ) {
      return;
    }

    try {
      setUpdatingId(application.id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/applications",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            studentId:
              application.studentId,

            jobId:
              application.jobId,

            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update application"
        );
      }

      /*
       * PATCH successful.
       *
       * Database is the source of truth.
       * Fresh GET call se applications
       * aur stats dobara load honge.
       */

      await loadApplications();

      setSuccessMessage(
        `Status updated to ${newStatus}`
      );

      /*
       * Success message ko 2.5 seconds
       * baad hide karo.
       */

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* ==========================================================
     SEARCH
     ========================================================== */

  const filteredApplications =
    useMemo(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      if (!search) {
        return applications;
      }

      return applications.filter(
        (application) => {
          const studentName =
            application.studentName?.toLowerCase() ??
            "";

          const jobTitle =
            application.jobTitle?.toLowerCase() ??
            "";

          const company =
            application.company?.toLowerCase() ??
            "";

          const status =
            application.status?.toLowerCase() ??
            "";

          const studentId =
            application.studentId?.toLowerCase() ??
            "";

          const jobId =
            application.jobId?.toLowerCase() ??
            "";

          return (
            studentName.includes(
              search
            ) ||
            jobTitle.includes(
              search
            ) ||
            company.includes(
              search
            ) ||
            status.includes(
              search
            ) ||
            studentId.includes(
              search
            ) ||
            jobId.includes(
              search
            )
          );
        }
      );
    }, [
      applications,
      searchQuery,
    ]);

  /* ==========================================================
     FORMAT DATE
     ========================================================== */

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "—";
    }

    try {
      const cleanedDate =
        date
          .replace(/\{.*\}/, "")
          .trim();

      const parsed =
        new Date(cleanedDate);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return date;
      }

      return parsed.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  /* ==========================================================
     STATUS CLASS
     ========================================================== */

  const getStatusClass = (
    status: ApplicationStatus
  ) => {
    switch (status) {
      case "Applied":
        return "status-applied";

      case "Shortlisted":
        return "status-shortlisted";

      case "Interview":
        return "status-interview";

      case "Offer":
        return "status-offer";

      case "Selected":
        return "status-selected";

      case "Rejected":
        return "status-rejected";

      default:
        return "status-applied";
    }
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #05070d;
          color: #f8fafc;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .applications-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top right,
              rgba(124, 58, 237, 0.08),
              transparent 30%
            ),
            #05070d;

          padding: 48px 24px 80px;
        }

        .applications-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 32px;
        }

        .eyebrow {
          color: #8b5cf6;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .page-title {
          margin: 0;
          font-size: 36px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .page-description {
          margin: 12px 0 0;
          color: #7182a1;
          font-size: 15px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .refresh-button {
          border: 1px solid #2b3445;
          background: #0d111a;
          color: #dbe4f5;
          border-radius: 10px;
          padding: 11px 17px;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }

        .refresh-button:hover {
          border-color: #8b5cf6;
          background: #111625;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-box {
          margin-bottom: 20px;
          border: 1px solid rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.07);
          color: #86efac;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
        }

        .error-box {
          margin-bottom: 20px;
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.07);
          color: #fca5a5;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .stat-card {
          border: 1px solid #252c3a;
          border-radius: 16px;
          background: #0b0f17;
          padding: 22px;
          min-height: 130px;
        }

        .stat-label {
          color: #91a0bc;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 30px;
          line-height: 1;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .stat-description {
          color: #60708e;
          font-size: 12px;
        }

        .applications-card {
          border: 1px solid #252c3a;
          border-radius: 18px;
          background: #090d15;
          overflow: hidden;
        }

        .applications-header {
          padding: 22px;
          border-bottom: 1px solid #252c3a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .applications-heading {
          margin: 0;
          font-size: 20px;
        }

        .applications-count {
          margin-top: 7px;
          color: #63728e;
          font-size: 13px;
        }

        .search-wrapper {
          position: relative;
          width: 280px;
        }

        .search-input {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          border: 1px solid #30394c;
          background: #0d121c;
          color: #f8fafc;
          padding: 0 40px 0 15px;
          outline: none;
          font-size: 14px;
        }

        .search-input:focus {
          border-color: #8b5cf6;
          box-shadow:
            0 0 0 2px
            rgba(139, 92, 246, 0.12);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #71809b;
          cursor: pointer;
          font-size: 18px;
        }

        .application-list {
          display: flex;
          flex-direction: column;
        }

        .application-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 22px;
          border-bottom: 1px solid #202735;
        }

        .application-row:last-child {
          border-bottom: 0;
        }

        .application-info {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .application-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          border-radius: 12px;
          background: rgba(
            124,
            58,
            237,
            0.16
          );
          border: 1px solid rgba(
            139,
            92,
            246,
            0.2
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
          font-size: 18px;
        }

        .application-main {
          min-width: 0;
        }

        .job-title {
          color: #f5f7fb;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .student-name {
          color: #a78bfa;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .company-name {
          color: #73819b;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .applied-date {
          color: #596781;
          font-size: 12px;
        }

        .status-area {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .status-select {
          min-width: 150px;
          border-radius: 20px;
          padding: 9px 14px;
          outline: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          appearance: auto;
        }

        .status-select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .status-applied {
          color: #34d399;
          background: rgba(
            16,
            185,
            129,
            0.08
          );
          border: 1px solid rgba(
            16,
            185,
            129,
            0.35
          );
        }

        .status-shortlisted {
          color: #a78bfa;
          background: rgba(
            139,
            92,
            246,
            0.1
          );
          border: 1px solid rgba(
            139,
            92,
            246,
            0.4
          );
        }

        .status-interview {
          color: #60a5fa;
          background: rgba(
            59,
            130,
            246,
            0.1
          );
          border: 1px solid rgba(
            59,
            130,
            246,
            0.4
          );
        }

        .status-offer {
          color: #fbbf24;
          background: rgba(
            245,
            158,
            11,
            0.1
          );
          border: 1px solid rgba(
            245,
            158,
            11,
            0.45
          );
        }

        .status-selected {
          color: #22c55e;
          background: rgba(
            34,
            197,
            94,
            0.1
          );
          border: 1px solid rgba(
            34,
            197,
            94,
            0.4
          );
        }

        .status-rejected {
          color: #f87171;
          background: rgba(
            239,
            68,
            68,
            0.08
          );
          border: 1px solid rgba(
            239,
            68,
            68,
            0.35
          );
        }

        .loading-container {
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 18px;
          color: #7182a1;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid #252c3a;
          border-top-color: #8b5cf6;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 40px;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: rgba(
            124,
            58,
            237,
            0.12
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a78bfa;
          font-size: 25px;
          margin-bottom: 18px;
        }

        .empty-title {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .empty-description {
          color: #64738f;
          font-size: 14px;
          margin-bottom: 18px;
        }

        .clear-button {
          border: 1px solid #7048d8;
          color: #b9a1ff;
          background: rgba(
            124,
            58,
            237,
            0.08
          );
          border-radius: 9px;
          padding: 9px 14px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .applications-page {
            padding: 28px 14px 60px;
          }

          .top-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .page-title {
            font-size: 30px;
          }

          .header-actions {
            width: 100%;
          }

          .refresh-button {
            width: 100%;
          }

          .applications-header {
            align-items: stretch;
            flex-direction: column;
          }

          .search-wrapper {
            width: 100%;
          }

          .application-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .status-area {
            width: 100%;
          }

          .status-select {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="applications-page">
        <div className="applications-container">

          {/* ==================================================
              HEADER
              ================================================== */}

          <div className="top-row">

            <div>
              <div className="eyebrow">
                Career Tracking
              </div>

              <h1 className="page-title">
                My Applications
              </h1>

              <p className="page-description">
                Track your job applications and
                career progress in one place.
              </p>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="refresh-button"
                onClick={() => {
                  setSuccessMessage("");
                  void loadApplications();
                }}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : "↻ Refresh"}
              </button>
            </div>

          </div>

          {/* ==================================================
              SUCCESS
              ================================================== */}

          {successMessage && (
            <div className="success-box">
              ✓ {successMessage}
            </div>
          )}

          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* ==================================================
              LOADING
              ================================================== */}

          {loading ? (
            <section className="applications-card">

              <div className="loading-container">

                <div className="spinner" />

                <div>
                  <strong>
                    Loading Applications...
                  </strong>

                  <div
                    style={{
                      marginTop: 6,
                    }}
                  >
                    Fetching your applications
                    from the career graph
                  </div>
                </div>

              </div>

            </section>
          ) : (
            <>
              {/* ================================================
                  STATS
                  ================================================ */}

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-label">
                    Applied
                  </div>

                  <div className="stat-value">
                    {stats.applied}
                  </div>

                  <div className="stat-description">
                    Applications submitted
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Shortlisted
                  </div>

                  <div className="stat-value">
                    {stats.shortlisted}
                  </div>

                  <div className="stat-description">
                    Applications shortlisted
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Interviews
                  </div>

                  <div className="stat-value">
                    {stats.interviews}
                  </div>

                  <div className="stat-description">
                    Interview stages
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Offers
                  </div>

                  <div className="stat-value">
                    {stats.offers}
                  </div>

                  <div className="stat-description">
                    Offers received
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Selected
                  </div>

                  <div className="stat-value">
                    {stats.selected}
                  </div>

                  <div className="stat-description">
                    Selected applications
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Rejected
                  </div>

                  <div className="stat-value">
                    {stats.rejected}
                  </div>

                  <div className="stat-description">
                    Rejected applications
                  </div>
                </div>

              </div>

              {/* ================================================
                  APPLICATIONS
                  ================================================ */}

              <section className="applications-card">

                <div className="applications-header">

                  <div>
                    <h2 className="applications-heading">
                      Applications
                    </h2>

                    <div className="applications-count">
                      {filteredApplications.length}{" "}
                      applications
                    </div>
                  </div>

                  <div className="search-wrapper">

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search applications..."
                      className="search-input"
                    />

                    {searchQuery && (
                      <button
                        type="button"
                        className="search-clear"
                        onClick={() =>
                          setSearchQuery("")
                        }
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}

                  </div>

                </div>

                {/* ==============================================
                    EMPTY
                    ============================================== */}

                {filteredApplications.length ===
                0 ? (
                  <div className="empty-state">

                    <div className="empty-icon">
                      ◎
                    </div>

                    <div className="empty-title">
                      No matching applications
                    </div>

                    <div className="empty-description">
                      {applications.length ===
                      0
                        ? "You have no applications yet."
                        : "Try searching for a different student, job, company or status."}
                    </div>

                    {searchQuery && (
                      <button
                        type="button"
                        className="clear-button"
                        onClick={() =>
                          setSearchQuery("")
                        }
                      >
                        Clear Search
                      </button>
                    )}

                  </div>
                ) : (
                  /* ==============================================
                     LIST
                     ============================================== */

                  <div className="application-list">

                    {filteredApplications.map(
                      (application) => (
                        <div
                          className="application-row"
                          key={application.id}
                        >

                          <div className="application-info">

                            <div className="application-icon">
                              ▣
                            </div>

                            <div className="application-main">

                              <div className="job-title">
                                {application.jobTitle ||
                                  "Unknown Job"}
                              </div>

                              {application.studentName && (
                                <div className="student-name">
                                  {
                                    application.studentName
                                  }
                                </div>
                              )}

                              <div className="company-name">
                                {application.company ||
                                  "Company not available"}
                              </div>

                              <div className="applied-date">
                                Applied{" "}
                                {formatDate(
                                  application.appliedAt
                                )}
                              </div>

                            </div>

                          </div>

                          {/* =====================================
                              STATUS
                              ===================================== */}

                          <div className="status-area">

                            <select
                              value={
                                application.status
                              }
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onChange={(event) =>
                                void updateApplicationStatus(
                                  application,
                                  event.target
                                    .value as ApplicationStatus
                                )
                              }
                              className={`status-select ${getStatusClass(
                                application.status
                              )}`}
                              aria-label={`Status for ${
                                application.jobTitle ||
                                "application"
                              }`}
                            >

                              {STATUS_OPTIONS.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {updatingId ===
                                      application.id &&
                                    status ===
                                      application.status
                                      ? "Updating..."
                                      : status}
                                  </option>
                                )
                              )}

                            </select>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </section>
            </>
          )}

        </div>
      </main>
    </>
  );
}