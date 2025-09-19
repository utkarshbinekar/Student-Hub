import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Award } from 'lucide-react';
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
      // Try user-specific endpoint first
      const response = await axios.get(`http://localhost:5000/api/activities/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Error loading activities');
      
      // Fallback to general activities endpoint and filter client-side
      try {
        const response = await axios.get('http://localhost:5000/api/activities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Filter activities for current user client-side as fallback
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
    toast.success('Activity added successfully!');
    // Refresh activities to get updated data
    fetchActivities();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      conference: FileText,
      workshop: Award,
      certification: Award,
      competition: Award,
      internship: FileText,
      volunteer: Award,
      leadership: Award,
      community: Award
    };
    const IconComponent = icons[type] || FileText;
    return <IconComponent className="h-6 w-6 text-blue-600" />;
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 overflow-hidden">
      <Navbar />
      
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
            <p className="text-gray-600 mt-2">Manage your academic and extracurricular activities</p>
            {error && (
              <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Activity
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first activity.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Activity
                  </button>
                </div>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{activity.type}</p>
                        <p className="text-sm text-gray-500 mt-2">{activity.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                          {activity.organizer && (
                            <span>Organized by: {activity.organizer}</span>
                          )}
                          {activity.duration && (
                            <span>Duration: {activity.duration}</span>
                          )}
                        </div>
                        
                        {activity.credits > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {activity.credits} credits awarded
                            </span>
                          </div>
                        )}
                        
                        {activity.certificate && (
                          <div className="mt-2">
                            <a
                              href={`http://localhost:5000/${activity.certificate}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Certificate
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
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
