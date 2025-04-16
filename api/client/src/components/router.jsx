import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./protectedRoute";
import { useAuth } from "../context/context";
import Signin from "./pages/signin/signin";
import Homepage from "./pages/dashboardPages/homepage/homepage";
import Signup from "./pages/signup/signup";
import DashboardLayout from "./dashboardComponents/dashboardLayout/dashboardLayout";
import Upload from "./pages/dashboardPages/uploadDocument/uploadDocument";
import Calculations from "./pages/dashboardPages/calculations/calculations";
import CalculationView from "./pages/dashboardPages/calculationDetails/calculationDetails";
import ForgotPassword from "./pages/forgotPassword/forgotPassword";
import Profile from "./pages/dashboardPages/profile/profile";

const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="signin" element={<Signin />} />
      <Route path="signup" element={<Signup />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Homepage />} />
        <Route path="upload" element={<Upload />} />
        <Route path="calculations" element={<Calculations />} />
        <Route path="profile" element={<Profile />} />
        <Route path="calculations/:id" element={<CalculationView />} />
      </Route>
    </Routes>
  );
};

export default Router;
