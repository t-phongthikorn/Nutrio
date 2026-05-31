import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { getAccessToken } from "../api/token";

export default function ProtectedRoute() {
  const { loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>; // หรือ spinner
  }

  if (getAccessToken() == null) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
  <div
    className="w-full max-w-md rounded-4xl bg-gradient-to-r from-[#99eed6]
    via-[#5bc7eb]
    to-[#5bc7eb] p-[3px]"
  >
    <div className="rounded-4xl bg-white backdrop-blur-xl relative flex flex-col p-6 sm:p-8 space-y-8 shadow-2xl">
      
      {/* 🔒 Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          คุณไม่สามารถเข้าถึงได้
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          เนื่องจากคุณยังไม่ได้เข้าสู่ระบบ
          กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนใช้งาน
        </p>
      </div>

      {/* 🔘 Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Login (สีเดียวกับกรอบ) */}
        <button
                type="submit"
                onClick={() => navigate("/login")}
                className={` flex-1 px-6 py-3 text-center uppercase transition-all duration-500
    bg-size-[150%_auto] bg-linear-to-r from-[#70fad3] via-[#38afd6] to-[#38afd6] cursor-pointer hover:bg-right hover:scale-[1.02]}
    text-white shadow-[0_0_20px_#eee] rounded-4xl
     outline-none border-none 
    kanit-bold `}
              >
                เข้าสู่ระบบ
              </button>

        {/* Register (สีขาว) */}
        <button
          className="flex-1  text-lg font-semibold py-3 
          bg-white border border-gray-300 rounded-4xl btn text-gray-700 
          hover:bg-gray-100 transition"
          onClick={() => navigate("/register")}
        >
          สมัครสมาชิก
        </button>
      </div>

    </div>
  </div>
</div>
    );
  }

  return <Outlet />;
}
