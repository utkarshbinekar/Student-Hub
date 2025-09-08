import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Activity, Users, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600';
  };

  return (
    <nav className="bg-blue-600 shadow-lg w-full">
      <div className="w-full px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Smart Student Hub</h2>
            </div>
            <div className="hidden md:block ml-8">
              <div className="flex items-baseline space-x-6">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                >
                  <Home className="inline h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link
                  to="/activities"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/activities')}`}
                >
                  <Activity className="inline h-4 w-4 mr-1" />
                  Activities
                </Link>
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <Link
                    to="/faculty"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/faculty')}`}
                  >
                    <Users className="inline h-4 w-4 mr-1" />
                    Faculty Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-white">
              <User className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-blue-200 ml-2 capitalize">({user?.role})</span>
            </div>
            <button
              onClick={logout}
              className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
