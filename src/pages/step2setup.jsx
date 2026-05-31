import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BsRobot, BsMic, BsClock, BsMicFill } from "react-icons/bs";
import { FaUserTie, FaMicrophoneAlt, FaChartLine, FaArrowRight, FaVolumeUp } from "react-icons/fa";
import axios from "axios";
import { serverurl } from "../App";

import maleVideo from "../assets/male-ai.mp4";
import femaleVideo from "../assets/female-ai.mp4";

// Setup Web Speech API Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
}

function Step2Interview({ setStep, interviewData, setInterviewData }) {
  // Sub-phases: "select_interviewer" -> "loading" -> "interview"
  const [phase, setPhase] = useState("select_interviewer");
  const [selectedGender, setSelectedGender] = useState("");
  
  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [status, setStatus] = useState("AI Speaking"); // "AI Speaking", "Listening...", "Evaluating..."
  const [timeLeft, setTimeLeft] = useState(60);
  const [answerText, setAnswerText] = useState("");
  const [listening, setListening] = useState(false);

  const videoRef = useRef(null);

  // Initialize Speech Recognition callbacks
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setAnswerText((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, []);

  // Text-To-Speech (TTS) synthesizer function
  const speakQuestion = (text) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Choose gender voice fallback
    let voice = null;
    if (selectedGender === "male") {
      voice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google uk english male") ||
          v.name.toLowerCase().includes("microsoft david") ||
          v.name.toLowerCase().includes("male")
      );
    } else {
      voice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google uk english female") ||
          v.name.toLowerCase().includes("microsoft zira") ||
          v.name.toLowerCase().includes("female")
      );
    }

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setStatus("AI Speaking");
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.log(err));
      }
    };

    utterance.onend = () => {
      setStatus("Listening...");
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      // Auto-trigger microphone listening after TTS ends
      startSTT();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Speech-To-Text
  const startSTT = () => {
    if (!recognition || listening) return;
    try {
      recognition.start();
      setListening(true);
      setStatus("Listening...");
    } catch (err) {
      console.log("Failed to start speech recognition:", err);
    }
  };

  // Stop Speech-To-Text
  const stopSTT = () => {
    if (!recognition || !listening) return;
    try {
      recognition.stop();
      setListening(false);
    } catch (err) {
      console.log("Failed to stop speech recognition:", err);
    }
  };

  const toggleMic = () => {
    if (listening) {
      stopSTT();
    } else {
      startSTT();
    }
  };

  // Timer logic
  useEffect(() => {
    if (phase !== "interview" || status !== "Listening...") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, status, currentQIndex]);

  // Handle Interviewer selection
  const handleSelectInterviewer = async (gender) => {
    setSelectedGender(gender);
    setPhase("loading");

    // Fetch AI Interview Questions from backend
    try {
      const res = await axios.post(`${serverurl}/api/interview/start`, {
        role: interviewData?.role,
        experience: interviewData?.experience,
        mode: interviewData?.mode,
        skills: interviewData?.skills,
        projects: interviewData?.projects,
      }, {
        withCredentials: true,
      });
      setSession(res.data);
      setCurrentQIndex(0);
      setPhase("interview");
      setTimeLeft(60);

      // Start speaking the first question after a brief delay
      setTimeout(() => {
        speakQuestion(res.data.questions[0].questionText);
      }, 8000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to generate interview questions. Please try again.");
      setPhase("select_interviewer");
    }
  };

  // Submit current answer and load next question
  const handleSubmitAnswer = async () => {
    stopSTT();
    window.speechSynthesis.cancel();

    setStatus("Evaluating...");

    try {
      const res = await axios.post(
        `${serverurl}/api/interview/submit`,
        {
          interviewId: session._id,
          answer: answerText,
        },
        { withCredentials: true }
      );

      const updatedSession = res.data;
      setSession(updatedSession);

      if (updatedSession.status === "completed") {
        // Stop any speech and navigate to report (Step 3)
        window.speechSynthesis.cancel();
        if (setInterviewData) {
          setInterviewData(updatedSession);
        }
        // Delay navigation slightly so user sees Completion status
        setTimeout(() => {
          setStep(3);
        }, 1000);
      } else {
        const nextIndex = updatedSession.currentQuestionIndex;
        setCurrentQIndex(nextIndex);
        setAnswerText("");
        setTimeLeft(60);
        
        // Speak the next question
        speakQuestion(updatedSession.questions[nextIndex].questionText);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit answer. Please try again.");
      setStatus("Listening...");
    }
  };

  // Circular Timer calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 60) * circumference;

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      stopSTT();
    };
  }, []);

  // 1. PHASE: SELECT INTERVIEWER
  if (phase === "select_interviewer") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl dark:border dark:border-gray-800 p-10 max-w-4xl w-full text-center transition-colors duration-300">
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
            Choose Your AI Interviewer
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">
            Select an avatar to conduct your live interactive voice interview.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Male Avatar Option */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => handleSelectInterviewer("male")}
              className="border-2 border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-550 rounded-3xl p-6 cursor-pointer bg-white dark:bg-[#25252b] transition shadow-sm flex flex-col items-center"
            >
              <div className="w-48 h-48 bg-blue-50 dark:bg-blue-950/20 rounded-2xl overflow-hidden mb-6 relative">
                <video
                  src={maleVideo}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                  <FaVolumeUp className="text-white text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Male Interviewer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Professional, technical-focused, and standard voice.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm bg-green-50 dark:bg-green-950/20 px-4 py-1.5 rounded-full">
                Select Avatar <FaArrowRight size={10} />
              </span>
            </motion.div>

            {/* Female Avatar Option */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              onClick={() => handleSelectInterviewer("female")}
              className="border-2 border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-550 rounded-3xl p-6 cursor-pointer bg-white dark:bg-[#25252b] transition shadow-sm flex flex-col items-center"
            >
              <div className="w-48 h-48 bg-pink-50 dark:bg-pink-955/10 rounded-2xl overflow-hidden mb-6 relative">
                <video
                  src={femaleVideo}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                  <FaVolumeUp className="text-white text-3xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Female Interviewer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Engaging, comprehensive feedback, and standard voice.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-sm bg-green-50 dark:bg-green-950/20 px-4 py-1.5 rounded-full">
                Select Avatar <FaArrowRight size={10} />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PHASE: GENERATING QUESTIONS
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-xl dark:border dark:border-gray-800 p-12 max-w-md w-full text-center transition-colors duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Preparing Interview</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Our AI is generating custom follow-ups, role-specific questions, and configuring your avatar simulation...
          </p>
        </div>
      </div>
    );
  }

  // 3. PHASE: ACTIVE VOICE INTERVIEW
  const currentQuestionText = session?.questions?.[currentQIndex]?.questionText || "";

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex items-center justify-center p-6 transition-colors duration-300">
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full grid md:grid-cols-[1.2fr_1.8fr] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        
        {/* Left Section: Avatar, Subtitle, Interview Status */}
        <div className="bg-white dark:bg-[#1c1c1e] p-8 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-6 transition-colors duration-300">
          
          {/* Avatar Video Box */}
          <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner aspect-video relative">
            <video
              ref={videoRef}
              src={selectedGender === "male" ? maleVideo : femaleVideo}
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {status === "AI Speaking" && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md animate-pulse">
                AI Speaking
              </div>
            )}
          </div>

          {/* Subtitle Display */}
          <div className="bg-gray-50 dark:bg-[#25252b] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 flex flex-col justify-center min-h-[100px] text-center shadow-sm transition-colors duration-300">
            <p className="text-gray-700 dark:text-gray-250 text-sm md:text-md font-medium italic leading-relaxed">
              "{currentQuestionText}"
            </p>
          </div>

          {/* Interview Status panel */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-[#25252b] shadow-sm flex flex-col justify-between gap-4 transition-colors duration-300">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Interview Status</span>
              <span
                className={`text-sm font-bold ${
                  status === "Listening..."
                    ? "text-blue-500 animate-pulse"
                    : status === "Evaluating..."
                    ? "text-orange-500 animate-pulse"
                    : "text-green-500"
                }`}
              >
                {status}
              </span>
            </div>

            {/* Circular Timer & Questions Status Row */}
            <div className="flex justify-around items-center pt-2">
              {/* circular countdown timer */}
              <div className="relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="text-gray-150 dark:text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className={`transition-all duration-1000 ${
                      timeLeft <= 10 ? "text-red-500" : "text-green-500"
                    }`}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                  {timeLeft}s
                </div>
              </div>

              {/* Status details */}
              <div className="text-left space-y-1">
                <div className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                  Progression
                </div>
                <div className="text-xl font-extrabold text-gray-800 dark:text-white">
                  {currentQIndex + 1} <span className="text-sm font-medium text-gray-400">/ 5 Questions</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Section: Smart Interview Text Response Area */}
        <div className="p-8 flex flex-col justify-between gap-6 bg-white dark:bg-[#1c1c1e] transition-colors duration-300">
          <div>
            <h2 className="text-2xl font-bold text-gray-855 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
              <BsRobot className="text-green-600" />
              AI Smart Interview
            </h2>

            {/* Question title */}
            <div className="bg-green-50/20 dark:bg-green-950/10 border border-green-100 dark:border-green-900/40 rounded-2xl p-5 mt-6 mb-4 transition-colors duration-300">
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest block mb-1">
                Question {currentQIndex + 1} of 5
              </span>
              <p className="text-gray-800 dark:text-gray-200 font-semibold text-md leading-snug">
                {currentQuestionText}
              </p>
            </div>

            {/* Answer Box */}
            <div className="relative mt-2">
              <textarea
                placeholder="Type your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={status === "Evaluating..."}
                className="w-full min-h-[220px] p-5 border border-gray-255 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none resize-none bg-gray-50/50 dark:bg-[#25252b] shadow-inner text-gray-700 dark:text-white leading-relaxed text-md transition duration-200"
              />
            </div>
          </div>

          {/* Bottom Actions row */}
          <div className="flex gap-4 items-center">
            
            {/* Microphone STT Trigger Button */}
            <button
              onClick={toggleMic}
              disabled={status === "Evaluating..." || status === "AI Speaking"}
              className={`p-4 rounded-full shadow-md transition duration-300 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-150"
              }`}
            >
              {listening ? <BsMicFill size={20} /> : <BsMic size={20} />}
            </button>

            {/* Submit Button */}
            <button
              onClick={handleSubmitAnswer}
              disabled={status === "Evaluating..." || status === "AI Speaking"}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl shadow-md transition duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-md"
            >
              {status === "Evaluating..." ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Evaluating Answer...
                </>
              ) : (
                "Submit Answer"
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Step2Interview;
