import express from "express";
import { createCompany, getEmployerCompanies } from "../controllers/companyController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/my-companies",
  protect,
  authorizeRoles("employer"),
  getEmployerCompanies
);

router.post(
  "/",
  protect,
  authorizeRoles("employer"),
  createCompany
);

export default router;
