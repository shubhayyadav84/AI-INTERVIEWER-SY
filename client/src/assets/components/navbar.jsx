import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { clearUser, toggleTheme } from "../../redux/userSlice";
import axios from "axios";
import { serverurl } from "../../App";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";

function Navbar() {
  const { user, theme } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await axios.get(`${serverurl}/api/auth/logout`, { withCredentials: true });
      dispatch(clearUser());
      navigate("/");
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] dark:bg-[#121212] flex justify-center px-4 pt-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white dark:bg-[#1c1c1e] rounded-[24px] border border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center relative shadow-sm transition-colors duration-300"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="bg-black dark:bg-white dark:text-black text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
            <BsRobot size={18} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg dark:text-white">
            InterviewIQ.AI
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-6 relative">
          
          {/* Theme switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Credits */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-md hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 transition"
            >
              <BsCoin size={20} className="text-yellow-500" />
              {user?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="absolute right-[-50px] mt-3 w-64 bg-white dark:bg-[#1c1c1e] shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl p-5 z-50">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Need more credits to continue interviews?
                </p>

                <button
                  onClick={() => {
                    setShowCreditPopup(false);
                    navigate("/pricing");
                  }}
                  className="w-full bg-black dark:bg-white dark:text-black text-white py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer hover:opacity-90 transition"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-black dark:bg-white dark:text-black text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
            >
              {user
                ? user?.name?.slice(0, 1).toUpperCase()
                : <FaUserAstronaut size={16} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1c1c1e] shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl p-4 z-50">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 truncate">
                  {user?.name}
                </p>

                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate("/history");
                  }}
                  className="w-full text-left text-sm py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition duration-200 cursor-pointer"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 text-red-500 flex items-center gap-2 cursor-pointer transition duration-200 hover:text-red-600"
                >
                  <HiOutlineLogout />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Navbar;