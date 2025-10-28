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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      setIsLoading(false);
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
      console.log('Auth response status:', res.status);
      if (!res.ok) {
        console.log('Auth response not ok:', res.status, res.statusText);
        throw new Error(`Authentication failed: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Auth success:', data);
      if (data.user) {
        setUser(data.user);
      } else {
        console.log('No user in response:', data);
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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleHamburger = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  // Close mobile sidebar on route change or when viewport becomes desktop
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`min-h-screen flex ${themeMode === 'dark' ? 'bg-navy-900' : 'bg-lightPrimary'}`}>
      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={toggleSidebar}
          user={user}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 w-64 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} aria-modal="true" role="dialog">
        <Sidebar 
          isCollapsed={false} 
          onToggle={toggleMobileSidebar}
          user={user}
        />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ${isMobileSidebarOpen ? 'overflow-hidden' : ''}`} style={{
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
            onOpenSidenav={handleHamburger}
            brandText={currentRoute}
            isSidebarCollapsed={isSidebarCollapsed}
            user={user}
          />
        </div>
        
        {/* Page Content */}
        <main className={`flex-1 p-3 sm:p-6 pt-20 sm:pt-28 overflow-hidden ${themeMode === 'dark' ? 'bg-navy-800' : 'bg-lightPrimary'}`} style={{
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