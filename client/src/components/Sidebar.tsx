import Logo from "../assets/logo.svg?react";
import CloseMenuIcon from "../assets/icon/menu.svg?react";
import FoodMenuIcon from "../assets/icon/food.svg?react";
import WorkoutMenuIcon from "../assets/icon/workout.svg?react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

import "../App.css";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-4 px-4 py-3 rounded-3xl transition-all duration-200
   ${
     isActive
       ? "bg-[#e3fff4] text-[#3fcea5] font-semibold "
       : "text-gray-700 hover:bg-[#e3fff4] hover:text-[#3fcea5]"
   }`;

const SideBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
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
            <div className="bg-[#fff3e8] p-2 rounded-xl">
              <Logo className="text-[#f6c396] w-8 h-8" />
            </div>

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
        <nav className="flex flex-col gap-2">
          <NavLink to="/" end className={navClass}>
            <FoodMenuIcon className="w-6 h-6" />
            <span className="font-medium">บันทึก</span>
          </NavLink>

          <NavLink to="/Meal" className={navClass}>
            <FoodMenuIcon className="w-6 h-6" />
            <span className="font-medium">รายการ</span>
          </NavLink>

         
        </nav>
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
          <div className="bg-[#fff3e8] p-2 rounded-xl">
            <Logo className="text-[#f6c396] w-8 h-8" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">Crumblee</h1>
        </div>

        {/* Center */}
        <nav
          className="
      absolute left-1/2 -translate-x-1/2
      flex items-center gap-2
    "
        >
          <NavLink to="/" end className={navClass}>
            <FoodMenuIcon className="w-6 h-6" />
            <span className="font-medium">บันทึก</span>
          </NavLink>

          <NavLink to="/Meal" className={navClass}>
            <FoodMenuIcon className="w-6 h-6" />
            <span className="font-medium">รายการ</span>
          </NavLink>


        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0 max-w-[250px]">
          <div className="min-w-0 truncate text-right">
            Phongthikorn Thongadddddddddddddrddddd
          </div>

          <div className="w-14 h-14 rounded-full bg-amber-300 shrink-0"></div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
