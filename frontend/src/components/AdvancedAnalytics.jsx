import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [timeRange]);

  const fetchAdvancedAnalytics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analytics/advanced?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    }
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+{analytics.growthRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg per Month</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.avgPerMonth}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Goal Progress</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.goalProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="activities" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
              <Bar dataKey="credits" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Credit Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.creditDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.creditDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
