import PersonIcon from "../assets/icon/person.svg?react";
import LockIcon from "../assets/icon/lock.svg?react";
import VisibilityOn from "../assets/icon/visibility_on.svg?react";
import VisibilityOff from "../assets/icon/visibility_off.svg?react";
import axios from "../api/axios";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type ErrorStatus =
  | "EMAIL_NOT_FOUND"
  | "INVALID_PASSWORD"
  | "MISSING_FIELDS"
  | null;

function login_layout() {
  const [visibility, setVisiblity] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userRef = useRef<HTMLInputElement>(null);
  const [errorStatus, setErrorStatus] = useState<ErrorStatus>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("TRY TO LOGIN");
      const response = await axios.post("/api/auth/login", { email, password });
      const data = response?.data;
      console.log(data);
      if (response.data) {
        navigate("/");
        navigate(0);
      }

      // const userName = response?.data?.accessToken;
    } catch (err: any) {
      setErrorStatus(err.response?.data.errorCode);
      if (errorStatus == "INVALID_PASSWORD") setPassword("");
      else if (errorStatus == "EMAIL_NOT_FOUND") {
        setPassword("");
      }
    }
    setIsLoading(false);
  };
  // useEffect(() => {
  //   userRef.current?.focus();

  //   let isMounted = true;
  //   const controller = new AbortController();

  //   const getUsers = async () => {
  //     try {
  //       const response = await axios.post("/login", { email, password },  {
  //         signal: controller.signal,
  //       });
  //       console.log(response.data);
  //       isMounted;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //     return () => {
  //       isMounted = false;
  //       controller.abort();
  //     };
  //   };
  //   getUsers();
  // }, []);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="w-full max-w-md rounded-4xl bg-gradient-to-r from-[#99eed6]
    via-[#b9e6e7]
    to-[#5bc7eb] p-[3px]"
        >
          <div className="rounded-4xl bg-white backdrop-blur-xl relative flex flex-col p-6 sm:p-8 space-y-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-3xl sm:text-4xl text-gray-700 kanit-bold text-center">
                กรุณาเข้าสู่ระบบ
              </div>

              <div>
                <div className="mb-3">Email (อีเมลล์)</div>

                <div
                  className={`w-full p-3 border rounded-4xl ${errorStatus == "EMAIL_NOT_FOUND" ? "border-red-500" : "border-gray-500"} flex flex-row gap-4 items-center`}
                >
                  <PersonIcon className="fill-gray-500" />

                  <input
                    type="text"
                    className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
                    autoComplete="off"
                    value={email}
                    ref={userRef}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(
                        /[^\x20-\x7E]/g,
                        "",
                      );
                      setEmail(filtered);
                    }}
                  />
                </div>
                {errorStatus == "EMAIL_NOT_FOUND" ? (
                  <div className="text-red-500">
                    ไม่พบ Email ดังกล่าวในระบบ กรุณาลงทะเบียน
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div>
                <div className="mb-3">Password (รหัสผ่าน)</div>
                <div
                  className={`w-full p-3 border rounded-4xl ${errorStatus == "INVALID_PASSWORD" ? "border-red-500" : "border-gray-500"}  flex flex-row gap-4 items-center"`}
                >
                  <LockIcon className="fill-gray-500" />

                  <input
                    type={visibility ? "text" : "password"}
                    className="w-full outline-none border-none focus:outline-none focus:ring-0 bg-transparent"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(
                        /[^\x20-\x7E]/g,
                        "",
                      );
                      setPassword(filtered);
                    }}
                  />

                  <button
                    type="button"
                    className="cursor-pointer shrink-0"
                    onClick={() => setVisiblity((prev) => !prev)}
                  >
                    {visibility ? (
                      <VisibilityOn className="fill-gray-500" />
                    ) : (
                      <VisibilityOff className="fill-gray-500" />
                    )}
                  </button>
                </div>
                {errorStatus == "INVALID_PASSWORD" ? (
                  <div className="text-red-500">คุณกรอกรหัสผ่านไม่ถูกต้อง</div>
                ) : (
                  ""
                )}
              </div>

              <button
                type="submit"
                className={`w-full px-6 py-3 text-center uppercase transition-all duration-500
    bg-size-[150%_auto] ${password.length >= 8 && /@/.test(email) ? "bg-linear-to-r from-[#70fad3] via-[#38afd6] to-[#38afd6] cursor-pointer hover:bg-right hover:scale-[1.02]" : "bg-gray-300"}
    text-white shadow-[0_0_20px_#eee] rounded-4xl
     outline-none border-none 
    kanit-bold `}
              >
                เข้าสู่ระบบ
              </button>
            </form>
            {isLoading && (
              <div className="flex flex-row justify-center gap-3">
                <div className="text-gray-30">กำลังโหลด</div>
                <span className="loading loading-spinner text-gray-300 loading-md"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default login_layout;
