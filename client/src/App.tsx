import { Routes } from "react-router";
import "./App.css";
import { Route } from "react-router";
import Home from "./routes/home";
import Meal from "./routes/meal";
import Workout from "./routes/workout";
import LoginLayout from "./layout/login_layout";
import RegisterLayout from "./layout/register_layout";
import MainLayout from "./layout/main_layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* Layout ที่มี Sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route element = {<ProtectedRoute/>}>
            <Route path="/meal" element={<Meal />} />
            <Route path="/workout" element={<Workout />} />
          </Route>
        </Route>

        {/* Layout ของ Login */}
        <Route path="/login" element={<LoginLayout />} />
        <Route path="/register" element={<RegisterLayout />} />
      </Routes>
    </>
  );
}

export default App;
