import express from "express";
import { createCompany } from "../controllers/companyController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  createCompany
);

export default router;