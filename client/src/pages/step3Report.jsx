import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function Step3Report({ interviewData }) {
  const navigate = useNavigate();
  const printRef = useRef(null);

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-md max-w-md border border-gray-150">
          <p className="text-gray-550 font-semibold text-lg">No session loaded</p>
          <p className="text-gray-400 text-sm mt-2">
            Please start an interview or visit your history page to select a report.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-full transition shadow-md cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

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

  // Extract evaluations
  const scores = interviewData.questions.map((q) => normalizeScore(q.score));
  const numQuestions = scores.length || 5;

  // SVG Chart Coordinates
  const svgWidth = 600;
  const startX = 60;
  const endX = 560;
  const spacing = numQuestions > 1 ? (endX - startX) / (numQuestions - 1) : 0;
  const points = scores.map((score, i) => {
    const x = startX + i * spacing;
    const y = 210 - (score / 10) * 180;
    return { x, y, score };
  });

  // Helper to generate a smooth Bezier curve path (Spline)
  const getCurvePath = (pts, isArea = false) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) {
      return isArea
        ? `M ${pts[0].x} ${pts[0].y} L ${pts[0].x} 210 L ${pts[0].x} 210 Z`
        : `M ${pts[0].x} ${pts[0].y}`;
    }

    let path = `M ${pts[0].x} ${pts[0].y}`;
    const tension = 0.2; // controls smoothness

    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const prev = i > 0 ? pts[i - 1] : curr;
      const nextNext = i < pts.length - 2 ? pts[i + 2] : next;

      const cp1x = curr.x + (next.x - prev.x) * tension;
      const cp1y = Math.max(30, Math.min(210, curr.y + (next.y - prev.y) * tension));

      const cp2x = next.x - (nextNext.x - curr.x) * tension;
      const cp2y = Math.max(30, Math.min(210, next.y - (nextNext.y - curr.y) * tension));

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    if (isArea) {
      path += ` L ${pts[pts.length - 1].x} 210 L ${pts[0].x} 210 Z`;
    }
    return path;
  };

  const linePath = getCurvePath(points, false);
  const areaPath = getCurvePath(points, true);

  // Radial Gauge Calculations
  const overallScore = normalizeScore(interviewData.overallScore);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 10) * circumference;

  const downloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // high resolution output
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`AI_Interview_Report_${interviewData.role.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(`PDF Error: ${error.message}\njsPDF: ${typeof jsPDF}\nhtml2canvas: ${typeof html2canvas}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/history")}
              className="p-3 bg-white dark:bg-[#1c1c1e] hover:bg-gray-105 dark:hover:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-sm transition duration-200 cursor-pointer flex items-center justify-center"
            >
              <FaArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Interview Analytics Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">AI-powered performance insights</p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-6 rounded-2xl shadow-md transition duration-200 cursor-pointer text-sm self-start md:self-auto"
          >
            Download PDF
          </button>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Metrics & Overall Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Overall Score Card */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center flex flex-col items-center justify-between min-h-[380px] transition-colors duration-300">
              <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">Overall Performance</span>
              
              {/* SVG Radial Progress */}
              <div className="relative w-32 h-32 flex items-center justify-center my-4">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-gray-100 dark:text-gray-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-green-500 transition-all duration-1000"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (overallScore / 10) * 251.2}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-2xl font-black text-green-600">
                  {overallScore}/10
                </div>
              </div>

              {/* Description texts */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Out of 10</p>
                <h4 className="text-gray-850 dark:text-white font-extrabold text-md leading-snug">
                  {interviewData.feedbackHeadline || "Evaluation complete."}
                </h4>
                <p className="text-gray-505 dark:text-gray-400 text-xs leading-relaxed px-2 font-medium">
                  {interviewData.overallFeedback || "No summary provided."}
                </p>
              </div>
            </div>

            {/* Skill Evaluation Card */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
              <h3 className="text-gray-855 dark:text-white font-extrabold text-lg mb-6">Skill Evaluation</h3>
              
              <div className="space-y-6">
                {[
                  { label: "Confidence", score: normalizeScore(interviewData.confidence || 0) },
                  { label: "Communication", score: normalizeScore(interviewData.communication || 0) },
                  { label: "Correctness", score: normalizeScore(interviewData.correctness || 0) },
                ].map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{skill.label}</span>
                      <span className="text-sm font-extrabold text-green-600">{skill.score}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${skill.score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Performance Graphs & Questions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Performance Trend Chart */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
              <h3 className="text-gray-805 dark:text-white font-extrabold text-lg mb-4">Performance Trend</h3>
              
              {/* Responsive SVG Container */}
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 600 250" className="w-full min-w-[500px]">
                  <defs>
                    <linearGradient id="green-area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines (Horizontal & Vertical) */}
                  {[30, 102, 156, 210].map((yVal, i) => (
                    <line
                      key={`h-${i}`}
                      x1="60"
                      y1={yVal}
                      x2="560"
                      y2={yVal}
                      stroke="currentColor"
                      className="text-gray-200/70 dark:text-gray-800/60"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {points.map((p, i) => (
                    <line
                      key={`v-${i}`}
                      x1={p.x}
                      y1="30"
                      x2={p.x}
                      y2="210"
                      stroke="currentColor"
                      className="text-gray-200/70 dark:text-gray-800/60"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Axis lines */}
                  <line
                    x1="60"
                    y1="30"
                    x2="60"
                    y2="210"
                    stroke="currentColor"
                    className="text-gray-300 dark:text-gray-700"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="60"
                    y1="210"
                    x2="560"
                    y2="210"
                    stroke="currentColor"
                    className="text-gray-300 dark:text-gray-700"
                    strokeWidth="1.5"
                  />

                  {/* Y-Axis Labels */}
                  {[
                    { label: "10", y: 34 },
                    { label: "6", y: 106 },
                    { label: "3", y: 160 },
                    { label: "0", y: 214 },
                  ].map((lbl, i) => (
                    <text
                      key={i}
                      x="35"
                      y={lbl.y}
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="system-ui"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {lbl.label}
                    </text>
                  ))}

                  {/* X-Axis Labels */}
                  {points.map((p, i) => (
                    <text
                      key={i}
                      x={p.x}
                      y="235"
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="system-ui"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Q{i + 1}
                    </text>
                  ))}

                  {/* Green Filled Area under the curve */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#green-area-gradient)" stroke="none" />
                  )}

                  {/* Line Path */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Question Breakdown Card */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
              <h3 className="text-gray-805 dark:text-white font-extrabold text-lg mb-6">Question Breakdown</h3>
              
              <div className="space-y-8">
                {interviewData.questions.map((q, idx) => (
                  <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                      Question {idx + 1}
                    </span>
                    <p className="text-gray-850 dark:text-white font-bold text-md mt-1.5 leading-snug">
                      {q.questionText}
                    </p>
                    
                    {q.userAnswer && (
                      <div className="mt-3 bg-gray-50 dark:bg-[#25252b] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 transition-colors duration-300">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                          Your Answer
                        </span>
                        <p className="text-gray-650 dark:text-gray-300 text-sm italic leading-relaxed">
                          "{q.userAnswer}"
                        </p>
                      </div>
                    )}

                    <div className="mt-3 bg-green-50/20 dark:bg-green-950/10 border border-green-100/50 dark:border-green-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2 transition-colors duration-300">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block">
                          AI Feedback
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 leading-relaxed">
                          {q.feedback || "No feedback generated."}
                        </p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-extrabold text-xs px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto border dark:border-green-900/40">
                        Score: {q.score}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ====================================================== */}
      {/* PRINT-ONLY A4 TEMPLATE CONTAINER (OFF-SCREEN IN DOM)   */}
      {/* ====================================================== */}
      <div
        ref={printRef}
        style={{
          width: "794px",
          position: "absolute",
          left: "-9999px",
          top: "0px",
          padding: "48px",
          backgroundColor: "#ffffff",
          color: "#1f2937",
          fontFamily: "system-ui, -apple-system, sans-serif",
          userSelect: "none",
        }}
      >
        {/* PDF Header */}
        <div style={{ textAlign: "center", paddingBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#16a34a", letterSpacing: "0.025em", margin: "0px" }}>
            AI Interview Performance Report
          </h1>
          <div style={{ width: "100%", height: "4px", backgroundColor: "#22c55e", borderRadius: "9999px", marginTop: "16px" }}></div>
        </div>

        {/* Interview Details SubHeader */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: "600", color: "#6b7280", marginBottom: "32px", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
          <span>Role: <strong style={{ color: "#1f2937", textTransform: "capitalize" }}>{interviewData.role}</strong></span>
          <span>Mode: <strong style={{ color: "#1f2937", textTransform: "capitalize" }}>{interviewData.mode || "Technical"}</strong></span>
          <span>Date: <strong style={{ color: "#1f2937" }}>{formatDate(interviewData.createdAt)}</strong></span>
        </div>

        {/* Final Score Block */}
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#15803d", letterSpacing: "0.025em", display: "block", marginBottom: "4px" }}>
            Final Score
          </span>
          <span style={{ fontSize: "36px", fontWeight: "800", color: "#22c55e" }}>
            {overallScore}/10
          </span>
        </div>

        {/* Evaluation Metrics Block */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", textAlign: "center" }}>
          <div style={{ borderRight: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>{normalizeScore(interviewData.confidence || 0)}</span>
            <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px", margin: "0px" }}>Confidence</p>
          </div>
          <div style={{ borderRight: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>{normalizeScore(interviewData.communication || 0)}</span>
            <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px", margin: "0px" }}>Communication</p>
          </div>
          <div>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>{normalizeScore(interviewData.correctness || 0)}</span>
            <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px", margin: "0px" }}>Correctness</p>
          </div>
        </div>

        {/* Professional Advice Card */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", backgroundColor: "#ffffff", marginBottom: "40px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginTop: "0px", marginBottom: "12px" }}>Professional Advice</h3>
          <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.625", fontWeight: "500", margin: "0px" }}>
            {interviewData.professionalAdvice || 
             "Good foundation shown. Practice delivering structured, technical, and communication-sound answers to optimize results."}
          </p>
        </div>

        {/* Table Title */}
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "16px", letterSpacing: "-0.025em" }}>Question Results</h3>

        {/* Clean Questions Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <thead>
            <tr style={{ backgroundColor: "#22c55e", color: "#ffffff", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", width: "8%" }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "left", width: "42%" }}>Question</th>
              <th style={{ padding: "12px 16px", textAlign: "center", width: "12%" }}>Score</th>
              <th style={{ padding: "12px 16px", textAlign: "left", width: "38%" }}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {interviewData.questions.map((q, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                <td style={{ padding: "16px", fontWeight: "700", color: "#9ca3af" }}>{idx + 1}</td>
                <td style={{ padding: "16px", lineHeight: "1.625", fontWeight: "700", color: "#1f2937" }}>{q.questionText}</td>
                <td style={{ padding: "16px", textAlign: "center", fontWeight: "800", color: "#16a34a", whiteSpace: "nowrap" }}>
                  {normalizeScore(q.score || 0)}/10
                </td>
                <td style={{ padding: "16px", lineHeight: "1.625", color: "#4b5563" }}>{q.feedback || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PDF Footer branding */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#9ca3af", marginTop: "48px", paddingTop: "16px", borderTop: "1px solid #f3f4f6", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Powered by InterviewIQ.AI
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
