/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/tailadmin/**/*.js",
    ],
    // En v4, puedes mantener la configuración mínima
    theme: {
        extend: {
            // Puedes agregar extensiones que no conflictúen con las variables CSS
        },
    },
}