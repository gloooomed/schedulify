import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen
} from 'lucide-react';
import { useCalendarData, type CalendarEvent } from '../../hooks/useCalendarData';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface SimpleCalendarProps {
  className?: string;
  height?: number;
  title?: string;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ 
  className = '', 
  height = 600,
  title = "Class Schedule"
}) => {
  const { events, loading, error } = useCalendarData();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const getSessionColor = (type: string) => {
      switch (type) {
        case 'lecture': return 'bg-blue-500';
        case 'lab': return 'bg-green-500';
        case 'tutorial': return 'bg-purple-500';
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className={`${getSessionColor(event.resource.session_type)} text-white p-1 rounded text-xs overflow-hidden`}>
        <div className="font-semibold truncate">{event.resource.courses?.code}</div>
        <div className="truncate text-xs opacity-90">{event.resource.classrooms?.name}</div>
      </div>
    );
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center" style={{ height: height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center" style={{ height: height }}>
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading calendar</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">Interactive class schedule</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {events.length} {events.length === 1 ? 'class' : 'classes'} scheduled
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        <div style={{ height: height }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            components={{
              event: EventComponent,
            }}
            views={['month', 'week', 'day']}
            defaultView="week"
            step={60}
            showMultiDayTimes
            className="custom-calendar"
            eventPropGetter={() => ({
              style: {
                backgroundColor: 'transparent',
                border: 'none',
              },
            })}
            dayPropGetter={(date) => {
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return {
                style: {
                  backgroundColor: isWeekend ? '#f8fafc' : 'white',
                },
              };
            }}
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
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.courses?.name}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.resource.courses?.code}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.profiles?.first_name} {selectedEvent.resource.profiles?.last_name}</p>
                  <p className="text-sm text-gray-600">Instructor</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{selectedEvent.resource.classrooms?.name}</p>
                  <p className="text-sm text-gray-600">Classroom</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Session Type:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.resource.session_type === 'lecture' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.resource.session_type === 'lab' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedEvent.resource.session_type?.toUpperCase()}
                  </span>
                </div>
                {selectedEvent.resource.student_group && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Student Group:</span>
                    <span className="text-sm text-gray-600">{selectedEvent.resource.student_group}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};