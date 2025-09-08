import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Award, Clock, Users, BookOpen, Trophy } from 'lucide-react';
import Navbar from './Navbar';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, activitiesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/activities/analytics'),
        axios.get('http://localhost:5000/api/activities')
      ]);
      
      setAnalytics(analyticsRes.data);
      setRecentActivities(activitiesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getActivityIcon = (type) => {
    const icons = {
      conference: BookOpen,
      workshop: Users,
      certification: Award,
      competition: Trophy,
      internship: Activity,
      volunteer: Users,
      leadership: Trophy,
      community: Users
    };
    return icons[type] || Activity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Track your academic journey and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.totalActivities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.approvedActivities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-12 w-12 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.pendingActivities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Trophy className="h-12 w-12 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recentActivities.reduce((sum, activity) => sum + (activity.credits || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities by Type</h3>
            {analytics?.activityByType && analytics.activityByType.length > 0 ? (
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
              <div className="flex items-center justify-center h-300 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity._id} className="flex items-center space-x-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
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
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No activities yet</p>
                  <p className="text-sm">Start adding your achievements!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
