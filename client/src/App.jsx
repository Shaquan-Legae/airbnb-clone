import './App.css';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './layouts/Layout';
import AccountPage from './pages/AccountPage';
import ListingsPage from './pages/ListingsPage';
import SinglePlacePage from './pages/SinglePlacePage';

import UserContextProvider from './context/UserContextProvider';
import { UserContext } from './context/UserContext';


axios.defaults.baseURL = 'https://airbnb-clone-backend-r26p.onrender.com';
axios.defaults.withCredentials = true;

function AppRoutes() {
  const context = useContext(UserContext);

  if (!context) {
    return null;
  }

  const { user, loading } = context;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            user ? <IndexPage /> : <Navigate to="/login" replace />
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="account/:subpage?" element={<AccountPage />} />
        <Route path="account/:subpage/:action" element={<AccountPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/singleplace/:id" element={<SinglePlacePage />} />
        <Route path="/place/:id" element={<SinglePlacePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <UserContextProvider>
      <AppRoutes />
    </UserContextProvider>
  );
}

export default App;
