import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,getEmployerDashboardSummary
} from "../controllers/jobController.js";

import validateJob from "../middleware/validateJob.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get(
  "/employer/my-jobs",
  protect,
  authorizeRoles("employer"),
  getEmployerJobs
);

// Get all jobs
router.get("/", getAllJobs);

// Get one job
router.get("/:id", getJobById);

// Create a job
// Employer-only routes
router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  validateJob,
  createJob
);

router.get(
  "/employer/dashboard/summary",
  protect,
  authorizeRoles("employer"),
  getEmployerDashboardSummary
);

// Update a job
router.put("/:id", protect, authorizeRoles("employer"), validateJob, updateJob);

// Delete a job
router.delete("/:id", protect, authorizeRoles("employer"), deleteJob);



export default router;