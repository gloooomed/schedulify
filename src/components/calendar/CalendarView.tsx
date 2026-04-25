import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  BookOpen,
  Download,
  Filter,
  Plus
} from 'lucide-react';

const localizer = momentLocalizer(moment);

interface TimetableEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    courseId: string;
    courseName: string;
    facultyName: string;
    classroomName: string;
    sessionType: 'lecture' | 'lab' | 'tutorial';
    studentGroup: string;
    department: string;
  };
}

interface TimetableCalendarProps {
  events?: TimetableEvent[];
  onEventClick?: (event: TimetableEvent) => void;
  onSlotSelect?: (slotInfo: any) => void;
  className?: string;
}

export const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  events = [],
  onEventClick,
  onSlotSelect,
  className = ''
}) => {
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TimetableEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    faculty: '',
    sessionType: '',
    classroom: ''
  });

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.department && !event.resource.department.toLowerCase().includes(filters.department.toLowerCase())) {
        return false;
      }
      if (filters.faculty && !event.resource.facultyName.toLowerCase().includes(filters.faculty.toLowerCase())) {
        return false;
      }
      if (filters.sessionType && event.resource.sessionType !== filters.sessionType) {
        return false;
      }
      if (filters.classroom && !event.resource.classroomName.toLowerCase().includes(filters.classroom.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [events, filters]);

  // Custom event component
  const EventComponent = ({ event }: { event: TimetableEvent }) => {
    const getSessionColor = (type: string) => {
      switch (type) {
        case 'lecture': return 'bg-blue-500';
        case 'lab': return 'bg-green-500';
        case 'tutorial': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className={`${getSessionColor(event.resource.sessionType)} text-white p-1 rounded text-xs`}>
        <div className="font-semibold truncate">{event.resource.courseName}</div>
        <div className="truncate">{event.resource.facultyName}</div>
        <div className="truncate">{event.resource.classroomName}</div>
      </div>
    );
  };

  // Handle event selection
  const handleSelectEvent = (event: TimetableEvent) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  // Handle slot selection
  const handleSelectSlot = (slotInfo: any) => {
    onSlotSelect?.(slotInfo);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Timetable Calendar</h2>
              <p className="text-gray-600">Interactive schedule view with AI optimization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center ${showFilters ? 'bg-blue-100' : ''}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button className="btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  placeholder="Filter by department"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Faculty</label>
                <input
                  type="text"
                  value={filters.faculty}
                  onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
                  placeholder="Filter by faculty"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                <select
                  value={filters.sessionType}
                  onChange={(e) => setFilters({ ...filters, sessionType: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classroom</label>
                <input
                  type="text"
                  value={filters.classroom}
                  onChange={(e) => setFilters({ ...filters, classroom: e.target.value })}
                  placeholder="Filter by classroom"
                  className="input-field"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Calendar */}
      <div className="p-6">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            components={{
              event: EventComponent,
            }}
            views={['month', 'week', 'day']}
            step={60}
            showMultiDayTimes
            className="custom-calendar"
            eventPropGetter={(_event) => ({
              style: { backgroundColor: 'transparent', border: 'none' },
            })}
          />
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Class Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.courseName}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.resource.department}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.facultyName}</p>
                  <p className="text-sm text-gray-600">Instructor</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.classroomName}</p>
                  <p className="text-sm text-gray-600">Location</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-semibold">
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {moment(selectedEvent.start).format('dddd, MMMM Do')}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Session Type:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.resource.sessionType === 'lecture' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.resource.sessionType === 'lab' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedEvent.resource.sessionType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-700">Student Group:</span>
                  <span className="text-sm text-gray-600">{selectedEvent.resource.studentGroup}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button className="btn-secondary flex-1">Edit Class</button>
              <button className="btn-primary flex-1">View Details</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};