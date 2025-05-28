import { AdminPage } from "@/pages/admin";
import { UserSide } from "@/pages/user/index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "./components/ui/alert";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AlertProvider>
        <Routes>
          <Route path="/" element={<UserSide />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AlertProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
