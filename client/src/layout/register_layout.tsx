import PersonIcon from "../assets/icon/person.svg?react";
import LockIcon from "../assets/icon/lock.svg?react";
import VisibilityOn from "../assets/icon/visibility_on.svg?react";
import VisibilityOff from "../assets/icon/visibility_off.svg?react";
import { useState } from "react";

function login_layout() {

  const [password_visibility , setPasswordVisiblity] = useState(false)
  const [cf_password_visibility , setCFPasswordVisiblity] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4">
  <div
    className="w-full max-w-md rounded-4xl bg-gradient-to-r from-[#99eed6]
    via-[#b9e6e7]
    to-[#5bc7eb] p-[3px]"
  >
    <div className="rounded-4xl bg-white backdrop-blur-xl relative flex flex-col p-6 sm:p-8 space-y-8 shadow-2xl">
      
      <div className="text-3xl sm:text-4xl text-gray-700 kanit-bold text-center">
        กรุณาสมัครสมาชิก
      </div>

      <div>
        <div className="mb-3">Email (อีเมลล์)</div>

        <div className="w-full p-3 border rounded-4xl border-gray-500 flex flex-row gap-4 items-center">
          <PersonIcon className="fill-gray-500" />

          <input
            type="text"
            className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
          />
        </div>
      </div>

      <div>
        <div className="mb-3">Username (ชื่อผู้ใช้)</div>

        <div className="w-full p-3 border rounded-4xl border-gray-500 flex flex-row gap-4 items-center">
          <PersonIcon className="fill-gray-500" />

          <input
            type="text"
            className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
          />
        </div>
      </div>

      <div>
        <div className="mb-3">Password (รหัสผ่าน)</div>
        <div className="w-full p-3 border rounded-4xl border-gray-500 flex flex-row gap-4 items-center">
          <LockIcon className="fill-gray-500" />

          <input
            type={password_visibility ? "text" : "password"}
            className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
          />

          <button
            type="button"
            className="cursor-pointer shrink-0"
            onClick={() => setPasswordVisiblity((prev) => !prev)}
          >
            {password_visibility ? (
              <VisibilityOn className="fill-gray-500" />
            ) : (
              <VisibilityOff className="fill-gray-500" />
            )}
          </button>
        </div>
      </div>
        <div>
        <div className="mb-3">Confirm Password (ยืนยันรหัสผ่าน)</div>
        <div className="w-full p-3 border rounded-4xl border-gray-500 flex flex-row gap-4 items-center">
          <LockIcon className="fill-gray-500" />

          <input
            type={cf_password_visibility ? "text" : "password"}
            className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
          />

          <button
            type="button"
            className="cursor-pointer shrink-0"
            onClick={() => setCFPasswordVisiblity((prev) => !prev)}
          >
            {cf_password_visibility ? (
              <VisibilityOn className="fill-gray-500" />
            ) : (
              <VisibilityOff className="fill-gray-500" />
            )}
          </button>
        </div>
      </div>
      <button
        className="w-full px-6 py-3 text-center uppercase transition-all duration-500
        bg-size-[200%_auto] bg-linear-to-r from-[#70fad3] via-[#38afd6] to-[#38afd6]
        text-white shadow-[0_0_20px_#eee] rounded-4xl
        cursor-pointer outline-none border-none hover:bg-right
        kanit-bold hover:scale-[1.02]"
      >
        สมัครสมาชิก
      </button>
    </div>
  </div>
</div>
    </>
  );
}

export default login_layout;
