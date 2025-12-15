import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

import LogoUnet from "../../assets/logoUnet.png"
import LogoUnetAzul from "../../assets/logoUnetAzul.png"
import Books from "../../assets/books.png"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 h-screen overflow-hidden" >
      <div className="relative flex flex-col justify-center w-full h-full lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs z-10">
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

            </div>
          </div>
          <img
            className="absolute inset-0 w-full h-full object-scale-down scale-35 transform translate-y-80"
            src={Books}
          />
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div >
  );
}
