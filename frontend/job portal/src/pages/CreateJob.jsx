import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    experience: "1-2 years",
    salary: "",
    skills: "",
    applicationDeadline: "",
    companyId: "",
    // New company fields if employer creates one inline
    companyName: "",
    companyLocation: "",
    companyWebsite: ""
  });

  const [companies, setCompanies] = useState([]);
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch employer's companies
  useEffect(() => {
    let isActive = true;

    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await apiRequest("/api/companies/my-companies");
        if (isActive) {
          const list = data.companies || [];
          setCompanies(list);
          if (list.length > 0) {
            setFormData((prev) => ({ ...prev, companyId: list[0]._id }));
            setIsNewCompany(false);
          } else {
            setIsNewCompany(true);
          }
        }
      } catch {
        if (isActive) {
          setIsNewCompany(true);
        }
      } finally {
        if (isActive) {
          setLoadingCompanies(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let finalCompanyId = formData.companyId;

      // If user selected or needs a new company, create it first
      if (isNewCompany || !finalCompanyId) {
        if (!formData.companyName.trim()) {
          throw new Error("Company name is required");
        }

        const compLocation = formData.companyLocation.trim() || formData.location.trim();
        if (!compLocation) {
          throw new Error("Company location is required");
        }

        const companyRes = await apiRequest("/api/companies", {
          method: "POST",
          body: JSON.stringify({
            name: formData.companyName.trim(),
            location: compLocation,
            website: formData.companyWebsite.trim()
          })
        });

        if (!companyRes.company?._id) {
          throw new Error("Failed to register company");
        }

        finalCompanyId = companyRes.company._id;
      }

      // Format skills as array
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Create the job
      await apiRequest("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          jobType: formData.jobType,
          experience: formData.experience,
          salary: formData.salary.trim() || "Not disclosed",
          skills: skillsArray,
          company: finalCompanyId,
          applicationDeadline: formData.applicationDeadline || undefined
        })
      });

      navigate("/employer/dashboard");
    } catch (err) {
      setError(err.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="create-job-page">
      <div className="create-job-container">
        <Link to="/employer/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="create-job-card">
          <div className="create-job-header">
            <h2>Post a New Opportunity</h2>
            <p>Reach thousands of qualified job seekers across the platform.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="create-job-form">
            {/* Job Details Section */}
            <div className="form-section">
              <h3>1. Job Details</h3>

              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="jobType">Job Type *</label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Experience Level *</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Job Location *</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="e.g. New York, NY or Remote"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary">Salary (Optional)</label>
                  <input
                    id="salary"
                    name="salary"
                    type="text"
                    placeholder="e.g. $80,000 - $110,000 / year"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skills">Required Skills (Comma separated)</label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="e.g. React, TypeScript, Tailwind CSS, REST APIs"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applicationDeadline">Application Deadline (Optional)</label>
                <input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Outline key responsibilities, requirements, and benefits..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Company Info Section */}
            <div className="form-section">
              <h3>2. Company Profile</h3>

              {!loadingCompanies && companies.length > 0 && (
                <div className="form-group">
                  <label htmlFor="companySelect">Select Company</label>
                  <select
                    id="companySelect"
                    value={isNewCompany ? "NEW" : formData.companyId}
                    onChange={(e) => {
                      if (e.target.value === "NEW") {
                        setIsNewCompany(true);
                      } else {
                        setIsNewCompany(false);
                        setFormData((prev) => ({
                          ...prev,
                          companyId: e.target.value
                        }));
                      }
                    }}
                  >
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.location})
                      </option>
                    ))}
                    <option value="NEW">+ Add New Company Profile</option>
                  </select>
                </div>
              )}

              {(isNewCompany || companies.length === 0) && (
                <div className="new-company-box">
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="e.g. Acme Technologies"
                      value={formData.companyName}
                      onChange={handleChange}
                      required={isNewCompany || companies.length === 0}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="companyLocation">Company Location *</label>
                      <input
                        id="companyLocation"
                        name="companyLocation"
                        type="text"
                        placeholder="e.g. San Francisco, CA"
                        value={formData.companyLocation}
                        onChange={handleChange}
                        required={isNewCompany || companies.length === 0}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="companyWebsite">Website (Optional)</label>
                      <input
                        id="companyWebsite"
                        name="companyWebsite"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Publishing Job..." : "Publish Job Post"}
              </button>
              <Link to="/employer/dashboard" className="cancel-btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateJob;
