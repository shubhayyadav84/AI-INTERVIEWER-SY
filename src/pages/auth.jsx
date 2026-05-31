import React from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { motion } from "motion/react";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";
import axios from "axios";
import { serverurl } from "../App";


function Auth({ isModal = false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handlegoogleauth = async () => {
        try {
            const response = await signInWithPopup(auth, provider);
            let user = response.user;
            let name = user.displayName;
            let email = user.email;
            const result = await axios.post(serverurl + '/api/auth/google', { name, email }, { withCredentials: true });
            console.log(result.data);
            dispatch(setUser(result.data));
            console.log(response);
            navigate('/home');
        } catch (error) {
            console.log(error);
        }
    }
  return (
    <div className={isModal ? "relative w-full flex items-center justify-center" : "relative w-full min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex items-center justify-center px-6 py-20 overflow-hidden transition-colors duration-300"}>
      {/* Premium Glowing Backdrops */}
      {!isModal && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-green-300 to-emerald-400 rounded-full filter blur-3xl opacity-25 dark:opacity-10 animate-pulse z-0 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300 to-emerald-500 rounded-full filter blur-3xl opacity-20 dark:opacity-10 animate-pulse z-0 pointer-events-none" style={{ animationDelay: "2s" }}></div>
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#1c1c1e] shadow-2xl border border-gray-200 dark:border-gray-800 z-10 relative transition-colors duration-300"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black dark:bg-white dark:text-black text-white p-2.5 rounded-xl shadow-sm flex items-center justify-center">
            <BsRobot size={18} />
          </div>

          <h2 className="font-semibold text-lg dark:text-white">
            InterviewIQ.AI
          </h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 dark:text-white">
          Continue with{" "}
          <br className="md:hidden" />
          <span className="bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-3.5 py-1 rounded-full inline-flex items-center gap-2 text-xl font-bold mt-2">
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-center text-sm md:text-base leading-relaxed mb-8 font-medium">
          Sign in to start AI-powered mock interviews,
          track your progress, and unlock detailed
          performance insights.
        </p>

        <button
          onClick={handlegoogleauth}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-bold"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}

export default Auth;