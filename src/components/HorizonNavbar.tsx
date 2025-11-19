'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlignJustify, FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { IoMdNotificationsOutline, IoMdInformationCircleOutline } from "react-icons/io";
import { BsArrowBarUp } from "react-icons/bs";
import { useTheme } from '@/contexts/ThemeContext';

interface NavbarProps {
  onOpenSidenav: () => void;
  brandText: string;
  isSidebarCollapsed?: boolean;
  user?: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    companyName?: string | null;
  };
}

const Navbar = ({ onOpenSidenav, brandText, isSidebarCollapsed = false, user }: NavbarProps) => {
  const { themeMode, toggleThemeMode } = useTheme();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load read notifications from localStorage
  const getReadNotifications = (): Set<string> => {
    try {
      const read = localStorage.getItem('readNotifications');
      return read ? new Set(JSON.parse(read)) : new Set();
    } catch {
      return new Set();
    }
  };

  // Save read notifications to localStorage
  const saveReadNotifications = (readIds: Set<string>) => {
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(readIds)));
  };

  const getPageDescription = (pageTitle: string) => {
    const descriptions: { [key: string]: string } = {
      'Dashboard': 'Real-time insights into your fleet operations',
      'Vehicles': 'Manage and track your vehicle fleet',
      'Drivers': 'Driver management and performance tracking',
      'Fuel Management': 'Monitor fuel consumption and expenses',
      'Maintenance': 'Schedule and track vehicle maintenance',
      'Repairs': 'Manage vehicle repairs and service records',
      'Insurance': 'Insurance policies and coverage management',
      'Roadworthy': 'Vehicle roadworthiness certificates',
      'Users': 'User accounts and permissions management',
      'Settings': 'System configuration and preferences'
    };
    return descriptions[pageTitle] || 'Manage your fleet operations';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // Search for vehicle or driver
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (data.type === 'vehicle') {
          router.push(`/vehicle-profile/${data.id}`);
        } else if (data.type === 'driver') {
          router.push(`/driver-profile/${data.id}`);
        } else {
          // Show not found message
          alert('No vehicle or driver found with that ID or registration number');
        }
      } else {
        alert('No vehicle or driver found with that ID or registration number');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching. Please try again.');
    }
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          // Load read state from localStorage
          const readIds = getReadNotifications();
          const notificationsWithReadState = data.map((n: any) => ({
            ...n,
            read: readIds.has(n.id)
          }));
          setNotifications(notificationsWithReadState);
          setUnreadCount(notificationsWithReadState.filter((n: any) => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });

      // Save to localStorage
      const readIds = getReadNotifications();
      readIds.add(notificationId);
      saveReadNotifications(readIds);

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex flex-row flex-wrap items-center justify-between rounded-xl p-2 backdrop-blur-xl ${
      themeMode === 'dark' ? 'bg-navy-800/80' : 'bg-white/60'
    } ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
      <div className="ml-6">
        {/* Header text removed - now only on pages */}
      </div>

      <div className={`relative mt-[3px] flex h-[61px] w-[550px] flex-grow items-center justify-around gap-2 rounded-full px-2 py-2 shadow-xl shadow-shadow-500 md:w-[570px] md:flex-grow-0 md:gap-1 xl:w-[570px] xl:gap-2 ${
        themeMode === 'dark' ? 'bg-navy-700' : 'bg-white'
      }`}>
        <form onSubmit={handleSearch} className={`flex h-full items-center rounded-full xl:w-[300px] ${
          themeMode === 'dark' ? 'bg-navy-800 text-white' : 'bg-lightPrimary text-navy-700'
        }`}>
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Vehicle or Driver (Reg No, License No)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block h-full w-full rounded-full text-sm font-medium outline-none placeholder:!text-gray-400 sm:w-fit xl:w-[290px] ${
              themeMode === 'dark' ? 'bg-navy-800 text-white placeholder:!text-white' : 'bg-lightPrimary text-navy-700'
            }`}
          />
        </form>
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
            className="cursor-pointer relative"
          >
            <IoMdNotificationsOutline className={`h-4 w-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-600'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-semibold text-white bg-red-600 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-gray-200 dark:border-navy-700 z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-navy-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          !notification.read ? 'bg-blue-600' : 'bg-transparent'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 dark:border-navy-700 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const allIds = notifications.map(n => n.id);
                      const readIds = getReadNotifications();
                      allIds.forEach(id => readIds.add(id));
                      saveReadNotifications(readIds);
                      
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                      setUnreadCount(0);
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Mark all as read
                  </button>
                  <a
                    href="/notifications"
                    onClick={() => setIsNotificationDropdownOpen(false)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View All
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="relative">
          <button className="cursor-pointer">
            <IoMdInformationCircleOutline className={`h-4 w-4 ${themeMode === 'dark' ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Dark mode toggle */}
        <div
          className={`cursor-pointer ${themeMode === 'dark' ? 'text-white' : 'text-gray-600'}`}
          onClick={toggleThemeMode}
        >
          {themeMode === 'dark' ? (
            <RiSunFill className="h-4 w-4" />
          ) : (
            <RiMoonFill className="h-4 w-4" />
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="cursor-pointer"
          >
            <img
              className="h-10 w-10 rounded-full"
              src="/profilemoi.png"
              alt="Profile"
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-gray-200 dark:border-navy-700 py-2 z-50">
              {/* Profile Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-navy-700">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src="/profilemoi.png"
                    alt="Profile"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name || 'Temple Jedi'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(() => {
                        const roleLower = (user?.role || '').toLowerCase()
                        const isAdmin = roleLower === 'admin' || roleLower === 'super admin' || roleLower === 'superadmin' || roleLower === 'super_user' || roleLower === 'superuser'
                        return !isAdmin && user?.companyName
                          ? `${user.role} (${user.companyName})`
                          : user?.role || 'Admin'
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <a
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                <a
                  href="/help"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </a>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 dark:border-navy-700 pt-1">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;