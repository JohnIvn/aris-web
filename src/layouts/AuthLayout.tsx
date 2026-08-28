// layouts/AuthLayout.tsx — for centered single-card pages like Login
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

const AuthLayout = () => {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center">
      <Outlet />
      <Footer />
    </main>
  );
};

export default AuthLayout;