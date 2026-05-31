import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { setUser } from "../redux/userSlice";
import Footer from "../assets/components/footer";
import axios from "axios";
import { serverurl } from "../App";

function PricingPage() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: "Free",
      cost: "₹0",
      credits: "100 Credits",
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      buttonText: "Default",
      buttonStyle: "bg-gray-100 text-gray-500 cursor-not-allowed",
      action: () => {},
      isFeatured: false,
    },
    {
      name: "Starter Pack",
      cost: "₹100",
      credits: "150 Credits",
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
      buttonText: "Proceed to Pay",
      buttonStyle: "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-100/50 cursor-pointer",
      action: () => handlePayment("starter"),
      isFeatured: true,
      badge: "Featured",
    },
    {
      name: "Pro Pack",
      cost: "₹500",
      credits: "650 Credits",
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      buttonText: "Select Plan",
      buttonStyle: "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-100/50 cursor-pointer",
      action: () => handlePayment("pro"),
      isFeatured: false,
      badge: "Best Value",
    },
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planType) => {
    if (!user) {
      alert("Please login first to purchase credits.");
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create Order on backend
      const res = await axios.post(
        `${serverurl}/api/payment/create-order`,
        { planType },
        { withCredentials: true }
      );

      const orderData = res.data;

      // 2. Open Razorpay checkout options
      const options = {
        key: "rzp_test_SvxWiFyxWDgGVR",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "InterviewIQ.AI",
        description: `Buy ${planType === "starter" ? "Starter Pack" : "Pro Pack"} credits`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyRes = await axios.post(
              `${serverurl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              },
              { withCredentials: true }
            );

            // Success
            alert(verifyRes.data.message || "Credits added successfully!");
            dispatch(setUser(verifyRes.data.user));
            navigate("/home");
          } catch (err) {
            console.error("Signature verification failed:", err);
            alert(err.response?.data?.message || "Failed to verify transaction signature.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(error.response?.data?.message || "Failed to initiate payment transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] flex flex-col transition-colors duration-300">
      <div className="flex-grow py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={() => navigate("/home")}
              className="p-3 bg-white dark:bg-[#1c1c1e] hover:bg-gray-105 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition duration-200 cursor-pointer flex items-center justify-center"
            >
              <FaArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Choose Your Plan</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
                Flexible pricing to match your interview preparation goals.
              </p>
            </div>
          </div>

          {/* Loading Spinner overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border dark:border-gray-800">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-300 font-semibold text-sm">Processing transaction...</p>
              </div>
            </div>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isFree = plan.name === "Free";
              const isStarter = plan.name === "Starter Pack";
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
                    plan.isFeatured
                      ? "border-green-500 border-2 shadow-lg"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {/* Card Header: Name and Badge */}
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                      {plan.name === "Free" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Default
                        </span>
                      )}
                      {plan.name === "Pro Pack" && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-500 text-white">
                          Best Value
                        </span>
                      )}
                    </div>

                    {/* Pricing stacked vertically */}
                    <div className="mt-6">
                      <div className="text-4xl font-extrabold text-green-500 tracking-tight">
                        {plan.cost}
                      </div>
                      <div className="text-sm font-semibold text-gray-400 dark:text-gray-500 mt-1">
                        {plan.credits}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      {plan.description}
                    </p>

                    {/* Divider line */}
                    <div className="w-full h-px bg-gray-150 dark:bg-gray-800 my-6"></div>

                    {/* Features List */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="p-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full shrink-0 mt-0.5 border border-green-200 dark:border-green-900/40 flex items-center justify-center">
                            <FaCheck size={8} />
                          </span>
                          <span className="text-xs text-gray-650 dark:text-gray-300 font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button (Omitted on Free to match screenshot) */}
                  {!isFree && (
                    <div className="mt-8">
                      <button
                        onClick={plan.action}
                        disabled={loading}
                        className={`w-full py-3.5 rounded-2xl font-bold transition duration-205 text-sm ${
                          isStarter
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-100 dark:shadow-none"
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
                        }`}
                      >
                        {plan.name === "Starter Pack" ? "Proceed to Pay" : "Select Plan"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PricingPage;
