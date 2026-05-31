import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import Navbar from "../assets/components/navbar";
import AuthModel from "../assets/components/authmodel";
import Footer from "../assets/components/footer";

import { BsRobot, BsMic, BsClock } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex flex-col overflow-x-hidden transition-colors duration-300">
      <Navbar />

      {showAuth && (
        <AuthModel onClose={() => setShowAuth(false)} />
      )}

      {/* Main Content Wrapper */}
      <div className="flex-grow flex flex-col pb-20 relative">
        {/* Premium Ambient Glowing Backdrops - Dark Mode Only */}
        <div className="hidden dark:block absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr dark:from-green-500/10 dark:to-emerald-600/10 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
        <div className="hidden dark:block absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-gradient-to-br dark:from-blue-900/5 dark:to-emerald-800/5 rounded-full filter blur-[90px] pointer-events-none z-0"></div>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-4 pt-20 text-center max-w-5xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
          >
            ✨ AI Powered Smart Interview Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mt-6 leading-tight dark:text-white"
          >
            Practice Interviews with
            <br />
            <span className="text-green-500 glow-text-green inline-block">
              AI Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 mt-6 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
          >
            Role-based mock interviews with smart follow-ups, adaptive difficulty, and real-time performance evaluation.
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <motion.button
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }
                navigate("/interview");
              }}
              whileHover={{ opacity: 0.9, scale: 1.03 }}
              whileTap={{ opacity: 1, scale: 0.98 }}
              className="bg-black text-white dark:bg-white dark:text-black px-10 py-3 rounded-full hover:opacity-90 transition-all duration-300 shadow-md dark:hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] cursor-pointer"
            >
              Start Interview
            </motion.button>

            <motion.button
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }
                navigate("/history");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-transparent dark:text-white dark:border-gray-700 border border-gray-200 px-10 py-3 rounded-full shadow-sm cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
            >
              View History
            </motion.button>
          </div>

        </div>

        {/* Main Feature Container */}
        <div className="max-w-6xl w-full mx-auto px-6">
          
          {/* Step Flow Section */}
          <div className="mt-28 flex flex-wrap justify-center gap-12 md:gap-8">
            {[
              {
                step: "STEP 1",
                title: "Role & Experience Selection",
                desc: "AI adjusts difficulty based on selected job role.",
                icon: <BsRobot size={24} />,
              },
              {
                step: "STEP 2",
                title: "Smart Voice Interview",
                desc: "Dynamic follow-up questions based on your answers.",
                icon: <BsMic size={24} />,
              },
              {
                step: "STEP 3",
                title: "Timer Based Simulation",
                desc: "Real interview pressure with time tracking.",
                icon: <BsClock size={24} />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className={`relative bg-white dark:bg-[#1c1c1e] rounded-3xl border-2 border-green-100/50 dark:border-green-950/40
                p-10 w-80 shadow-md hover:border-green-500 dark:hover:border-green-500 dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] transition-all duration-300
                ${index === 0 ? "-rotate-2 md:-rotate-3" : ""}
                ${index === 1 ? "rotate-1 md:rotate-2 md:-mt-6" : ""}
                ${index === 2 ? "-rotate-1 md:-rotate-2" : ""}`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#25252b] border-2 border-green-300 dark:border-green-800 text-green-500 p-4 rounded-2xl shadow">
                  {item.icon}
                </div>

                <div className="pt-8 text-center">
                  <p className="text-green-500 text-xs font-bold">{item.step}</p>
                  <h3 className="font-semibold text-lg mt-2 dark:text-white">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Advanced AI Capabilities */}
          <div className="mt-40">
            <h2 className="text-4xl font-bold text-center dark:text-white">
              Advanced AI <span className="text-green-500">Capabilities</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mt-14">
              {[
                {
                  title: "AI Answer Evaluation",
                  desc: "Scores communication, technical accuracy and confidence.",
                  image: evalImg,
                },
                {
                  title: "Resume Based Interview",
                  desc: "Project specific questions based on uploaded resume.",
                  image: resumeImg,
                },
                {
                  title: "Downloadable PDF Report",
                  desc: "Detailed strengths, weaknesses and improvement insights.",
                  image: pdfImg,
                },
                {
                  title: "History & Analytics",
                  desc: "Track progress with performance graphs and topic analysis.",
                  image: analyticsImg,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -6 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-md flex items-center gap-6 border border-gray-100 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-500 dark:hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-40 h-32 object-contain flex-shrink-0"
                  />

                  <div>
                    <HiSparkles className="text-green-500 mb-2 text-xl" />
                    <h3 className="font-semibold text-xl dark:text-white">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Multiple Interview Modes */}
          <div className="mt-40">
            <h2 className="text-4xl font-bold text-center dark:text-white">
              Multiple Interview <span className="text-green-500">Modes</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mt-14">
              {[
                {
                  title: "HR Interview Mode",
                  desc: "Behavioral and communication based evaluation.",
                  image: hrImg,
                },
                {
                  title: "Technical Mode",
                  desc: "Deep technical questioning based on selected role.",
                  image: techImg,
                },
                {
                  title: "Confidence Detection",
                  desc: "Basic tone and voice analysis insights.",
                  image: confidenceImg,
                },
                {
                  title: "Credits System",
                  desc: "Unlock premium interview sessions easily.",
                  image: creditImg,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 shadow-md flex items-center justify-between gap-6 border border-gray-100 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-500 dark:hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] transition-all duration-300"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl dark:text-white">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <img
                    src={item.image}
                    alt=""
                    className="w-28 h-28 object-contain flex-shrink-0"
                  />
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;