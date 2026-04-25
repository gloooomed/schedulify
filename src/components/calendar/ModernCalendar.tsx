import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Calendar, Clock, Users, MapPin, Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ModernCalendar.css';

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

interface ModernCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  className?: string;
  height?: string | number;
}

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  events = [],
  onEventClick,
  onDateSelect,
  onEventDrop,
  className = '',
  height = 'auto'
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end?.toISOString() || event.start.toISOString(),
      backgroundColor: event.backgroundColor,
      borderColor: event.borderColor,
      textColor: event.textColor,
      extendedProps: event.extendedProps
    };
    
    if (onEventClick) {
      onEventClick(calendarEvent);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    if (onEventDrop) {
      const event = dropInfo.event;
      const calendarEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end?.toISOString() || event.start.toISOString(),
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        textColor: event.textColor,
        extendedProps: event.extendedProps
      };
      onEventDrop(calendarEvent, event.start, event.end);
    }
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    toast.success('Navigated to today');
  };

  const changeView = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
    setCurrentView(view);
    toast.success(`Changed to ${view.replace('Grid', ' ').replace('time', 'Time ').replace('day', 'Day')}`);
  };

  const exportCalendar = () => {
    // Basic export functionality - can be enhanced
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `schedulify-timetable-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Calendar exported successfully');
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      lecture: '#3b82f6', // Blue
      lab: '#10b981', // Green
      seminar: '#f59e0b', // Amber
      exam: '#ef4444', // Red
      break: '#6b7280', // Gray
      default: '#8b5cf6' // Purple
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  // Transform events to include proper colors
  const formattedEvents = events.map(event => ({
    ...event,
    backgroundColor: event.backgroundColor || getEventTypeColor(event.extendedProps?.type || 'default'),
    borderColor: event.borderColor || getEventTypeColor(event.extendedProps?.type || 'default'),
    textColor: event.textColor || '#ffffff'
  }));

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Timetable Calendar</h3>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Buttons */}
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => changeView('timeGridDay')}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  currentView === 'timeGridDay' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => changeView('timeGridWeek')}
                className={`px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 ${
                  currentView === 'timeGridWeek' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('dayGridMonth')}
                className={`px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 ${
                  currentView === 'dayGridMonth' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('listWeek')}
                className={`px-3 py-2 text-xs font-medium transition-colors border-l border-gray-200 ${
                  currentView === 'listWeek' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={goToToday}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Today
            </button>
            
            <button
              onClick={exportCalendar}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {/* Event Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{events.length} events</span>
          </div>
          {events.length > 0 && (
            <>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{new Set(events.map(e => e.extendedProps?.instructor).filter(Boolean)).size} instructors</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{new Set(events.map(e => e.extendedProps?.room).filter(Boolean)).size} rooms</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar Component */}
      <div className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: ''
          }}
          events={formattedEvents}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          editable={true}
          droppable={true}
          height={height}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          slotDuration="01:00:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '18:00',
          }}
          eventDisplay="block"
          dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
          nowIndicator={true}
          eventMouseEnter={(info) => {
            info.el.style.transform = 'scale(1.02)';
            info.el.style.transition = 'transform 0.2s ease';
            info.el.style.zIndex = '1000';
          }}
          eventMouseLeave={(info) => {
            info.el.style.transform = 'scale(1)';
            info.el.style.zIndex = 'auto';
          }}
          eventContent={(arg) => {
            const { event } = arg;
            const props = event.extendedProps;
            
            return (
              <div className="p-1 text-xs">
                <div className="font-medium truncate">{event.title}</div>
                {props?.instructor && (
                  <div className="text-white/80 truncate">{props.instructor}</div>
                )}
                {props?.room && (
                  <div className="text-white/80 truncate">{props.room}</div>
                )}
              </div>
            );
          }}
          dayCellClassNames="hover:bg-gray-50 transition-colors"
          slotLabelClassNames="text-gray-600 font-medium"
          viewClassNames="modern-calendar-view"
        />
      </div>

      {/* Event Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-medium text-gray-700">Event Types:</span>
          {[
            { type: 'lecture', label: 'Lectures', color: '#3b82f6' },
            { type: 'lab', label: 'Labs', color: '#10b981' },
            { type: 'seminar', label: 'Seminars', color: '#f59e0b' },
            { type: 'exam', label: 'Exams', color: '#ef4444' },
            { type: 'break', label: 'Breaks', color: '#6b7280' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModernCalendar;