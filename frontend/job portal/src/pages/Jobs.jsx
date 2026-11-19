import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import { apiRequest } from "../services/api";

function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter values
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [location, setLocation] = useState(
    searchParams.get("location") || ""
  );

  const [jobType, setJobType] = useState(
    searchParams.get("jobType") || ""
  );

  const [experience, setExperience] = useState(
    searchParams.get("experience") || ""
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "newest"
  );

  // API data and UI states
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch jobs whenever URL filters change
  const queryString = searchParams.toString();

  useEffect(() => {
    let isActive = true;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = queryString
          ? `/api/jobs?${queryString}`
          : "/api/jobs";

        const data = await apiRequest(endpoint);

        if (isActive) {
          setJobs(data.jobs || []);
        }
      } catch (error) {
        if (isActive) {
          setError(error.message || "Unable to load jobs");
          setJobs([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    // Prevent an older request from updating the page
    // after the user changes filters.
    return () => {
      isActive = false;
    };
  }, [queryString]);

  // Apply filters
  const handleFilter = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    if (jobType) params.set("jobType", jobType);
    if (experience) params.set("experience", experience);

    params.set("sort", sort);

    setSearchParams(params);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setExperience("");
    setSort("newest");

    setSearchParams({});
  };

  return (
    <section className="jobs-page">
      <div className="jobs-container">
        <h1>Find Your Next Job</h1>
        <p>Explore available opportunities.</p>

        {/* Search and filters */}
        <form className="job-filters" onSubmit={handleFilter}>
          <input
            type="text"
            placeholder="Search job title or skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          >
            <option value="">All Experience Levels</option>
            <option value="Fresher">Fresher</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <button type="submit">Search Jobs</button>
          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </form>

        {/* API response states */}
        {loading && (
          <p className="page-message">Loading jobs...</p>
        )}

        {!loading && error && (
          <p className="page-message error-message">
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <h3>No jobs available</h3>
            <p>
              No jobs match your search. Try changing your filters.
            </p>
          </div>
        )}

        {/* Real jobs from MongoDB */}
        {!loading && !error && jobs.length > 0 && (
          <div className="jobs-list">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Jobs;