import './App.css'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './layouts/Layout'
import RegisterPage from './pages/RegisterPage'
import axios from 'axios'
import UserContextProvider from './context/UserContext'
import { useEffect } from 'react'

axios.defaults.baseURL = 'http://localhost:4000'
axios.defaults.withCredentials = true

function App() {
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (!user) {
      axios.get('/profile').then((response) => {
        setUser(response.data.user);
      });
    }
  }, []);

  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={token ? <IndexPage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </UserContextProvider >
  )
}

export default App
