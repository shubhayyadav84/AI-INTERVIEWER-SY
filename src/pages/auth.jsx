import React, { useState } from "react";
import { BsRobot, BsEye, BsEyeSlash } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { serverurl } from "../App";

function Auth({ isModal = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && !formData.name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }
      if (!formData.password) {
        setError("Password is required");
        setLoading(false);
        return;
      }
      if (!isLogin && formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const result = await axios.post(serverurl + endpoint, payload, {
        withCredentials: true,
      });

      dispatch(setUser(result.data));
      navigate("/home");
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.response?.status === 404) {
          msg = "API not found. Redeploy the app or check Vercel settings.";
        } else if (err.code === "ERR_NETWORK") {
          msg = "Cannot reach the server. Check your connection or API URL.";
        } else if (err.response?.status === 403) {
          msg = "Request blocked (CORS). Add your site URL to FRONTEND_URL in Vercel.";
        } else {
          msg = err.message || "Something went wrong. Please try again.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
  };

  return (
    <div
      className={
        isModal
          ? "relative w-full flex items-center justify-center"
          : "relative w-full min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex items-center justify-center px-6 py-20 overflow-hidden transition-colors duration-300"
      }
    >
      {/* Premium Glowing Backdrops */}
      {!isModal && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-green-300 to-emerald-400 rounded-full filter blur-3xl opacity-25 dark:opacity-10 animate-pulse z-0 pointer-events-none"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300 to-emerald-500 rounded-full filter blur-3xl opacity-20 dark:opacity-10 animate-pulse z-0 pointer-events-none"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-green-400/10 to-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none z-0"
          ></div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-white dark:bg-[#1c1c1e] shadow-2xl border border-gray-200 dark:border-gray-800 z-10 relative transition-colors duration-300"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black dark:bg-white dark:text-black text-white p-2.5 rounded-xl shadow-sm flex items-center justify-center">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg dark:text-white">
            InterviewIQ.AI
          </h2>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-2 dark:text-white">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <div className="flex justify-center mb-6">
          <span className="bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-3.5 py-1 rounded-full inline-flex items-center gap-2 text-sm font-bold">
            <IoSparkles size={14} />
            {isLogin ? "Sign in to continue" : "Join AI Smart Interview"}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex bg-gray-100 dark:bg-gray-800/60 rounded-2xl p-1.5 mb-8">
          <motion.div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-[#2a2a2e] shadow-md"
            initial={false}
            animate={{
              left: isLogin ? "6px" : "50%",
              width: "calc(50% - 6px)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => { if (!isLogin) switchMode(); }}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer ${
              isLogin
                ? "text-black dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { if (isLogin) switchMode(); }}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer ${
              !isLogin
                ? "text-black dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all duration-200"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="relative">
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all duration-200"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={isLogin ? "Password" : "Create Password (min 6 chars)"}
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-bold disabled:opacity-60 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
              </div>
            ) : (
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
            )}
          </motion.button>
        </form>

        {/* Bottom Link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={switchMode}
            className="text-green-600 dark:text-green-400 font-bold hover:underline cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400 dark:text-gray-600">
          <HiOutlineLockClosed size={12} />
          <span>Secured with encrypted authentication</span>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;