import express from "express";
import { createApplication ,
  getMyApplications,
  getApplicationById,
  getJobApplicants,
  updateApplicationStatus,
  getJobSeekerDashboardSummary } from "../controllers/applicationController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/:jobId/apply", protect, authorizeRoles("jobSeeker"), createApplication);

router.get("/my-applications", protect, authorizeRoles("jobSeeker"), getMyApplications);

router.get("/job/:jobId", protect, authorizeRoles("employer"), getJobApplicants);

router.get(
  "/dashboard/summary",
  protect,
  authorizeRoles("jobSeeker"),
  getJobSeekerDashboardSummary
);

router.get("/:applicationId", protect, authorizeRoles("jobSeeker"), getApplicationById);

router.patch("/:applicationId/status", protect, authorizeRoles("employer"), updateApplicationStatus);

export default router;