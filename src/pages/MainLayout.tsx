import React from "react";
import { Outlet } from "react-router-dom";
import DateTimeBar from "../components/DateTimeBar";
import Background from "../assets/images/light-background.png";

export interface MainLayoutProps {
  backgroundImageSrc?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ backgroundImageSrc = Background })  => {
  return (
    <main 
      className={`relative flex h-screen w-full flex-col items-center justify-center`}
      style={{
        backgroundImage: `url(${backgroundImageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
      <Outlet />
      <DateTimeBar />
    </main>
  );
};

export default MainLayout;