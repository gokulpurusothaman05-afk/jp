import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function EmployerDashboard() {
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
          "/api/jobs/employer/dashboard/summary"
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

  const {
    totalJobs,
    activeJobs,
    closedJobs,
    totalApplications,
    recentJobs
  } = summary;

  return (
    <section className="dashboard-page">
      <div className="dashboard-container">
        <h1>Employer Dashboard</h1>
        <p>Manage your job postings and applicants.</p>

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

        {/* Recent Jobs */}
        <div className="dashboard-section">
          <h2>Recent Job Postings</h2>

          {recentJobs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted any jobs yet.</p>
              <Link to="/employer/jobs/create">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="dashboard-list">
              {recentJobs.map((job) => (
                <div className="dashboard-item" key={job._id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.company?.name}</p>
                    <p>{job.location}</p>
                  </div>

                  <span className="application-status">
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link to="/employer/jobs/create">
          Post a New Job
        </Link>
      </div>
    </section>
  );
}

export default EmployerDashboard;