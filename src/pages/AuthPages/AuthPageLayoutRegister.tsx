import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

import LogoUnet from "../../assets/logoUnet.png"
import LogoUnetAzul from "../../assets/logoUnetAzul.png"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4 relative w-[432px] h-[240px] group">
                {/* Logo base - siempre visible */}
                <img
                  className="absolute inset-0 object-contain w-full h-full transition-all duration-400 group-hover:opacity-0 drop-shadow-2xl drop-shadow-blue-500"
                  src={LogoUnet}
                  alt="Logo"
                />
                {/* Logo overlay - aparece en hover */}
                <img
                  className="absolute inset-0 object-contain w-full h-full opacity-0 transition-all duration-400 group-hover:opacity-100 drop-shadow-xl drop-shadow-gray-50"
                  src={LogoUnetAzul}
                  alt="Logo overlay"
                />

              </Link>
              <div className="text-center text-gray-400 dark:text-white/60">
                <p className="font-medium text-gray-200 dark:text-white">
                  Bienvenido a ScholarHub!
                </p>
                <p className="mt-1 text-sm text-gray-300 dark:text-white/70">
                  Gestión de libros, equipos, tesis, pasantías e investigaciones en un solo lugar.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
