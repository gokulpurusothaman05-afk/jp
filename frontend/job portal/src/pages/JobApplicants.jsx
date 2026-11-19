import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function JobApplicants() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch applicants for this job
        const data = await apiRequest(`/api/applications/job/${jobId}`);

        if (isActive) {
          setApplicants(data.applications || []);
          if (data.applications?.[0]?.job) {
            setJob(data.applications[0].job);
          }
        }

        // Also fetch the job details if job info wasn't in applications
        if (isActive && !data.applications?.[0]?.job) {
          try {
            const jobRes = await apiRequest(`/api/jobs/${jobId}`);
            if (isActive) {
              setJob(jobRes.job);
            }
          } catch {
            // Optional fallback
          }
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Unable to load applicants");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchApplicants();

    return () => {
      isActive = false;
    };
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      setStatusMessage("");

      await apiRequest(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setStatusMessage("Applicant status updated successfully");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (filterStatus === "all") return true;
    return app.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <section className="applicants-page">
      <div className="applicants-container">
        <Link to="/employer/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="applicants-header">
          <div>
            <h1>Applicants for {job?.title || "Job Posting"}</h1>
            <p>
              {job?.location && <span>{job.location} • </span>}
              Manage and review all candidates who applied for this role.
            </p>
          </div>
          <span className="applicant-total-badge">
            {applicants.length} Total {applicants.length === 1 ? "Applicant" : "Applicants"}
          </span>
        </div>

        {statusMessage && (
          <div className="success-banner">{statusMessage}</div>
        )}

        {/* Status Filters */}
        <div className="applicants-filters">
          <label htmlFor="filterStatus">Filter by status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Applicants ({applicants.length})</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* States */}
        {loading && <p className="page-message">Loading applicants...</p>}

        {!loading && error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && filteredApplicants.length === 0 && (
          <div className="empty-state">
            <h3>No applicants found</h3>
            <p>
              {filterStatus === "all"
                ? "No job seekers have applied for this position yet."
                : `No candidates currently with status "${filterStatus}".`}
            </p>
          </div>
        )}

        {/* Applicant Cards List */}
        {!loading && !error && filteredApplicants.length > 0 && (
          <div className="applicants-list">
            {filteredApplicants.map((app) => (
              <article key={app._id} className="applicant-card">
                <div className="applicant-card-header">
                  <div className="applicant-profile">
                    <div className="applicant-avatar">
                      {app.applicant?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h3>{app.applicant?.name || "Anonymous Applicant"}</h3>
                      <a
                        href={`mailto:${app.applicant?.email}`}
                        className="applicant-email"
                      >
                        ✉ {app.applicant?.email || "No email available"}
                      </a>
                    </div>
                  </div>

                  <div className="applicant-meta-actions">
                    <span className={`status-pill status-${app.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {app.status}
                    </span>

                    <div className="status-updater">
                      <label htmlFor={`status-${app._id}`}>Change Status:</label>
                      <select
                        id={`status-${app._id}`}
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

                <div className="applicant-body">
                  {app.coverLetter && (
                    <div className="applicant-cover-letter">
                      <strong>Cover Letter:</strong>
                      <p>{app.coverLetter}</p>
                    </div>
                  )}

                  <div className="applicant-footer">
                    <span className="applied-date">
                      Applied on: {new Date(app.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>

                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="resume-btn"
                      >
                        📄 View Resume ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JobApplicants;
