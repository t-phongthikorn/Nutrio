import { Outlet } from "react-router-dom";
import SideBar from "../components/Sidebar";

function MainLayout() {
  return (
    <>
      <SideBar />
      <Outlet />
    </>
  );
}

export default MainLayout;