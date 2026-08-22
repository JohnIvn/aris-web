import React from "react";
import { Outlet } from "react-router-dom";
import DateTimeBar from "../components/DateTimeBar";
const MainLayout = () => {
  return (
    <div className="w-screen h-screen bg-red-500">
      <Outlet />
      <DateTimeBar />
    </div>
  );
};

export default MainLayout;