import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, Award, Clock, Users, BookOpen, Trophy, Download, Bell, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import NotificationCenter from './NotificationCenter';
import AdvancedAnalytics from './AdvancedAnalytics';
import ActivityTemplates from './ActivityTemplates';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalActivities: 0,
    approvedActivities: 0,
    pendingActivities: 0,
    totalCredits: 0,
    activityByType: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, activitiesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/activities/analytics/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/activities/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      setAnalytics(analyticsRes.data);
      setRecentActivities(activitiesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolio = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/portfolio/generate', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user.name}-Portfolio.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Portfolio generated successfully!');
    } catch (error) {
      toast.error('Error generating portfolio');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Use the existing Navbar component */}
      <Navbar />
      
      <div className="w-full h-full px-6 py-8">
        {/* Welcome Section with Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              <p className="text-gray-600 mt-2">Track your academic journey and achievements</p>
            </div>
            <div className="flex space-x-4">
              {/* <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Quick Add
              </button> */}
              <button
                onClick={generatePortfolio}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Generate Portfolio
              </button>
              <button
                onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Advanced Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Activity Templates */}
        {showTemplates && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Templates</h3>
            <ActivityTemplates onSelectTemplate={(template) => {
              // Handle template selection - you can integrate this with AddActivityModal
              toast.success(`Selected ${template.name} template`);
              setShowTemplates(false);
            }} />
          </div>
        )}

        {/* Advanced Analytics */}
        {showAdvancedAnalytics && (
          <div className="mb-8">
            <AdvancedAnalytics />
          </div>
        )}

        {/* Stats Cards with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">My Activities</p>
                <p className="text-3xl font-bold">{analytics.totalActivities}</p>
              </div>
              <Activity className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Approved</p>
                <p className="text-3xl font-bold">{analytics.approvedActivities}</p>
              </div>
              <Award className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-3xl font-bold">{analytics.pendingActivities}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Credits</p>
                <p className="text-3xl font-bold">{analytics.totalCredits}</p>
              </div>
              <Trophy className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Charts and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Type</h3>
            {analytics.activityByType && analytics.activityByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.activityByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.activityByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Recent Activities with Enhanced Design */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'approved' 
                          ? 'bg-green-100 text-green-600'
                          : activity.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <Activity className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {activity.type} • {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No activities yet</p>
                  <p className="text-sm">Start adding your achievements!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#E5E7EB" strokeWidth="8" 
                    fill="transparent"
                  />
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#3B82F6" strokeWidth="8" 
                    fill="transparent"
                    strokeDasharray={`${(analytics.approvedActivities / Math.max(analytics.totalActivities, 1)) * 188.4} 188.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-semibold text-gray-700">
                  {Math.round((analytics.approvedActivities / Math.max(analytics.totalActivities, 1)) * 100)}%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Approval Rate</p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#E5E7EB" strokeWidth="8" 
                    fill="transparent"
                  />
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#10B981" strokeWidth="8" 
                    fill="transparent"
                    strokeDasharray={`${Math.min((analytics.totalCredits / 20) * 188.4, 188.4)} 188.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-semibold text-gray-700">
                  {Math.min(Math.round((analytics.totalCredits / 20) * 100), 100)}%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Credit Goal</p>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#E5E7EB" strokeWidth="8" 
                    fill="transparent"
                  />
                  <circle 
                    cx="40" cy="40" r="30" 
                    stroke="#8B5CF6" strokeWidth="8" 
                    fill="transparent"
                    strokeDasharray={`${Math.min((analytics.activityByType.length / 6) * 188.4, 188.4)} 188.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-semibold text-gray-700">
                  {Math.min(Math.round((analytics.activityByType.length / 6) * 100), 100)}%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Diversity Goal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
