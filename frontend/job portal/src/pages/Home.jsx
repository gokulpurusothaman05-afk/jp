import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import { apiRequest } from "../services/api";

// Premium SVG Category Data
const CATEGORIES = [
  {
    name: "Frontend Development",
    query: "Frontend",
    subtitle: "React.js, Vue, UI Architecture",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 10-2 2 2 2" />
        <path d="m15 10 2 2-2 2" />
        <path d="m12 8-2 8" />
      </svg>
    )
  },
  {
    name: "Backend Engineering",
    query: "Backend",
    subtitle: "Node.js, Express, Microservices",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    )
  },
  {
    name: "Full Stack Engineering",
    query: "MERN",
    subtitle: "MERN Stack, End-to-End Systems",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      </svg>
    )
  },
  {
    name: "Software Development",
    query: "Developer",
    subtitle: "Algorithms, JavaScript, Core Eng",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" x2="20" y1="19" y2="19" />
      </svg>
    )
  },
  {
    name: "Cloud & DevOps",
    query: "Cloud",
    subtitle: "AWS, CI/CD, Infrastructure",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    )
  },
  {
    name: "Database & Architecture",
    query: "MongoDB",
    subtitle: "MongoDB, SQL, High Performance",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    )
  }
];

// Popular Searches Keywords
const POPULAR_KEYWORDS = [
  "Frontend",
  "Backend",
  "MERN Stack",
  "Full-time",
  "React.js",
  "Node.js"
];

function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest("/api/jobs?limit=10&sort=newest");
        if (isActive) {
          setFeaturedJobs(data.jobs || []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || "Unable to load featured jobs");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedJobs();

    return () => {
      isActive = false;
    };
  }, []);

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

  function handleKeywordClick(keyword) {
    navigate(`/jobs?search=${encodeURIComponent(keyword)}`);
  }

  function handleCategoryClick(query) {
    navigate(`/jobs?search=${encodeURIComponent(query)}`);
  }

  // Display only up to 4 featured jobs, followed by an enter jobs page card
  const displayedJobs = featuredJobs.slice(0, 4);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-label-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>DISCOVER YOUR NEXT CAREER OPPORTUNITY</span>
          </div>

          <h1>
            Find a job that
            <span> moves your career forward.</span>
          </h1>

          <p>
            Connect directly with verified tech employers, explore top developer vacancies,
            and fast-track your applications with transparent status tracking.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Job title, skills, or role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="search-input-wrapper location-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                placeholder="City, region, or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="search-submit-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span>Search Jobs</span>
            </button>
          </form>

          {/* Popular Search Tags */}
          <div className="popular-tags-row">
            <span className="tags-label">Popular Searches:</span>
            <div className="tags-list">
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  type="button"
                  key={kw}
                  className="quick-tag-pill"
                  onClick={() => handleKeywordClick(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section (Vertical Cards, Max 4 + Action Card) */}
      <section className="content-section featured-section">
        <div className="section-heading">
          <div>
            <span className="section-label">TOP VACANCIES</span>
            <h2>Featured Jobs</h2>
            <p>Explore the most in-demand opportunities open for applications right now.</p>
          </div>

          <Link to="/jobs" className="view-all-link">
            <span>View All Jobs</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading && (
          <p className="page-message">Loading featured opportunities...</p>
        )}

        {!loading && error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && displayedJobs.length === 0 && (
          <div className="empty-jobs">
            <h3>No featured jobs available right now</h3>
            <p>
              Check back soon or browse all vacancies to see newly posted listings.
            </p>
            <Link to="/jobs" className="browse-now-btn">
              Explore All Jobs
            </Link>
          </div>
        )}

        {/* Vertical list of up to 4 job cards + enter jobs page card */}
        {!loading && !error && displayedJobs.length > 0 && (
          <div className="featured-jobs-grid">
            {displayedJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}

            {/* Enter Jobs Page Action Card */}
            <article className="job-card explore-more-card">
              <div className="explore-card-content">
                <div className="explore-icon-circle">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h3>Looking for more job opportunities?</h3>
                  <p>
                    Browse our full directory of active postings, apply filters by role type or experience, and discover your next role.
                  </p>
                </div>
              </div>

              <Link to="/jobs" className="explore-card-btn">
                <span>Browse All Jobs</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </article>
          </div>
        )}
      </section>

      {/* Categories Section with Premium SVGs */}
      <section className="content-section categories-section">
        <div className="section-heading">
          <div>
            <span className="section-label">DOMAINS</span>
            <h2>Browse Job Categories</h2>
            <p>Select a specialization to filter matching career opportunities.</p>
          </div>

          <Link to="/jobs" className="view-all-link">
            <span>Explore All</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="category-card"
              onClick={() => handleCategoryClick(cat.query)}
            >
              <div className="category-icon">{cat.icon}</div>
              <div className="category-details">
                <h3>{cat.name}</h3>
                <p>{cat.subtitle}</p>
              </div>
              <span className="category-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features / Why Choose Us Section with Premium SVGs */}
      <section className="content-section features-section">
        <div className="section-heading-center">
          <span className="section-label">WHY JOBPORTAL</span>
          <h2>Everything You Need to Advance Your Career</h2>
          <p>A streamlined, modern recruitment experience designed for top talent and employers.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>Direct 1-Click Apply</h3>
            <p>
              Submit your resume and tailored cover letter directly to verified hiring employers with zero friction.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3>Real-Time Tracking</h3>
            <p>
              Stay updated as employers review your credentials, shortlist candidates, and make hiring decisions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>Verified Company Profiles</h3>
            <p>
              Discover genuine job postings with confirmed employer identities, work formats, and competitive salaries.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="21" x2="14" y1="4" y2="4" />
                <line x1="10" x2="3" y1="4" y2="4" />
                <line x1="21" x2="12" y1="12" y2="12" />
                <line x1="8" x2="3" y1="12" y2="12" />
                <line x1="21" x2="16" y1="20" y2="20" />
                <line x1="12" x2="3" y1="20" y2="20" />
                <line x1="14" x2="14" y1="2" y2="6" />
                <line x1="8" x2="8" y1="10" y2="14" />
                <line x1="16" x2="16" y1="18" y2="22" />
              </svg>
            </div>
            <h3>Precision Filtering</h3>
            <p>
              Instantly find roles filtered by seniority, full-time/internship contract, salary range, and preferred city.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
