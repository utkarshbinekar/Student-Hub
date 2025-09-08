import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Clock, FileText, Filter, Search, Download, Eye } from 'lucide-react';
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
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, filter, search]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/activities');
      setActivities(response.data);
    } catch (error) {
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
        { status, credits }
      );

      setActivities(prev =>
        prev.map(activity =>
          activity._id === activityId ? response.data : activity
        )
      );

      toast.success(`Activity ${status} successfully!`);
      setModalOpen(false);
    } catch (error) {
      toast.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} activity`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      conference: FileText,
      workshop: FileText,
      certification: FileText,
      competition: FileText,
      internship: FileText,
      volunteer: FileText,
      leadership: FileText,
      community: FileText
    };
    const IconComponent = icons[type] || FileText;
    return <IconComponent className="h-5 w-5 text-blue-600" />;
  };

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    approved: activities.filter(a => a.status === 'approved').length,
    rejected: activities.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-hidden">
      <Navbar />
      
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faculty Approval Panel</h1>
          <p className="text-gray-600 mt-2">Review and approve student activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-12 w-12 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-12 w-12 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Check className="h-12 w-12 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <X className="h-12 w-12 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by activity title, student name, or ID..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Activities List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' ? 'No activities to review yet.' : `No ${filter} activities found.`}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity._id} className="bg-white shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 capitalize">
                                {activity.type} • {new Date(activity.date).toLocaleDateString()}
                              </p>
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Student: </span>
                                <span className="text-sm text-gray-600">
                                  {activity.student?.name} ({activity.student?.studentId})
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="text-sm font-medium text-gray-700">Department: </span>
                                <span className="text-sm text-gray-600">{activity.student?.department}</span>
                              </div>
                              {activity.organizer && (
                                <div className="mt-1">
                                  <span className="text-sm font-medium text-gray-700">Organizer: </span>
                                  <span className="text-sm text-gray-600">{activity.organizer}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-3">{activity.description}</p>
                          
                          {activity.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Duration:</span> {activity.duration}
                            </p>
                          )}

                          {activity.credits > 0 && (
                            <p className="text-sm text-green-600 mt-1 font-medium">
                              Credits Awarded: {activity.credits}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedActivity(activity);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        {activity.certificate && (
                          <a
                            href={`http://localhost:5000/${activity.certificate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Certificate
                          </a>
                        )}
                      </div>

                      {activity.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(activity._id, 'rejected')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approval Modal */}
        {modalOpen && selectedActivity && (
          <ApprovalModal
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

// Approval Modal Component (unchanged)
const ApprovalModal = ({ activity, onClose, onApprove, onReject }) => {
  const [credits, setCredits] = useState(0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Review Activity</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-sm text-gray-600 capitalize">{activity.type}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Student:</p>
                <p className="text-sm text-gray-600">
                  {activity.student?.name} ({activity.student?.studentId})
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Description:</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Date:</p>
                <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
              </div>

              {activity.organizer && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Organizer:</p>
                  <p className="text-sm text-gray-600">{activity.organizer}</p>
                </div>
              )}

              {activity.duration && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Duration:</p>
                  <p className="text-sm text-gray-600">{activity.duration}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits to Award (if approving):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={credits}
                  onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  placeholder="Enter credits (0-10)"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={() => onApprove(credits)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
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
