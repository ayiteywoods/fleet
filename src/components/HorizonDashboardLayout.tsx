'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import HorizonNavbar from './HorizonNavbar';
import Footer from './Footer';
import { useTheme } from '@/contexts/ThemeContext';

interface HorizonDashboardLayoutProps {
  children: React.ReactNode;
}

const HorizonDashboardLayout = ({ children }: HorizonDashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("Dashboard");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { themeMode } = useTheme();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verify token and get user info
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Authentication failed');
      }
      return res.json();
    })
    .then(data => {
      if (data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    })
    .catch((error) => {
      console.error('Auth error:', error);
      localStorage.removeItem('token');
      router.push('/login');
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    // Set current route based on pathname
    const routeMap: { [key: string]: string } = {
      '/': 'Dashboard',
      '/vehicles': 'Vehicles',
      '/drivers': 'Driver Management',
      '/fuel': 'Fuel Management',
      '/maintenance': 'Maintenance',
      '/repairs': 'Repairs',
      '/insurance': 'Insurance',
      '/roadworthy': 'Roadworthy',
      '/users': 'Users',
    };
    
    // Handle dynamic routes
    if (pathname.startsWith('/vehicle-profile/')) {
      setCurrentRoute('Vehicle Profile');
    } else if (pathname.startsWith('/driver-profile/')) {
      setCurrentRoute('Driver Profile');
    } else {
      setCurrentRoute(routeMap[pathname] || 'Dashboard');
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeMode === 'dark' ? 'bg-navy-900' : 'bg-lightPrimary'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500 mx-auto"></div>
          <p className={`mt-4 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-lightPrimary dark:bg-navy-900">
      {/* Original Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar}
        user={user}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`} style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minWidth: '0',
        flexShrink: 1
      }}>
        {/* Horizon UI Navbar */}
        <div className="z-50">
          <HorizonNavbar
            onOpenSidenav={() => setIsSidebarCollapsed(false)}
            brandText={currentRoute}
            isSidebarCollapsed={isSidebarCollapsed}
            user={user}
          />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 p-6 pt-28 overflow-hidden bg-lightPrimary dark:bg-navy-900" style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          minWidth: '0',
          flexShrink: 1
        }}>
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HorizonDashboardLayout;