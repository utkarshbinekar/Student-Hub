import React, { useState } from 'react';
import { X, Upload, Calendar, FileText, User, Users, Award, Trophy, Star, Briefcase, Heart, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddActivityModal = ({ isOpen, onClose, onActivityAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: 'conference',
    description: '',
    date: '',
    organizer: '',
    duration: '',
    certificate: null
  });

  const activityTypes = [
    { value: 'conference', label: 'Conference', icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    { value: 'workshop', label: 'Workshop', icon: Users, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
    { value: 'certification', label: 'Certification', icon: Award, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
    { value: 'competition', label: 'Competition', icon: Trophy, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
    { value: 'internship', label: 'Internship', icon: Briefcase, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
    { value: 'volunteer', label: 'Volunteer', icon: Heart, color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-200' },
    { value: 'leadership', label: 'Leadership', icon: Star, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
    { value: 'community', label: 'Community', icon: Users, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-200' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, type: type }));
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (formData.certificate) {
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] && key !== 'certificate') {
            submitData.append(key, formData[key]);
          }
        });

        if (formData.certificate) {
          submitData.append('certificate', formData.certificate);
        }

        response = await axios.post('http://localhost:5000/api/activities/with-file', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        const submitData = {
          title: formData.title,
          type: formData.type,
          description: formData.description,
          date: formData.date,
          organizer: formData.organizer,
          duration: formData.duration
        };

        response = await axios.post('http://localhost:5000/api/activities', submitData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      onActivityAdded(response.data);
      resetForm();
      toast.success('Activity added successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error adding activity:', error);
      const errorMessage = error.response?.data?.message || 'Error adding activity';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', type: 'conference', description: '', date: '', organizer: '', duration: '', certificate: null
    });
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedType = activityTypes.find(type => type.value === formData.type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose}></div>

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add Activity</h3>
                  <p className="text-blue-100 text-xs">Step {currentStep} of 2</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="bg-white bg-opacity-20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${(currentStep / 2) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Step 1: Activity Type Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Choose Activity Type</h4>
                    <p className="text-gray-600">Select the type of activity you want to add</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {activityTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.type === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeSelect(type.value)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${isSelected
                              ? `${type.borderColor} ${type.bgColor} shadow-lg ring-2 ring-blue-300`
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-3 mx-auto shadow-md`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <h5 className={`font-bold text-sm mb-1 ${isSelected ? type.textColor : 'text-gray-900'}`}>
                            {type.label}
                          </h5>

                          {isSelected && (
                            <div className="absolute -top-2 -right-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Form Details - FIXED VERSION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${selectedType?.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      {selectedType && <selectedType.icon className="h-8 w-8 text-white" />}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedType?.label} Details</h4>
                    <p className="text-gray-600">Fill in the details of your activity</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Title - Full Width */}
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Activity Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter a descriptive title for your activity"
                      />
                    </div>

                    {/* Date and Duration */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="e.g., 2 days"
                      />
                    </div>

                    {/* Organizer - Full Width */}
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Organizer
                      </label>
                      <input
                        type="text"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Organization or institution name"
                      />
                    </div>

                    {/* Description - Full Width */}
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                        placeholder="Describe what you did, what you learned, and any achievements..."
                      />
                    </div>

                    {/* File Upload - Full Width */}
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Certificate/Document
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${formData.certificate
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }`}>
                        {formData.certificate ? (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-green-800 font-semibold text-sm">{formData.certificate.name}</p>
                              <p className="text-green-600 text-xs">File selected successfully</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, certificate: null }));
                                // Reset file input
                                const fileInput = document.querySelector('input[type="file"]');
                                if (fileInput) fileInput.value = '';
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                              <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <label className="cursor-pointer">
                                <span className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">Choose a file</span>
                                <span className="text-gray-600"> or drag and drop</span>
                                <input
                                  type="file"
                                  name="certificate"
                                  onChange={handleFileChange}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="sr-only"
                                />
                              </label>
                              <p className="text-gray-500 text-xs mt-1">PDF, PNG, JPG up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back
                </button>
              )}

              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.type}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !formData.title || !formData.description || !formData.date}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="inline h-4 w-4 mr-2" />
                        Add Activity
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;
