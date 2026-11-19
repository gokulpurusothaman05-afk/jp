import Company from "../models/Company.js";

export const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, location, logo } = req.body;

    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name and location are required"
      });
    }

    const company = await Company.create({
      name: name.trim(),
      description: description || "",
      website: website || "",
      location: location.trim(),
      logo: logo || "",
      employer: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      company
    });
  } catch (error) {
    next(error);
  }
};