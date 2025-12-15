import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { login as apiLogin } from "../../Apis/authApi"
import toast from "react-hot-toast";
export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiLogin({ correo, password });
      const token = data?.token
      const user = data?.user

      if (!token) throw new Error("Token no recibido");

      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      const rol = user?.rol ?? "estudiante";
      if (rol === "admin") navigate("/admin/dashboard");
      else if (rol === "docente" || rol === "teacher") navigate("/docente/dashboard");
      else navigate("/estudiante/dashboard");
    } catch (err: unknown) {
      console.error(err);
      let message = "Error en login";
      if (typeof err === "object" && err !== null) {
        const maybeAxios = err as { response?: { data?: { message?: string } } };
        if (maybeAxios.response?.data?.message) {
          message = maybeAxios.response.data.message;
        } else if ("message" in err && typeof (err as { message?: string }).message === "string") {
          message = (err as { message?: string }).message as string;
        }
      }
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu Correo y Contraseña
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="correo"
                    type="email"
                    value={correo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)}
                    placeholder="info@unet.edu.ve"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder="********"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Recuerdame
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Olvidaste la contraseña?
                  </Link>
                </div>
                <div>
                  <button type="submit" className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Iniciar Sesion
                  </button>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    No tienes una cuenta? {" "}
                    <Link
                      to="/signup"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 pl-2"
                    >
                      Registrate!!
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div >
    </div >
  );
}
