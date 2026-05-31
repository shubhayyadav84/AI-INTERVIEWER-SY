import React from "react";
import { useNavigate } from "react-router-dom";
import { BsRobot } from "react-icons/bs";
import { FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaEnvelope } from "react-icons/fa";
import { useSelector } from "react-redux";

function Footer() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleNavigation = (path) => {
    if (!user && (path === "/interview" || path === "/history" || path === "/pricing")) {
      alert("Please login first to access this page.");
      navigate("/");
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="bg-white dark:bg-[#1c1c1e] border-t border-gray-200 dark:border-gray-800 mt-20 pt-16 pb-8 px-4 sm:px-6 lg:px-8 w-full transition-colors duration-300">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Brand & Description Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
            <div className="bg-black dark:bg-white dark:text-black text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <BsRobot size={20} />
            </div>
            <h2 className="font-extrabold text-gray-850 dark:text-white text-xl tracking-tight">
              InterviewIQ.AI
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-medium">
            Supercharge your interview preparation with AI-powered mock interviews, real-time voice conversations, and detailed performance analytics.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {[
              { icon: <FaGithub size={16} />, link: "https://github.com" },
              { icon: <FaLinkedin size={16} />, link: "https://linkedin.com" },
              { icon: <FaTwitter size={16} />, link: "https://twitter.com" },
              { icon: <FaYoutube size={16} />, link: "https://youtube.com" },
            ].map((soc, idx) => (
              <a
                key={idx}
                href={soc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition duration-300 shadow-sm"
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Product Navigation Column */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Product</h3>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <li>
              <button
                onClick={() => handleNavigation("/interview")}
                className="hover:text-green-500 dark:hover:text-green-400 transition duration-200 cursor-pointer"
              >
                Mock Interview
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/pricing")}
                className="hover:text-green-500 dark:hover:text-green-400 transition duration-200 cursor-pointer"
              >
                Pricing Plans
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/history")}
                className="hover:text-green-500 dark:hover:text-green-400 transition duration-200 cursor-pointer"
              >
                Interview History
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Policy Column */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Legal</h3>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <li>
              <a href="#" className="hover:text-green-500 dark:hover:text-green-400 transition duration-200">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 dark:hover:text-green-400 transition duration-200">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-green-500 dark:hover:text-green-400 transition duration-200">
                Refund Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Contact Us</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-medium">
            Have questions or feedback? Reach out to our support team anytime.
          </p>
          <a
            href="mailto:support@interviewiq.ai"
            className="inline-flex items-center gap-2.5 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 dark:hover:bg-slate-105 transition duration-300"
          >
            <FaEnvelope size={12} />
            support@interviewiq.ai
          </a>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-gray-150 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-400 dark:text-gray-500">
        <p>© 2026 InterviewIQ.AI. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-green-500 dark:hover:text-green-400 transition">Cookie Settings</a>
          <a href="#" className="hover:text-green-500 dark:hover:text-green-400 transition">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
