import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function JobSeekerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          "/api/applications/dashboard/summary"
        );

        if (isActive) {
          setSummary(data.summary);
        }
      } catch (error) {
        if (isActive) {
          setError(error.message || "Unable to load dashboard");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isActive = false;
    };
  }, []);

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

  const { totalApplications, statusCounts, recentApplications } = summary;

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <h1>Job Seeker Dashboard</h1>
        <p>Track your job applications and their progress.</p>

        {/* Statistics */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p>{totalApplications}</p>
          </div>

          <div className="stat-card">
            <h3>Under Review</h3>
            <p>{statusCounts["Under Review"]}</p>
          </div>

          <div className="stat-card">
            <h3>Shortlisted</h3>
            <p>{statusCounts.Shortlisted}</p>
          </div>

          <div className="stat-card">
            <h3>Selected</h3>
            <p>{statusCounts.Selected}</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="dashboard-section">
          <h2>Recent Applications</h2>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied for any jobs yet.</p>
              <Link to="/jobs">Explore Jobs</Link>
            </div>
          ) : (
            <div className="dashboard-list">
              {recentApplications.map((application) => (
                <div
                  className="dashboard-item"
                  key={application._id}
                >
                  <div>
                    <h3>{application.job?.title || "Job unavailable"}</h3>
                    <p>
                      {application.job?.company?.name || "Company unavailable"}
                    </p>
                    <p>{application.job?.location}</p>
                  </div>

                  <span className="application-status">
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link to="/jobs">Find More Jobs</Link>
      </div>
    </section>
  );
}

export default JobSeekerDashboard;