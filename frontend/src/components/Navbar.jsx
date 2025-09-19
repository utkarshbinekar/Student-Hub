import React from 'react';
import { Home, Activity, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['student', 'faculty', 'admin']
    },
    {
      name: 'Activities',
      icon: Activity,
      path: '/activities',
      roles: ['student', 'faculty', 'admin']
    },
    {
      name: 'Faculty Panel',
      icon: Users,
      path: '/faculty',
      roles: ['faculty', 'admin']
    }
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Smart Student Hub</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-white">
              <User className="h-5 w-5 mr-2" />
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-blue-200 capitalize">({user?.role})</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
