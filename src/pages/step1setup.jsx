import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaMicrophoneAlt,
  FaChartLine,
  FaFileUpload,
  FaUser,
  FaBriefcase,
  FaFilePdf,
} from "react-icons/fa";
import axios from "axios";
import { serverurl } from "../App";

function Step1SetUp({ setStep, setInterviewData }) {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resumeRole, setResumeRole] = useState("");
  const [resumeExperience, setResumeExperience] = useState("");

  const features = [
    {
      icon: <FaUserTie className="text-green-600 text-xl" />,
      text: "Choose Role & Experience",
    },
    {
      icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
      text: "Smart Voice Interview",
    },
    {
      icon: <FaChartLine className="text-green-600 text-xl" />,
      text: "Performance Analytics",
    },
  ];

  const handleAnalyzeResume = async () => {
    if (!resumeFile) return;

    try {
      setAnalyzing(true);
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await axios.post(`${serverurl}/api/interview/resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const { role: parsedRole, experience: parsedExperience, projects: parsedProjects, skills: parsedSkills } = res.data;
      
      setResumeRole(parsedRole || "");
      setResumeExperience(parsedExperience || "");
      setProjects(parsedProjects || []);
      setSkills(parsedSkills || []);
      setAnalysisDone(true);
    } catch (error) {
      console.error("Resume analysis error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to analyze resume. Please make sure the backend is running and try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = () => {
    if (!role.trim()) {
      alert("Please enter a target role first.");
      return;
    }

    setInterviewData({
      role, // target role inputted manually
      experience, // target experience inputted manually
      mode,
      skills,
      projects,
    });
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl dark:border dark:border-gray-800 overflow-hidden max-w-5xl w-full grid md:grid-cols-2 transition-colors duration-300">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-emerald-950/10 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
            Start Your AI Interview
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-10 font-medium">
            Practice real interview scenarios powered by AI. Improve
            communication, technical skills, and confidence.
          </p>

          <div className="space-y-4">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="flex items-center space-x-4 bg-white dark:bg-[#25252b] p-4 rounded-xl shadow-sm cursor-pointer"
              >
                {item.icon}
                <span className="font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Interview SetUp
          </h2>

          <div className="space-y-4">
            {/* Role */}
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full py-3 pl-12 pr-4 border border-gray-200 dark:border-gray-800 rounded-xl dark:bg-[#25252b] dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <FaBriefcase className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full py-3 pl-12 pr-4 border border-gray-200 dark:border-gray-800 rounded-xl dark:bg-[#25252b] dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Interview Mode */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 dark:border-gray-800 rounded-xl dark:bg-[#25252b] dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* Resume Upload */}
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-950/10 transition relative"
              >
                {resumeFile ? (
                  <div className="flex flex-col items-center">
                    <FaFilePdf className="text-4xl text-green-600 mb-3" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-sm max-w-xs truncate mb-2">
                      {resumeFile.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeResume();
                      }}
                      disabled={analyzing}
                      className="bg-[#24292e] dark:bg-white dark:text-black hover:bg-[#1a1e22] dark:hover:bg-gray-150 py-1.5 px-6 rounded-lg text-xs font-bold shadow transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {analyzing ? "Analyzing..." : "Analyze Resume"}
                    </button>
                  </div>
                ) : (
                  <>
                    <FaFileUpload className="text-4xl mx-auto text-green-600 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                      Click to upload resume (Optional)
                    </p>
                  </>
                )}

                <input
                  type="file"
                  id="resumeUpload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* Analysis Result */}
            {analysisDone && (
              <div className="border border-green-200 dark:border-green-900/40 rounded-xl p-5 bg-green-50/20 dark:bg-green-950/10 shadow-sm max-h-60 overflow-y-auto space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm flex items-center gap-2 border-b border-green-100 dark:border-green-900/40 pb-2">
                  ✨ Resume Analysis Result
                </h3>

                {resumeRole && (
                  <div>
                    <p className="font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Resume Role:
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {resumeRole}
                    </p>
                  </div>
                )}

                {resumeExperience && (
                  <div>
                    <p className="font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Resume Experience:
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {resumeExperience}
                    </p>
                  </div>
                )}

                {projects && projects.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                      Projects:
                    </p>
                    <ul className="list-disc ml-5 text-xs text-gray-700 dark:text-gray-300 space-y-1 font-semibold">
                      {projects.map((project, i) => (
                        <li key={i}>{project}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills && skills.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-200 dark:border-green-900/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStart}
              className={`w-full py-3 rounded-full font-semibold transition text-white shadow-md cursor-pointer ${
                analysisDone
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-[#3f4b5b] hover:bg-[#323c49]"
              }`}
            >
              Start Interview
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Step1SetUp;