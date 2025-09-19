import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, BookOpen, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', studentId: '', department: '', year: ''
  });

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (formData.role === 'student' && !formData.studentId) {
          toast.error('Student ID is required');
          setLoading(false);
          return;
        }
        result = await register(formData);
      }

      if (result.success) {
        toast.success(isLogin ? 'Welcome back! 🎉' : 'Account created successfully! 🎉');
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', role: 'student', studentId: '', department: '', year: '' });
  };

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology'];
  const years = [1, 2, 3, 4];

  return (
    <div className="min-h-screen w-screen flex overflow-hidden">
      {/* Hero Section - 55% */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        {/* Compact Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-48 h-48 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-32 right-24 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-24 left-32 w-56 h-56 bg-gradient-to-r from-blue-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Compact Floating Icons */}
          <div className="absolute top-24 right-32 animate-float">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-32 right-24 animate-float-delayed">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Compact Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 text-white">
          <div className="max-w-lg">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">Smart Student Hub</h1>
                  <p className="text-blue-200 text-xs">Academic Excellence Platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight">
                  Shape Your
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Academic Future
                  </span>
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Transform your academic journey with our comprehensive platform for tracking achievements and building portfolios.
                </p>
              </div>
            </div>

            {/* Compact Features */}
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Activity Tracking</h3>
                  <p className="text-blue-100 text-sm">Document every achievement in one place</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Digital Portfolio</h3>
                  <p className="text-blue-100 text-sm">Generate professional portfolios instantly</p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Faculty Verification</h3>
                  <p className="text-blue-100 text-sm">Streamlined approval process</p>
                </div>
              </div>
            </div>

            {/* Compact Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">1000+</div>
                <div className="text-blue-200 text-xs">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">50+</div>
                <div className="text-blue-200 text-xs">Faculty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">5000+</div>
                <div className="text-blue-200 text-xs">Activities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - 45% */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart Student Hub</h1>
          </div>

          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Us Today'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to continue' : 'Start your journey'}
            </p>
          </div>

          {/* Demo Credentials
          {isLogin && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-xl mb-4">
              <div className="flex items-center mb-2">
                <Sparkles className="h-4 w-4 text-blue-600 mr-1" />
                <p className="font-bold text-blue-800 text-sm">Demo Credentials</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="bg-white bg-opacity-70 px-2 py-1 rounded-lg">
                  <span className="font-semibold text-blue-700">Student:</span> student@demo.com / password
                </div>
                <div className="bg-white bg-opacity-70 px-2 py-1 rounded-lg">
                  <span className="font-semibold text-blue-700">Faculty:</span> faculty@demo.com / password
                </div>
              </div>
            </div>
          )} */}

          {/* Compact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white shadow-xl rounded-2xl px-6 py-6 border border-gray-100">
              
              {/* Name Field (Registration only) */}
              {!isLogin && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              {/* Email and Password */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Registration Fields */}
              {!isLogin && (
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">I am a *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'student'})}
                        className={`p-3 rounded-xl border transition-all duration-200 text-sm ${
                          formData.role === 'student' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'faculty'})}
                        className={`p-3 rounded-xl border transition-all duration-200 text-sm ${
                          formData.role === 'faculty' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <Users className="h-5 w-5 mx-auto mb-1" />
                        Faculty
                      </button>
                    </div>
                  </div>

                  {/* Student Fields */}
                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Student ID *</label>
                        <input
                          name="studentId"
                          type="text"
                          required
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Enter student ID"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Department</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                          >
                            <option value="">Select</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Year</label>
                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                          >
                            <option value="">Select</option>
                            {years.map(year => (
                              <option key={year} value={year}>Year {year}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Faculty Fields */}
                  {formData.role === 'faculty' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Department *</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isLogin ? 'Signing in...' : 'Creating...'}
                    </div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>

              {/* Toggle Mode */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full px-4 py-2 text-sm font-semibold text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-200 border border-blue-100 hover:border-blue-200"
                >
                  {isLogin ? "New here? Create account" : 'Have an account? Sign in'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
