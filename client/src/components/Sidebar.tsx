import Logo from "../assets/logo.svg?react";
import CloseMenuIcon from "../assets/icon/menu.svg?react";
import SaveMenuIcon from "../assets/icon/save.svg?react";
import ListMenuIcon from "../assets/icon/list.svg?react";

import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import "../App.css";
import { AuthProvider, useAuth } from "../context/AuthProvider";
import axiosInstance from "../api/axios";
import { getAccessToken, setAccessToken } from "../api/token";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-4 px-4 py-3 rounded-3xl transition-all duration-200
   ${
     isActive
       ? "bg-[#e3fff4] text-[#3fcea5] font-semibold "
       : "text-gray-700 hover:bg-[#e3fff4] hover:text-[#3fcea5]"
   }`;

const SideBar = () => {
  const [open, setOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  console.log(auth);

  const handleLogout = async () => {
    await axiosInstance.post("/api/auth/logout");
    setAccessToken(null);
    window.location.reload();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0  bg-black/55 opacity-40  z-10 xl:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Open Button (Mobile) */}
      <button
        onClick={() => setOpen(true)}
        className={`
        fixed top-4 left-4 z-1
        p-3 rounded-xl
        bg-white shadow-lg 
        xl:hidden ${open && "hidden"}
      `}
      >
        <CloseMenuIcon className="w-6 h-6 text-gray-700" />
      </button>
      {/* Sidebar on Mobile */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[280px]
          bg-white border-r border-gray-200 shadow-lg p-5
          transition-all duration-700 ease-in-out flex flex-col  rounded-3xl
          xl:hidden z-20
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {/* <div className="bg-[#fff3e8] p-2 rounded-xl">
              <Logo className="text-[#f6c396] w-8 h-8" />
            </div> */}

            <h1 className="text-2xl font-semibold text-gray-800">Nutrio</h1>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
          >
            <CloseMenuIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        {/* Navigation */}
<nav className="flex flex-col gap-2">
  <NavLink to="/" end className={navClass}>
    <SaveMenuIcon className="w-6 h-6" />
    <span className="font-medium">บันทึก</span>
  </NavLink>

  <NavLink to="/list" className={navClass}>
    <ListMenuIcon className="w-6 h-6" />
    <span className="font-medium">รายการ</span>
  </NavLink>
</nav>

{/* Push to bottom */}
<div className="mt-auto pt-4 border-t border-gray-200">
  {auth.isAuthenticated ? (
    <>
      <div className="text-sm text-gray-400 truncate px-2 mb-2">{auth.username}</div>
      <button
        onClick={() => {
          handleLogout();
          setOpen(false);
        }}
        className="flex items-center gap-4 px-4 py-3 rounded-3xl w-full text-error hover:bg-red-50 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
        <span className="font-medium">ออกจากระบบ</span>
      </button>
    </>
  ) : (
    <button
      onClick={() => {
        navigate("/login");
        setOpen(false);
      }}
      className="flex items-center gap-4 px-4 py-3 rounded-3xl w-full text-[#3fcea5] hover:bg-[#e3fff4] transition-all duration-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
        <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/>
      </svg>
      <span className="font-medium">เข้าสู่ระบบ</span>
    </button>
  )}
</div>
      </aside>

      <div
        className="
    hidden xl:flex items-center justify-between
    sticky top-8 z-50
    mx-auto my-4
    w-[90%] max-w-7xl
    rounded-full
    px-6 py-3
    shadow-2xl
    backdrop-blur-2xl
    relative
  "
      >
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
          {/* <div className="bg-[#fff3e8] p-2 rounded-xl">
            <Logo className="text-[#f6c396] w-8 h-8" />
          </div> */}

          <h1 className="text-2xl font-semibold text-gray-800">Nutrio</h1>
        </div>

        {/* Center */}
        <nav
          className="
      absolute left-1/2 -translate-x-1/2
      flex items-center gap-2
    "
        >
          <NavLink to="/" end className={navClass}>
            <SaveMenuIcon className="w-6 h-6" />
            <span className="font-medium">บันทึก</span>
          </NavLink>

          <NavLink to="/list" className={navClass}>
            <ListMenuIcon className="w-6 h-6" />
            <span className="font-medium">รายการ</span>
          </NavLink>
        </nav>

        {/* Right */}
        <div className="dropdown dropdown-end">
          {/* Trigger */}
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 shrink-0 max-w-[250px]"
          >
            <div className="min-w-0 truncate text-right">{auth.username}</div>
            <div className="w-14 h-14 rounded-full bg-base-300 shrink-0 flex items-center justify-center  transition-colors cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="currentColor"
              >
                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 129-46.5T480-440q68 0 135 15.5T744-378q29 15 46.5 43.5T808-272v112H160Z" />
              </svg>
            </div>
          </div>

          {/* Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 border border-base-300 rounded-2xl shadow-lg w-48 z-50 mt-2 p-0 overflow-hidden"
          >
            {auth.isAuthenticated ? (
              <li className="px-4 text-center py-3 border-b border-base-300 text-sm text-base-content/60 truncate pointer-events-none">
                {auth.username}
              </li>
            ) : (
              <li className="px-4 py-3 text-center border-b border-base-300 text-sm text-base-content/60 truncate pointer-events-none">
                กรุณาเข้าสู่ระบบ
              </li>
            )}

            <li>
              {auth.isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    document.activeElement instanceof HTMLElement &&
                      document.activeElement.blur();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 btn btn-soft btn-error rounded-none"`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentColor"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                  </svg>
                  <span className="text-lg">ออกจากระบบ</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login")
                  }}
                  className={`flex items-center gap-3 px-4 py-3 btn btn-soft btn-info rounded-none"`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20px"
                    viewBox="0 -960 960 960"
                    width="20px"
                    fill="currentColor"
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                  </svg>
                  <span className="text-lg">เข้าสู่ระบบ</span>
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideBar;
