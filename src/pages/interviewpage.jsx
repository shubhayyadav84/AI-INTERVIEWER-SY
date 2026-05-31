import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Step1SetUp from './step1setup'
import Step2Interview from './step2setup'
import Step3Report from './step3Report'
import axios from 'axios'
import { serverurl } from '../App'

function InterviewPage() {
  const [step, setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const id = queryParams.get('id')
    if (id) {
      const fetchSession = async () => {
        try {
          setLoading(true)
          const res = await axios.get(`${serverurl}/api/interview/${id}`, {
            withCredentials: true
          })
          const session = res.data
          setInterviewData(session)
          if (session.status === 'completed') {
            setStep(3)
          } else {
            setStep(2)
          }
        } catch (err) {
          console.error("Failed to load interview session:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchSession()
    }
  }, [location])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-gray-650">Retrieving Interview Session...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors duration-300'>
      {step === 1 && (
        <Step1SetUp
          setStep={setStep}
          setInterviewData={setInterviewData}
        />
      )}

      {step === 2 && (
        <Step2Interview
          setStep={setStep}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
        />
      )}

      {step === 3 && (
        <Step3Report
          interviewData={interviewData}
        />
      )}
    </div>
  )
}

export default InterviewPage