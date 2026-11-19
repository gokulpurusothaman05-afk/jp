import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

export const createApplication = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { resume, coverLetter } = req.body;

    // Validate the job ID
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    // Resume is required by our Application model
    if (!resume?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume is required"
      });
    }

    // Confirm that the job exists and is active
    const job = await Job.findOne({
      _id: jobId,
      status: "active"
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or no longer accepting applications"
      });
    }

    // Create the application
    const application = await Application.create({
      job: job._id,
      applicant: req.user.id,
      resume: resume.trim(),
      coverLetter: coverLetter?.trim() || ""
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    // Handle duplicate application index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job"
      });
    }

    next(error);
  }
};


export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id
    })
      .populate({
        path: "job",
        select: "title location jobType experience salary status",
        populate: {
          path: "company",
          select: "name logo"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
      applicant: req.user.id
    })
      .populate({
        path: "job",
        select: "title description location jobType experience salary status",
        populate: {
          path: "company",
          select: "name logo"
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID"
      });
    }

    // Verify that this job belongs to the logged-in employer
    const job = await Job.findOne({
      _id: jobId,
      employer: req.user.id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you do not own this job"
      });
    }

    // Retrieve applications for this job
    const applications = await Application.find({
      job: jobId
    })
      .populate("applicant", "name email")
      .populate("job", "title location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID"
      });
    }

    // Allow only these status values
    const allowedStatuses = [
      "Under Review",
      "Shortlisted",
      "Rejected",
      "Selected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status"
      });
    }

    // Find the application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check whether the logged-in employer owns the related job
    const job = await Job.findOne({
      _id: application.job,
      employer: req.user.id
    });

    if (!job) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this application"
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("applicant", "name email")
      .populate("job", "title location");

    res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

export const getJobSeekerDashboardSummary = async (req, res, next) => {
  try {
    const applicantId = new mongoose.Types.ObjectId(req.user.id);

    const [totalApplications, statusResults, recentApplications] =
      await Promise.all([
        // Total applications submitted by this job seeker
        Application.countDocuments({ applicant: req.user.id }),

        // Count applications grouped by status
        Application.aggregate([
          {
            $match: { applicant: applicantId }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),

        // Get the five most recent applications
        Application.find({ applicant: req.user.id })
          .populate({
            path: "job",
            select: "title location jobType",
            populate: {
              path: "company",
              select: "name logo"
            }
          })
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

    // Start every possible status at zero
    const statusCounts = {
      Applied: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Rejected: 0,
      Selected: 0
    };

    // Replace zero with actual MongoDB counts
    statusResults.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      summary: {
        totalApplications,
        statusCounts,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};