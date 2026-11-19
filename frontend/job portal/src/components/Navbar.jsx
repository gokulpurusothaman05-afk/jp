
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          Job<span>Portal</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/jobs">Find Jobs</NavLink>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link
                to={
                  user.role === "employer"
                    ? "/employer/dashboard"
                    : "/job-seeker/dashboard"
                }
              >
                Dashboard
              </Link>

              <span>{user.name}</span>

              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>

              <Link to="/register" className="register-btn">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
