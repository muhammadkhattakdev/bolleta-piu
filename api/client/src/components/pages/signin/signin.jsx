import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { useAuth } from "../../../context/context";
import logoImg from "../../../static/images/sidebarLogo.png";
import logoSVG from "../../../static/svgs/logo.svg";
import loginSVG from "../../../static/svgs/login.svg";



export default function Signin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: ""
  });
  const [error, setError] = useState("");
  const { login, register } = useAuth();
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

    try {
      let success;

      if (isLogin) {
        success = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        if (!formData.full_name) {
          setError("Full name is required");
          return;
        };

        success = await register(formData);
      }

      if (success) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
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
              {isLogin ? "Login into your account" : "Create your account"}
            </p>
          </div>

          <form className="signin-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="full_name">Full </label>
                <div className="input-container">
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                  <div className="input-icon">
                    <i className="user-icon"></i>
                  </div>
                </div>
              </div>
            )}

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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="input-icon">
                  <i className="password-icon"></i>
                </div>
              </div>
              {isLogin && (
                <div className="forgot-password">
                  <a href="#forgot">Forgot password?</a>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="signin-button">
              {isLogin ? "Login now" : "Sign up now"}
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <Link
              type="button"
              className="signup-button"
              to={`/signup`}
              onClick={toggleMode}
            >
              {isLogin ? "Signup now" : "Login now"}
            </Link>
          </form>
        </div>

        <div className="signin-right">
            <img src={loginSVG} alt="" />
        </div>
      </div>
    </div>
  );
}