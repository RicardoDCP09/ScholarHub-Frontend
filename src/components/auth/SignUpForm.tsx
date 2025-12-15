import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { ArrowDownFromLine } from 'lucide-react';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select"
import { register as apiRegister } from "../../Apis/authApi";
import toast from "react-hot-toast";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectRole, setSelectRole] = useState("")

  const navigate = useNavigate()
  const roleOptions = [
    { value: "estudiante", label: "Estudiante" },
  ];

  const handleRoleChange = (value: string) => {
    setSelectRole(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const payload = {
      nombre: (fd.get("nombre") as string) || "",
      apellido: (fd.get("apellido") as string) || "",
      correo: (fd.get("correo") as string) || "",
      password: (fd.get("password") as string) || "",
      rol: selectRole || "estudiante",
    };

    try {
      await apiRegister(payload);
      toast.success("Registro exitoso. Redirigiendo a Iniciar Sesión...");
      navigate("/signin");
    } catch (err: unknown) {
      console.error(err);
      let message = "Error en registro";
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
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registrate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tus datos para registrarte
            </p>
          </div>
          <div>
        <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Primer Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="nombre"
                      name="nombre"
                      placeholder="Ingresa tu nombre..."
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="apellido"
                      name="apellido"
                      placeholder="Ingresa tu apellido"
                    />
                  </div>
                </div>

                {/* <!-- Select --> */}
                <div className="relative">
                  <Label>
                    Rol<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={roleOptions}
                      placeholder="Selecciona tu rol"
                      onChange={handleRoleChange}
                      className="dark:bg-dark-900 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ArrowDownFromLine className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="correo"
                    name="correo"
                    placeholder="Email.."
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ingresa tu contraseña..."
                      type={showPassword ? "text" : "password"}
                      name="password"
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


                {/* <!-- Button --> */}
                <div>
                  <button type="submit" className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Registrarse
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Ya tienes una cuenta? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
