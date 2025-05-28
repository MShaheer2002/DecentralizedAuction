import { AdminPage } from "@/pages/admin";
import { User } from "@/pages/user";
import { LandingPage } from "@/pages/landing_page";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "./components/ui/alert";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AlertProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user" element={<User />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
