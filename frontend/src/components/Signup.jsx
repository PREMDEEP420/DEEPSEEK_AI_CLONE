import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    
    // Frontend validation
    if (!formData.firstName.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      setLoading(false);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    try {
      const backendUrl = "https://deepseek-ai-clone-zexi.onrender.com";
      const { data } = await axios.post(
        `${backendUrl}/api/v1/user/signup`,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      alert(data.message || "Signup Succeeded");
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      navigate("/login");
    } catch (error) {
      const msg = error?.response?.data?.errors || error?.message || "Signup Failed";
      setError(msg);
      console.error("Signup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-[#1e1e1e] text-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        {/* Heading */}
        <h1 className="text-white items-center justify-center text-center">
          Signup
        </h1>

        {/* firstName */}
        <div className="mb-4 mt-2">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type="text"
            name="firstName"
            placeholder="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        {/* lastName */}
        <div className="mb-4 mt-2">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type="text"
            name="lastName"
            placeholder="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        {/* email */}
        <div className="mb-4 mt-2">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type="text"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* password */}
        <div className="mb-4 mt-2 relative">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a6ff0]"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
          />
          <span className=" absolute right-3 top-3 text-gray-400 cursor-pointer" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Error Message */}
        {error && <span className="text-red-600 text-sm mb-4">{error}</span>}

        {/* Terms & Condition */}
        <p className="text-xs text-gray-400 mt-4 mb-6">
          By signing up or logging in, you consent to DeepSeek's{" "}
          <a className="underline" href="">
            Terms of Use
          </a>{" "}
          and{" "}
          <a className=" underline" href="">
            Privacy Policy
          </a>{" "}
          .
        </p>

        {/* Signup button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className=" w-full bg-[#7a6ff6] hover:bg-[#6c61a6] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Signing... " : "Signup"}
        </button>

        {/* Links */}
        <div className="flex justify-between mt-4 text-sm">
          <a className="text-[#7a6ff6] hover:underline" href="">
            Already registered?
          </a>
          <Link className="text-[#7a6ff6] hover:underline" to={"/login"}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
