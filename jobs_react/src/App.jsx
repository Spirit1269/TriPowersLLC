import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Services from './components/Services';
import Contact from './components/Contact';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Careers from './components/Careers';
import Admin from './modules/admin/Admin';
import Login from './components/Login';
import JobList from './components/public/JobList';
import JobDetail from './components/public/JobDetail';
import MyApplications from './components/applications/MyApplications';

function RequireAuth({ children }) {
  return localStorage.getItem('token')
    ? children
    : <Navigate to="/login" replace />;
}

const PublicLayout = () => (
  <>
    <NavBar />
    <main className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
      <Outlet />
    </main>
  </>
);

 const AdminLayout = () => (
  <>
    <NavBar userRole="admin" />
    <main className="pt-20 px-4 md:px-8 max-w-6xl mx-auto">
      <Outlet />
    </main>
  </>
);

const App = () => {

  return (
   <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/apply/:id" element={<JobDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <Admin />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <RequireAuth>
                <MyApplications />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};
          export default App;