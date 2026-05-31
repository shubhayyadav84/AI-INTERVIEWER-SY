import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverurl } from "../App";
import { FaArrowLeft } from "react-icons/fa";
import Footer from "../assets/components/footer";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${serverurl}/api/interview/history`, {
          withCredentials: true,
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch interview history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const normalizeScore = (score) => {
    if (!score) return 1;
    const num = Number(score);
    if (isNaN(num)) return 1;
    let normalized = num;
    if (num > 10) {
      normalized = Math.round(num / 10);
    } else {
      normalized = Math.round(num);
    }
    return normalized < 1 ? 1 : normalized;
  };

  const getSubText = (item) => {
    let details = [];
    if (item.experience) {
      details.push(item.experience);
    } else {
      details.push("No experience specified");
    }
    if (item.mode) details.push(item.mode);
    return details.join(" • ");
  };  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate("/home")}
              className="p-3 bg-white dark:bg-[#1c1c1e] hover:bg-gray-105 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition duration-200 cursor-pointer flex items-center justify-center"
            >
              <FaArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Interview History</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Track your past interviews and performance reports
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
              <p className="text-gray-555 dark:text-gray-400 mt-4 font-semibold">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">No interviews found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start a new interview from the home page.</p>
              <button
                onClick={() => navigate("/interview")}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-full transition shadow-md cursor-pointer"
              >
                Start New Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                const isCompleted = item.status === "completed";
                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/interview?id=${item._id}`)}
                    className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-green-555 dark:group-hover:text-green-400 transition capitalize">
                        {item.role}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium leading-relaxed">
                        Looking for {item.role} role to build websites. • {getSubText(item)}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-3 font-semibold">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Score section */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-2xl font-extrabold text-gray-850 dark:text-gray-200">
                          {isCompleted ? `${normalizeScore(item.overallScore)}/10` : "0/10"}
                        </span>
                        <p className="text-[10px] text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider mt-0.5">
                          Overall Score
                        </p>
                      </div>

                      {/* Status Pill */}
                      <div className="min-w-[100px] text-right">
                        {isCompleted ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/40">
                            completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40">
                            Incompleted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HistoryPage;
