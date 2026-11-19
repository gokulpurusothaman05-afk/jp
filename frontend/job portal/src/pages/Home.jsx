import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    navigate(`/jobs?${params.toString()}`);
  }

  return (
    <div className="home-page">

        {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">

          <span className="hero-label">
            FIND YOUR NEXT OPPORTUNITY
          </span>

          <h1>
            Find a job that
            <span> moves your career forward.</span>
          </h1>

          <p>
            Discover opportunities and connect with employers
            to take the next step in your career.
          </p>

          <form className="search-form" onSubmit={handleSearch}>

            <input
              type="text"
              placeholder="Job title or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <button type="submit">
              Search Jobs
            </button>

          </form>

          <div className="hero-links">
            <Link to="/jobs">Browse all jobs</Link>
          </div>

        </div>
      </section>

      {/* Categories Section */}
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Browse job categories</h2>
          </div>
        </div>

        <div className="empty-category">
          Job categories will appear here when available.
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="content-section featured-section">
        <div className="section-heading">
          <div>
            <span className="section-label">OPPORTUNITIES</span>
            <h2>Featured jobs</h2>
            <p>Explore the latest available opportunities.</p>
          </div>

          <Link to="/jobs" className="view-all-link">
            View all jobs →
          </Link>
        </div>

        <div className="empty-jobs">
          <h3>No featured jobs available yet</h3>
          <p>
            Published jobs will appear here once employers
            add them to the portal.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Home;