import React from 'react';
import { X, Clock, Users, MapPin, BookOpen, User, Calendar } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    type?: 'lecture' | 'lab' | 'seminar' | 'exam' | 'break';
    instructor?: string;
    room?: string;
    course?: string;
    students?: number;
    description?: string;
  };
}

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  if (!isOpen || !event) return null;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="h-4 w-4" />;
      case 'lab':
        return <Users className="h-4 w-4" />;
      case 'seminar':
        return <User className="h-4 w-4" />;
      case 'exam':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      lecture: 'bg-blue-100 text-blue-800',
      lab: 'bg-green-100 text-green-800',
      seminar: 'bg-amber-100 text-amber-800',
      exam: 'bg-red-100 text-red-800',
      break: 'bg-gray-100 text-gray-800',
      default: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(event.extendedProps?.type || 'default')}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.extendedProps?.type || 'default')}`}>
                  {event.extendedProps?.type || 'Event'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h2>
              <p className="text-sm text-gray-600">
                {formatDate(event.start)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Time</p>
              <p className="text-sm text-gray-600">
                {formatTime(event.start)} - {formatTime(event.end)}
              </p>
            </div>
          </div>

          {/* Instructor */}
          {event.extendedProps?.instructor && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Instructor</p>
                <p className="text-sm text-gray-600">{event.extendedProps.instructor}</p>
              </div>
            </div>
          )}

          {/* Room */}
          {event.extendedProps?.room && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Room</p>
                <p className="text-sm text-gray-600">{event.extendedProps.room}</p>
              </div>
            </div>
          )}

          {/* Course */}
          {event.extendedProps?.course && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BookOpen className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Course</p>
                <p className="text-sm text-gray-600">{event.extendedProps.course}</p>
              </div>
            </div>
          )}

          {/* Students */}
          {event.extendedProps?.students && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Students</p>
                <p className="text-sm text-gray-600">{event.extendedProps.students} enrolled</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.extendedProps?.description && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-900 mb-2">Description</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {event.extendedProps.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Could add edit functionality here
                console.log('Edit event:', event);
              }}
            >
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;