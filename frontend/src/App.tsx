import { AdminPage } from "@/pages/admin";
import { UserSide } from "@/pages/user/index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "./components/ui/alert";
import store from "../redux/store";
import { Provider } from "react-redux";
import LoadingSpinner from "@/components/ui/loading"; 
import Navbar from '@/components/ui/navbar';

const AppRoutes = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar /> 
        <AlertProvider>
          <LoadingSpinner /> 
          <Routes>
            <Route path="/" element={<UserSide />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </AlertProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default AppRoutes;
