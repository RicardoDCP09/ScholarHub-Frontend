import {
    BookOpen,
    Microscope,
    FileText,
    Search,
    Users,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import ImageUnetLibs from "../../assets/fondoLibs.png"
import LogoUnet from "../../assets/logoUnet.png"
import LogoMoving from "../../assets/logoMoving.png"
const HomePage = () => {
    const modules = [
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: "Inventario de Biblioteca",
            description: "Gestión completa de libros, revistas y material bibliográfico",
            features: ["Búsqueda avanzada", "Disponibilidad en tiempo real", "Categorización"]
        },
        {
            icon: <Microscope className="w-8 h-8" />,
            title: "Equipos de Laboratorio",
            description: "Control de préstamos de equipos científicos y tecnológicos",
            features: ["Reservas online", "Estado de equipos", "Calendario de disponibilidad"]
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Tesis y Pasantías",
            description: "Repositorio digital de trabajos de grado y pasantías",
            features: ["Búsqueda por carrera", "Descarga digital", "Metadatos completos"]
        },
        {
            icon: <Search className="w-8 h-8" />,
            title: "Investigaciones",
            description: "Base de datos de proyectos de investigación UNET",
            features: ["Filtros por área", "Investigadores", "Publicaciones"]
        }
    ];

    const navigate = useNavigate()

    const goToLogin = () => {
        navigate('/signin')
    }

    const goToRegister = () => {
        navigate('/signup')
    }
    const goToResources = () => {
        navigate('/recursos')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo UNET */}
                        <div className="flex items-center space-x-3">
                            <div className="bg-unet-700 text-white p-2 rounded-lg">
                                <img
                                    className='w-8 y-8'
                                    src={LogoUnet}
                                    alt="Logo Unet"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">UNET</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400"> ScholarHub</p>
                            </div>
                        </div>

                        {/* Navegación */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#inicio" className="text-unet-600 font-medium">Inicio</a>
                            <a href="#quienes-somos" className="text-gray-600 dark:text-gray-300 hover:text-unet-600">Quiénes somos</a>
                            <a href="#sistema" className="text-gray-600 dark:text-gray-300 hover:text-unet-600">Acerca del sistema</a>
                            <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-unet-600">Contacto</a>
                        </nav>

                        {/* Botones de acceso */}
                        <div className="flex items-center space-x-4">
                            <button
                                className="px-4 py-2 text-unet-600 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                onClick={goToLogin}
                            >
                                Iniciar Sesión
                            </button>
                            <button className="px-6 py-2 bg-unet-600 text-white font-medium rounded-lg hover:bg-unet-700 transition-colors"
                                onClick={goToRegister}
                            >
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>
            </header >

            {/* Hero Section */}
            < section
                id="inicio"
                className="text-white py-60"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(30, 64, 175, 0.8)), url(${ImageUnetLibs})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    transform: 'translateZ(0)', // Acelera renderizado
                    backfaceVisibility: 'hidden',
                    imageRendering: '-webkit-optimize-contrast'
                }}
            > <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 unet-750 transform -translate-y-55 ">
                            Sistema Integral de Préstamos e Investigaciones – UNET
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 opacity-90 -translate-y-55 ">
                            Gestión de libros, equipos, tesis, pasantías e investigaciones en un solo lugar.
                        </p>

                        <img
                            className='absolute inset-0 w-full h-full object-scale-down scale-35 transform -translate-y-20 animate-bounce-pulse'
                            src={LogoMoving}
                            alt="Logo Unet"

                        />


                        <div className="flex flex-col sm:flex-row gap-4 justify-center transform -translate-y-10">
                            <button className="px-8 py-3 bg-white text-unet-600 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                                onClick={goToResources}
                            >
                                <Search className="w-5 h-5 mr-2" />
                                Explorar recursos
                            </button>
                            <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-unet-600 transition-colors"
                                onClick={goToLogin}>
                                Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </section >

            {/* Quiénes Somos */}
            < section id="quienes-somos" className="py-20 bg-white dark:bg-gray-800" >
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Quiénes somos</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                Somos un sistema desarrollado para la Universidad Nacional Experimental del Táchira,
                                orientado a mejorar la gestión de préstamos de la biblioteca y los laboratorios,
                                además de servir como repositorio de tesis, pasantías e investigaciones.
                            </p>
                            <div className="flex items-center space-x-4">
                                <Users className="w-12 h-12 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Comunidad UNET</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Estudiantes, profesores e investigadores</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-8">
                            <img
                                className="w-full h-auto rounded-lg shadow-lg"
                                src="https://th.bing.com/th/id/R.26e43cb1f600529e26a8e5b176213622?rik=kkZqrq%2b5SnJfkw&riu=http%3a%2f%2fwww.unet.edu.ve%2fimages%2fstories%2fLLAMADO_A_LA_UNET_2.jpg&ehk=Y7p6bacX1Zr0Q3IEUgtA4YBcE%2bB0xM74FdP4IlRZ2gI%3d&risl=&pid=ImgRaw&r=0"
                                alt="Biblioteca UNET"
                            />
                        </div>
                    </div>
                </div>
            </section >

            {/* Acerca del Sistema */}
            < section id="sistema" className="py-20 bg-gray-50 dark:bg-gray-900" >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            ¿Qué es el sistema?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Una plataforma integral que centraliza todos los recursos académicos
                            y de investigación de la UNET en un solo lugar accesible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {modules.map((module, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-card transition-shadow">
                                <div className="text-blue-600 mb-4">{module.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {module.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {module.description}
                                </p>
                                <ul className="space-y-2 mb-6">
                                    {module.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section >
            {/* Footer */}
            < footer id="contacto" className="bg-gray-800 text-white py-12" >
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4">UNET</h3>
                            <p className="text-gray-400">
                                Universidad Nacional Experimental del Táchira
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a className="hover:text-white transition-colors">Biblioteca</a></li>
                                <li><a className="hover:text-white transition-colors">Laboratorios</a></li>
                                <li><a className="hover:text-white transition-colors">Departamento de Informática</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contacto</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>Telefono:+58 (276) 3532754</li>
                                <li>Email: contacto@unet.edu.ve</li>
                                <li>Dirección: Av. Universidad, Paramillo, San Cristóbal</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Créditos</h4>
                            <p className="text-gray-400">
                                Desarrollado como proyecto académico – Ingeniería Informática UNET 2025
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 UNET. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer >
        </div >
    );
};

export default HomePage;