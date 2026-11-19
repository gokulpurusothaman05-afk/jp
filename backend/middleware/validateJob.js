const validateJob = (req, res, next) => {
  const {
    title,
    location,
    jobType,
    experience
  } = req.body || {};

  if (!title || !title.trim()) {
    const error = new Error("Job title is required");
    error.statusCode = 400;
    return next(error);
  }

  if (!location || !location.trim()) {
    const error = new Error("Location is required");
    error.statusCode = 400;
    return next(error);
  }

  const validJobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship"
  ];

  if (!validJobTypes.includes(jobType)) {
    const error = new Error("Invalid job type");
    error.statusCode = 400;
    return next(error);
  }

  if (!experience || !experience.trim()) {
    const error = new Error("Experience is required");
    error.statusCode = 400;
    return next(error);
  }

  next();
};

export default validateJob;