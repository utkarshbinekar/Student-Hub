import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Clock, FileText, Filter, Search, Download, Eye, Star, Award, Users, Calendar } from 'lucide-react';
import Navbar from './Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Faculty = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'admin') {
      fetchActivities();
    }
  }, [user]);

  useEffect(() => {
    filterActivities();
  }, [activities, filter, search]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Error fetching activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.status === filter);
    }

    if (search) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(search.toLowerCase()) ||
        activity.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        activity.student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
        activity.type.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const handleApproval = async (activityId, status, credits = 0) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/activities/${activityId}/status`,
        { status, credits },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setActivities(prev =>
        prev.map(activity =>
          activity._id === activityId ? response.data : activity
        )
      );

      toast.success(`Activity ${status} successfully! 🎉`);
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} activity`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        class: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
        icon: Check,
        label: 'Approved'
      },
      rejected: {
        class: 'bg-gradient-to-r from-red-400 to-red-600 text-white',
        icon: X,
        label: 'Rejected'
      },
      pending: {
        class: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
        icon: Clock,
        label: 'Pending'
      }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.class} shadow-sm`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </div>
    );
  };

  const getActivityIcon = (type) => {
    const icons = {
      conference: FileText,
      workshop: Users,
      certification: Award,
      competition: Star,
      internship: FileText,
      volunteer: Users,
      leadership: Star,
      community: Users
    };
    return icons[type] || FileText;
  };

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    approved: activities.filter(a => a.status === 'approved').length,
    rejected: activities.filter(a => a.status === 'rejected').length
  };

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-red-50 to-red-100 overflow-hidden">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">This page is only accessible to faculty and administrators.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <Navbar />

      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Faculty Approval Panel
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Review and approve student activities with ease</p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Activities</p>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-blue-200 text-xs mt-1">All submissions</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <FileText className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
                <p className="text-yellow-200 text-xs mt-1">Awaiting decision</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
                <p className="text-green-200 text-xs mt-1">Successfully reviewed</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Check className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold">{stats.rejected}</p>
                <p className="text-red-200 text-xs mt-1">Not approved</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <X className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities, students, or IDs..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Activities List */}
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
          <div className="space-y-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">No activities found</h3>
                <p className="mt-2 text-gray-500">
                  {filter === 'all' ? 'No activities to review yet.' : `No ${filter} activities found.`}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={activity._id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start space-x-4">
                      {/* Activity Icon */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-3 flex-shrink-0">
                        <ActivityIcon className="h-6 w-6 text-white" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium capitalize">
                                {activity.type}
                              </span>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(activity.status)}
                        </div>

                        {/* Student Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Student:</span>
                              <p className="text-gray-600">{activity.student?.name}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">ID:</span>
                              <p className="text-gray-600">{activity.student?.studentId}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Department:</span>
                              <p className="text-gray-600">{activity.student?.department}</p>
                            </div>
                          </div>
                        </div>

                        {/* Activity Details */}
                        <p className="text-gray-700 mb-4 leading-relaxed">{activity.description}</p>

                        <div className="flex items-center justify-between space-x-4">
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

                          {activity.credits > 0 && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {activity.credits} Credits
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex space-x-3">
                            {activity.certificate && (
                              <a
                                href={`http://localhost:5000/${activity.certificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors duration-200 font-medium"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                View Certificate
                              </a>
                            )}
                          </div>

                          {activity.status === 'pending' && (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleApproval(activity._id, 'rejected')}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedActivity(activity);
                                  setModalOpen(true);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Enhanced Approval Modal */}
        {modalOpen && selectedActivity && (
          <EnhancedApprovalModal
            activity={selectedActivity}
            onClose={() => {
              setModalOpen(false);
              setSelectedActivity(null);
            }}
            onApprove={(credits) => handleApproval(selectedActivity._id, 'approved', credits)}
            onReject={() => handleApproval(selectedActivity._id, 'rejected')}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Approval Modal Component
const EnhancedApprovalModal = ({ activity, onClose, onApprove, onReject }) => {
  const [credits, setCredits] = useState(3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Review Activity</h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">{activity.title}</h4>
                <p className="text-blue-600 font-medium capitalize mt-1">{activity.type}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h5 className="font-semibold text-gray-900 mb-2">Student Information</h5>
                <p className="text-gray-700">
                  <span className="font-medium">{activity.student?.name}</span> ({activity.student?.studentId})
                </p>
                <p className="text-gray-600 text-sm">{activity.student?.department}</p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-700 leading-relaxed">{activity.description}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Credits to Award (if approving):
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold min-w-[60px] text-center">
                    {credits} pts
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              onClick={() => onApprove(credits)}
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 sm:ml-3 sm:w-auto"
            >
              <Check className="h-5 w-5 mr-2" />
              Approve ({credits} credits)
            </button>
            <button
              onClick={onReject}
              className="mt-3 w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 sm:mt-0 sm:w-auto"
            >
              <X className="h-5 w-5 mr-2" />
              Reject
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-xl border-2 border-gray-300 shadow-sm px-6 py-3 bg-white font-bold text-gray-700 hover:bg-gray-50 transition-colors duration-200 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faculty;
