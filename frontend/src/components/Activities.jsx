import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Award } from 'lucide-react';
import Navbar from './Navbar';
import AddActivityModal from './AddActivityModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

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

  const handleActivityAdded = (newActivity) => {
    setActivities([newActivity, ...activities]);
    setIsModalOpen(false);
    toast.success('Activity added successfully!');
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
            <p className="text-gray-600 mt-2">Manage your academic and extracurricular activities</p>
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
                <div key={activity._id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
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
                          {activity.credits > 0 && (
                            <span className="text-green-600 font-medium">
                              {activity.credits} credits
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
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
