'use client';

import { HiX } from "react-icons/hi";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const routes = [
  {
    name: "Dashboard",
    layout: "/",
    path: "",
    icon: "🏠",
  },
  {
    name: "Vehicles",
    layout: "/",
    path: "vehicles",
    icon: "🚗",
  },
  {
    name: "Drivers",
    layout: "/",
    path: "drivers",
    icon: "👨‍💼",
  },
  {
    name: "Fuel Management",
    layout: "/",
    path: "fuel",
    icon: "⛽",
  },
  {
    name: "Maintenance",
    layout: "/",
    path: "maintenance",
    icon: "🔧",
  },
  {
    name: "Repairs",
    layout: "/",
    path: "repairs",
    icon: "🔨",
  },
  {
    name: "Insurance",
    layout: "/",
    path: "insurance",
    icon: "🛡️",
  },
  {
    name: "Roadworthy",
    layout: "/",
    path: "roadworthy",
    icon: "📋",
  },
  {
    name: "Users",
    layout: "/",
    path: "users",
    icon: "👥",
  },
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[56px] mt-[50px] flex items-center`}>
        <div className="mt-1 ml-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white">
          Nera <span className="font-medium">Fleet</span>
        </div>
      </div>
      <div className="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      
      {/* Nav items */}
      <ul className="mb-auto pt-1">
        {routes.map((route, index) => {
          const isActive = pathname === `/${route.path}` || (pathname === '/' && route.path === '');
          
          return (
            <li key={index} className="mb-2">
              <Link
                href={`/${route.path}`}
                className={`relative flex cursor-pointer items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700'
                }`}
              >
                <span className="mr-3 text-xl">{route.icon}</span>
                {route.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Card */}
      <div className="flex justify-center">
        <div className="mx-4 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white">
          <div className="text-sm font-medium">Nera Fleet Management</div>
          <div className="text-xs opacity-80">Professional Fleet Solutions</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;