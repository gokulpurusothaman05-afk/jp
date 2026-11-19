import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  // Fetch one job using the ID from the URL
  useEffect(() => {
    let isActive = true;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");
        setJob(null);

        const data = await apiRequest(`/api/jobs/${id}`);

        if (isActive) {
          setJob(data.job);
        }
      } catch (error) {
        if (isActive) {
          setError(error.message || "Unable to load this job");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchJob();

    return () => {
      isActive = false;
    };
  }, [id]);

  // Submit a job application
  const handleApply = async (event) => {
    event.preventDefault();
    setApplicationMessage("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "jobSeeker") {
      setApplicationMessage(
        "Only job seekers can apply for jobs."
      );
      return;
    }

    try {
      setApplying(true);

      const data = await apiRequest(
        `/api/applications/${id}/apply`,
        {
          method: "POST",
          body: JSON.stringify({
            resume,
            coverLetter
          })
        }
      );

      setApplicationMessage(
        data.message || "Application submitted successfully."
      );

      setResume("");
      setCoverLetter("");
    } catch (error) {
      setApplicationMessage(
        error.message || "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <p className="page-message">Loading job details...</p>;
  }

  if (error) {
    return (
      <div className="job-not-found">
        <h2>Unable to load job</h2>
        <p>{error}</p>
        <Link to="/jobs">Back to Jobs</Link>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-not-found">
        <h2>Job not found</h2>
        <Link to="/jobs">Back to Jobs</Link>
      </div>
    );
  }

  const canApply =
    isAuthenticated &&
    user?.role === "jobSeeker" &&
    job.status === "active";

  return (
    <section className="job-details-page">
      <div className="job-details-container">
        <Link to="/jobs">← Back to Jobs</Link>

        <div className="job-details-card">
          <h1>{job.title}</h1>
          <h3>{job.company?.name}</h3>

          <div className="job-meta">
            <span>{job.location}</span>
            <span>{job.jobType}</span>
            <span>{job.experience}</span>
            <span>{job.salary || "Salary not disclosed"}</span>
          </div>

          <h3>Job Description</h3>
          <p>{job.description}</p>

          {job.skills?.length > 0 && (
            <>
              <h3>Required Skills</h3>
              <div className="job-skills">
                {job.skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>{skill}</span>
                ))}
              </div>
            </>
          )}

          {job.status !== "active" && (
            <p className="page-message">
              This job is no longer accepting applications.
            </p>
          )}
        </div>

        {/* Application section */}
        {canApply && (
          <div className="application-form-container">
            <h2>Apply for this Job</h2>

            <form onSubmit={handleApply}>
              <label htmlFor="resume">Resume URL</label>
              <input
                id="resume"
                type="url"
                placeholder="https://example.com/my-resume.pdf"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
              />

              <label htmlFor="coverLetter">Cover Letter</label>
              <textarea
                id="coverLetter"
                placeholder="Write a short cover letter (optional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              />

              <button type="submit" disabled={applying}>
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </form>

            {applicationMessage && (
              <p className="page-message">
                {applicationMessage}
              </p>
            )}
          </div>
        )}

        {/* Guest view */}
        {!isAuthenticated && job.status === "active" && (
          <div className="application-form-container">
            <h2>Interested in this job?</h2>
            <p>Log in as a job seeker to submit your application.</p>
            <Link to="/login">Login to Apply</Link>
          </div>
        )}

        {/* Employer view */}
        {isAuthenticated && user?.role === "employer" && (
          <p className="page-message">
            Employer accounts cannot apply for jobs.
          </p>
        )}
      </div>
    </section>
  );
}

export default JobDetails;