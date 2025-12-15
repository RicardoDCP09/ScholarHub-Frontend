import { ComponentType } from "react";
import {
    GridIcon,
    UserCircleIcon,
    ListIcon,
    TableIcon,
} from "../icons";
import { BookMarked } from 'lucide-react';


export type IconProps = {
    className?: string;
    size?: number | string;
    color?: string;
};

export type NavItem = {
    name: string;
    icon: ComponentType<IconProps>;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


export const linksByRole: Record<string, NavItem[]> = {
    admin: [
        {
            name: "Dashboard",
            icon: GridIcon,
            path: "/admin/dashboard"
        },
        {
            name: "Usuarios",
            icon: UserCircleIcon,
            path: "/users"
        },
        {
            name: "Recursos",
            icon: BookMarked,
            path: "/recursos"
        },
        {
            name: "Tesis & Pasantías",
            icon: ListIcon,
            path: "/tesis-pasantias"
        },

        {
            name: "Prestamos",
            icon: TableIcon,
            path: "/loans"
        },

    ],
    estudiante: [
        {
            name: "Dashboard",
            icon: GridIcon,
            path: "/estudiante/dashboard"
        },

        {
            name: "Recursos",
            icon: BookMarked,
            subItems: [
                { name: "Recursos", path: "/recursos" },
                { name: "Mis prestamos", path: "/prestamos" },
            ],
        },
        {
            name: "Tesis & Pasantías",
            icon: ListIcon,
            path: "/tesis-pasantias"
        },
    ],
    docente: [
        {
            name: "Dashboard",
            icon: GridIcon,
            path: "/docente/dashboard"
        },

        {
            name: "Estudiantes",
            icon: UserCircleIcon,
            path: "/estudiantes"
        },
        {
            name: "Mis Tesis",
            icon: ListIcon,
            path: "/tesis-pasantias"
        },
        {
            name: "Recursos",
            icon: BookMarked,
            subItems: [
                { name: "Recursos", path: "/recursos" },
                { name: "Mis prestamos", path: "/prestamos" },
            ],
        },
    ],
};

/*
            name: "Users",
            icon: UserCircleIcon,
            subItems: [
                { name: "All Users", path: "/users" },
                { name: "Add User", path: "/users/add" },
            ],
*/ 