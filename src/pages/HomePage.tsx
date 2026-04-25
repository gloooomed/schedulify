import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Brain, 
  BarChart3, 
  ArrowRight, 
  Clock,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered timetable generation that optimizes for efficiency and conflict resolution.',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Dedicated dashboards for admins, faculty, and students with appropriate permissions.',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Brain,
      title: 'AI Optimization',
      description: 'Advanced algorithms that learn from constraints to create optimal schedules.',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Comprehensive reporting and analytics to track scheduling efficiency.',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Instant notifications and updates for schedule changes and conflicts.',
      color: 'text-red-600 bg-red-50'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with robust data protection and backup systems.',
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/schedulify.png" 
                alt="Schedulify Logo" 
                className="h-10 object-contain"
              />
            </div>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Academic
              <span className="text-blue-600"> Scheduling</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionize your institution's scheduling with AI-powered optimization, 
              real-time updates, and intelligent conflict resolution.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
                <div className="text-gray-600">Time Saved on Scheduling</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">Zero</div>
                <div className="text-gray-600">Scheduling Conflicts</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Intelligent Monitoring</div>
              </motion.div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
              >
                View Live Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage academic scheduling efficiently and effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technologies and intelligent algorithms to deliver superior performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 text-center"
            >
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Engine</h3>
              <p className="text-gray-600 text-sm">Advanced machine learning algorithms for optimal scheduling</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 text-center"
            >
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Processing</h3>
              <p className="text-gray-600 text-sm">Instant updates and conflict resolution in milliseconds</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 text-center"
            >
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600 text-sm">Bank-level encryption and secure data handling</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 text-center"
            >
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">Comprehensive insights and performance metrics</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See Schedulify in Action
            </h2>
            <p className="text-xl text-gray-600">
              Experience the power of intelligent scheduling with our interactive platform
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white font-medium">Schedulify Dashboard Preview</span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-blue-50 rounded-lg p-6"
                >
                  <Calendar className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Smart Calendar</h4>
                  <p className="text-gray-600 text-sm">Interactive timetable with drag-and-drop scheduling</p>
                  <div className="mt-4 space-y-2">
                    <div className="bg-blue-100 h-2 rounded-full w-full"></div>
                    <div className="bg-blue-100 h-2 rounded-full w-3/4"></div>
                    <div className="bg-blue-100 h-2 rounded-full w-5/6"></div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-green-50 rounded-lg p-6"
                >
                  <Users className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Role Management</h4>
                  <p className="text-gray-600 text-sm">Dedicated dashboards for admins, faculty, and students</p>
                  <div className="mt-4 flex space-x-2">
                    <div className="bg-green-200 px-2 py-1 rounded text-xs">Admin</div>
                    <div className="bg-green-200 px-2 py-1 rounded text-xs">Faculty</div>
                    <div className="bg-green-200 px-2 py-1 rounded text-xs">Student</div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-purple-50 rounded-lg p-6"
                >
                  <Brain className="h-8 w-8 text-purple-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">AI Optimization</h4>
                  <p className="text-gray-600 text-sm">Intelligent conflict resolution and resource allocation</p>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Optimization</span>
                      <span className="text-xs text-purple-600 font-semibold">98%</span>
                    </div>
                    <div className="bg-purple-200 h-2 rounded-full">
                      <div className="bg-purple-600 h-2 rounded-full w-[98%]"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <span>Try Live Demo</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Transform Your Institution Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Experience the future of academic scheduling with intelligent optimization and seamless management.
            </p>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="/schedulify.png" 
                alt="Schedulify Logo" 
                className="h-10 object-contain"
              />
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 Schedulify. All rights reserved.</p>
              <p className="text-sm mt-1">
                Empowering education through intelligent scheduling
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;