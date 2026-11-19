import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    resume: {
      type: String,
      required: true
    },

    coverLetter: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Selected"
      ],
      default: "Applied"
    }
  },
  {
    timestamps: true
  }
);

// One application per user for each job
applicationSchema.index(
  { job: 1, applicant: 1 },
  { unique: true }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;