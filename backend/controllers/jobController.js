
import mongoose from "mongoose";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Application from "../models/Application.js";


// Escape special regex characters
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


export const getAllJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      sort = "newest",
      page = 1,
      limit = 10
    } = req.query;

    // Build MongoDB filters
    const filter = {
      status: "active"
    };

    // Search title and description
    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } }
      ];
    }

    // Filter by location
    if (location?.trim()) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i"
      };
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by experience
    if (experience) {
      filter.experience = experience;
    }

    // Allow only approved sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    const sortOrder = sortOptions[sort] || sortOptions.newest;

    // Validate pagination values
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const skip = (pageNumber - 1) * pageSize;

    // Fetch jobs and total count from MongoDB
    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .populate("company", "name logo")
        .sort(sortOrder)
        .skip(skip)
        .limit(pageSize),

      Job.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / pageSize),
      currentPage: pageNumber,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// GET ONE JOB
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    const job = await Job.findOne({
      _id: id,
      status: "active"
    }).populate("company", "name logo");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      job
    });

  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      experience,
      salary,
      skills,
      company,
      applicationDeadline
    } = req.body;

    // Check required fields
    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !jobType ||
      !experience ||
      !company
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required job details"
      });
    }

    // Check whether company ID is valid
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID"
      });
    }

    // Confirm this company belongs to the logged-in employer
    const companyExists = await Company.findOne({
      _id: company,
      employer: req.user.id
    });

    if (!companyExists) {
      return res.status(403).json({
        success: false,
        message: "You cannot post jobs for this company"
      });
    }

    // Create the job in MongoDB
    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      jobType,
      experience,
      salary: salary || "Not disclosed",
      skills: Array.isArray(skills) ? skills : [],
      company: companyExists._id,
      employer: req.user.id,
      applicationDeadline: applicationDeadline || undefined
    });

    const populatedJob = await Job.findById(job._id)
      .populate("company", "name logo");

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: populatedJob
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB job ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "title",
      "description",
      "location",
      "jobType",
      "experience",
      "salary",
      "skills",
      "status",
      "applicationDeadline"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Find a job owned by the logged-in employer
    const job = await Job.findOne({
      _id: id,
      employer: req.user.id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job"
      });
    }

    // Apply only permitted updates
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate("company", "name logo");

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    // Delete only if this job belongs to the logged-in employer
    const deletedJob = await Job.findOneAndDelete({
      _id: id,
      employer: req.user.id
    });

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};


export const getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({
      employer: req.user.id
    })
      .populate("company", "name logo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};


export const getEmployerDashboardSummary = async (req, res, next) => {
  try {
    const employerId = req.user.id;

    // Find the IDs of this employer's jobs
    const jobIds = await Job.distinct("_id", {
      employer: employerId
    });

    const [totalJobs, activeJobs, closedJobs, totalApplications, rawRecentJobs, recentApplications] =
      await Promise.all([
        Job.countDocuments({ employer: employerId }),

        Job.countDocuments({
          employer: employerId,
          status: "active"
        }),

        Job.countDocuments({
          employer: employerId,
          status: "closed"
        }),

        // Count applications submitted to this employer's jobs
        Application.countDocuments({
          job: { $in: jobIds }
        }),

        // Get the most recently created jobs
        Job.find({ employer: employerId })
          .populate("company", "name logo")
          .sort({ createdAt: -1 })
          .limit(10),

        // Get recent applications submitted to this employer's jobs
        Application.find({
          job: { $in: jobIds }
        })
          .populate("applicant", "name email")
          .populate("job", "title location")
          .sort({ createdAt: -1 })
          .limit(20)
      ]);

    // Attach applicant count to each job
    const recentJobs = await Promise.all(
      rawRecentJobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicantCount
        };
      })
    );

    res.status(200).json({
      success: true,
      summary: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        recentJobs,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};