import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Checkin from "../pages/checkin/Checkin";
import StressCheck from "../pages/stress/StressCheck";
import Journaling from "../pages/journaling/Journaling";
import Exercise from "../pages/exercise/Exercise";
import Books from "../pages/books/Books";
import BooksExplorationHistory from "../pages/books/BooksExplorationHistory";
import Profile from "../pages/profile/Profile";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
      <Route path="/stress-check" element={<ProtectedRoute><StressCheck /></ProtectedRoute>} />
      <Route path="/journaling" element={<ProtectedRoute><Journaling /></ProtectedRoute>} />
      <Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path="/books/riwayat" element={<ProtectedRoute><BooksExplorationHistory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Halaman 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
