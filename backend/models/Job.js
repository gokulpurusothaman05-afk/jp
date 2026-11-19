import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true
    },

    experience: {
      type: String,
      required: true
    },

    salary: {
      type: String,
      default: "Not disclosed"
    },

    skills: {
      type: [String],
      default: []
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active"
    },

    applicationDeadline: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;