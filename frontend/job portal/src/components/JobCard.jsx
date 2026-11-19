import { Link } from "react-router-dom";

function JobCard({ job }) {
  if (!job) return null;

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <h3>{job.title}</h3>
          <p>{job.company?.name}</p>
        </div>

        <span className="job-type">
          {job.jobType}
        </span>
      </div>

      <div className="job-meta">
        <span>{job.location}</span>
        <span>{job.experience}</span>
        <span>{job.salary || "Salary not disclosed"}</span>
      </div>

      <p className="job-description">
        {job.description}
      </p>

      <Link to={`/jobs/${job._id}`} className="job-details-btn">
        View Details
      </Link>
    </article>
  );
}

export default JobCard;