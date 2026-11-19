import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import CreateJob from "./pages/CreateJob";
import JobApplicants from "./pages/JobApplicants";

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Job seeker dashboard */}
        <Route
          path="/job-seeker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["jobSeeker"]}>
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employer dashboard */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Post a new job */}
        <Route
          path="/employer/jobs/create"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <CreateJob />
            </ProtectedRoute>
          }
        />

        {/* Job applicants */}
        <Route
          path="/employer/jobs/:jobId/applicants"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <JobApplicants />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
