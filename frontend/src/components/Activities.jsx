import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Award, Clock, Users, Star, Briefcase, Heart, Trophy } from 'lucide-react';
import Navbar from './Navbar';
import AddActivityModal from './AddActivityModal';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchActivities();
    }
  }, [user?.id]);

  const fetchActivities = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/activities/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Error loading activities');
      
      try {
        const response = await axios.get('http://localhost:5000/api/activities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const userActivities = response.data.filter(activity => 
          activity.student === user.id || 
          activity.student?._id === user.id ||
          activity.student?.toString() === user.id
        );
        
        setActivities(userActivities);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast.error('Error fetching activities');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdded = (newActivity) => {
    setActivities([newActivity, ...activities]);
    setIsModalOpen(false);
    toast.success('Activity added successfully! 🎉');
    fetchActivities();
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        class: 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg',
        label: 'Approved ✓'
      },
      rejected: {
        class: 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg',
        label: 'Rejected ✗'
      },
      pending: {
        class: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
        label: 'Pending ⏳'
      }
    };
    
    const badge = badges[status] || badges.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.class} animate-pulse`}>
        {badge.label}
      </span>
    );
  };

  const getActivityIcon = (type) => {
    const icons = {
      conference: FileText,
      workshop: Users,
      certification: Award,
      competition: Trophy,
      internship: Briefcase,
      volunteer: Heart,
      leadership: Star,
      community: Users
    };
    return icons[type] || FileText;
  };

  const getActivityColor = (type) => {
    const colors = {
      conference: 'from-blue-500 to-blue-600',
      workshop: 'from-purple-500 to-purple-600',
      certification: 'from-green-500 to-green-600',
      competition: 'from-yellow-500 to-orange-500',
      internship: 'from-indigo-500 to-indigo-600',
      volunteer: 'from-pink-500 to-pink-600',
      leadership: 'from-red-500 to-red-600',
      community: 'from-teal-500 to-teal-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.status === filter;
  });

  const stats = {
    total: activities.length,
    approved: activities.filter(a => a.status === 'approved').length,
    pending: activities.filter(a => a.status === 'pending').length,
    credits: activities.filter(a => a.status === 'approved').reduce((sum, a) => sum + (a.credits || 0), 0)
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <Navbar />
      
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Activities
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Track your academic and extracurricular journey</p>
          
          {error && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-lg">
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Activities</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
              <Award className="h-10 w-10 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Credits</p>
                <p className="text-3xl font-bold">{stats.credits}</p>
              </div>
              <Trophy className="h-10 w-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filter and Add Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-blue-50'
              }`}
            >
              All ({activities.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-yellow-50'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-green-50'
              }`}
            >
              Approved ({stats.approved})
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Activity
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {filter === 'all' ? 'No activities yet' : `No ${filter} activities`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all' 
                    ? 'Start your academic journey by adding your first activity.' 
                    : `You don't have any ${filter} activities yet.`
                  }
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Activity
                </button>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const activityColor = getActivityColor(activity.type);
                
                return (
                  <div key={activity._id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className={`bg-gradient-to-r ${activityColor} rounded-xl p-3 flex-shrink-0 shadow-lg`}>
                        <ActivityIcon className="h-6 w-6 text-white" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.title}</h3>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium capitalize">
                                {activity.type}
                              </span>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(activity.status)}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{activity.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4 text-sm text-gray-600">
                            {activity.organizer && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{activity.organizer}</span>
                              </div>
                            )}
                            {activity.duration && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{activity.duration}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {activity.credits > 0 && (
                              <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                {activity.credits} Credits
                              </div>
                            )}
                            
                            {activity.certificate && (
                              <a
                                href={`http://localhost:5000/${activity.certificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Certificate
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <AddActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onActivityAdded={handleActivityAdded}
        />
      </div>
    </div>
  );
};

export default Activities;
