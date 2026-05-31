import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setLoading, clearUser } from './redux/userSlice'
import Home from './pages/home'
import Auth from './pages/auth'
import InterviewPage from './pages/interviewpage'
import HistoryPage from './pages/history'
import PricingPage from './pages/pricing'
import axios from 'axios'

// Empty in production: frontend + API share the same host on Vercel
export const serverurl =
  import.meta.env.VITE_SERVER_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:8000")

function App() {
  const { user, loading, theme } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setLoading(true))
        const res = await axios.get(`${serverurl}/api/user/me`, {
          withCredentials: true
        })
        dispatch(setUser(res.data))
        // Redirect logged-in users away from auth page to home
        if (window.location.pathname === '/') {
          navigate('/home')
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.warn("Session check:", err.response?.data?.message || err.message)
        }
        dispatch(clearUser())
        // Redirect logged-out users to login/auth page
        if (window.location.pathname === '/home') {
          navigate('/')
        }
      }
    }
    fetchUser()
  }, [dispatch, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path='/' element={<Auth />} />
      <Route path='/home' element={<Home />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/history' element={<HistoryPage />} />
      <Route path='/pricing' element={<PricingPage />} />
    </Routes>
  )
}

export default App