import React, { useState } from 'react';
import { Download, FileText, Award, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from './Navbar';

const Portfolio = () => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const generatePortfolio = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/portfolio/generate`, {}, {
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
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FileText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Digital Portfolio</h1>
            <p className="text-gray-600 mt-2">Generate your professional academic portfolio</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Portfolio Includes:</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Personal Information & Photo</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-green-600 mr-2" />
                  <span>All Approved Activities</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <span>Chronological Timeline</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-orange-600 mr-2" />
                  <span>Certificates & Documents</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={generatePortfolio}
                disabled={generating}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Generate Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
