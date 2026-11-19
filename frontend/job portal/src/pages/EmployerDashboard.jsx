import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function EmployerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/api/jobs/employer/dashboard/summary"
      );

      setSummary(data.summary);
    } catch (err) {
      setError(err.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      setUpdateMessage("");

      await apiRequest(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });

      // Update state in summary
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentApplications: prev.recentApplications?.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        };
      });

      setUpdateMessage("Application status updated");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="page-message">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p className="page-message error-message">
        {error}
      </p>
    );
  }

  if (!summary) {
    return <p className="page-message">Dashboard data unavailable.</p>;
  }

  const {
    totalJobs,
    activeJobs,
    closedJobs,
    totalApplications,
    recentJobs = [],
    recentApplications = []
  } = summary;

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header-row">
          <div>
            <h1>Employer Dashboard</h1>
            <p>Manage your job postings and review applicant submissions.</p>
          </div>

          <Link to="/employer/jobs/create" className="dashboard-primary-btn">
            + Post a New Job
          </Link>
        </div>

        {updateMessage && (
          <div className="success-banner">{updateMessage}</div>
        )}

        {/* Statistics */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Jobs</h3>
            <p>{totalJobs}</p>
          </div>

          <div className="stat-card">
            <h3>Active Jobs</h3>
            <p>{activeJobs}</p>
          </div>

          <div className="stat-card">
            <h3>Closed Jobs</h3>
            <p>{closedJobs}</p>
          </div>

          <div className="stat-card">
            <h3>Total Applicants</h3>
            <p>{totalApplications}</p>
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="dashboard-section">
          <div className="section-title-row">
            <h2>Your Job Postings</h2>
            <Link to="/employer/jobs/create" className="text-link">
              + Post New Job
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>Create your first job posting to start receiving applications.</p>
              <Link to="/employer/jobs/create">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="dashboard-list">
              {recentJobs.map((job) => (
                <div className="dashboard-item job-item" key={job._id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company?.name || "Company"}</p>
                    <p>{job.location}</p>
                  </div>

                  <div className="job-item-actions">
                    <span className="applicant-counter-pill">
                      👥 {job.applicantCount ?? 0} {job.applicantCount === 1 ? "Applicant" : "Applicants"}
                    </span>

                    <span className="application-status">
                      {job.status}
                    </span>

                    <Link
                      to={`/employer/jobs/${job._id}/applicants`}
                      className="view-applicants-btn"
                    >
                      View Applicants →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applicants Across All Jobs */}
        <div className="dashboard-section">
          <div className="section-title-row">
            <h2>Recent Candidate Applications</h2>
            <span className="applicant-total-count">
              {totalApplications} Total {totalApplications === 1 ? "Candidate" : "Candidates"}
            </span>
          </div>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <h3>No applications received yet</h3>
              <p>
                When candidates apply to any of your active job listings, their details, resume, and contact information will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="dashboard-list">
              {recentApplications.map((app) => (
                <div className="dashboard-item applicant-row" key={app._id}>
                  <div className="applicant-info-block">
                    <div className="applicant-avatar-sm">
                      {app.applicant?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h3>{app.applicant?.name || "Candidate"}</h3>
                      <p className="applicant-email-text">
                        ✉ {app.applicant?.email}
                      </p>
                      <p className="applied-for-tag">
                        Applied for: <strong>{app.job?.title || "Job Posting"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="applicant-status-controls">
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="resume-pill-link"
                      >
                        📄 View Resume ↗
                      </a>
                    )}

                    <span className={`status-pill status-${app.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {app.status}
                    </span>

                    <div className="quick-status-selector">
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default EmployerDashboard;
