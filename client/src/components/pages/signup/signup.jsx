import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/context";
import logoImg from "../../../static/images/sidebarLogo.png";
import signupSVG from "../../../static/svgs/login.svg";

export default function Signup() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const success = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });

      if (success) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <div className="logo-container">
            <img 
              src={logoImg} 
              alt="Bolletta Più Logo" 
              className="signin-logo"
            />
            <p className="signin-subtitle">
              Create your account
            </p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <i className="user-icon"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="alex@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <i className="email-icon"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <i className="password-icon"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Confirm your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <i className="password-icon"></i>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="signin-button">
              Sign up now
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <Link to="/signin" className="signup-button">
              Login now
            </Link>
          </form>
        </div>

        <div className="signin-right">
          <img src={signupSVG} alt="" />
        </div>
      </div>
    </div>
  );
}