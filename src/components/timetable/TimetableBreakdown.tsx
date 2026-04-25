import React from 'react';
import { BookOpen, Users, MapPin, Calendar } from 'lucide-react';

interface TimetableBreakdownProps {
  events: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps?: {
      type?: 'lecture' | 'lab' | 'seminar' | 'exam' | 'break';
      instructor?: string;
      room?: string;
      course?: string;
      students?: number;
      description?: string;
    };
  }>;
}

export const TimetableBreakdown: React.FC<TimetableBreakdownProps> = ({ events }) => {
  // Group events by course
  const courseStats = events.reduce((acc, event) => {
    const courseName = event.title;
    if (!acc[courseName]) {
      acc[courseName] = {
        name: courseName,
        totalClasses: 0,
        labs: 0,
        lectures: 0,
        instructors: new Set(),
        rooms: new Set(),
        totalHours: 0
      };
    }
    
    acc[courseName].totalClasses++;
    if (event.extendedProps?.type === 'lab') acc[courseName].labs++;
    if (event.extendedProps?.type === 'lecture') acc[courseName].lectures++;
    if (event.extendedProps?.instructor) acc[courseName].instructors.add(event.extendedProps.instructor);
    if (event.extendedProps?.room) acc[courseName].rooms.add(event.extendedProps.room);
    
    // Calculate duration
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    acc[courseName].totalHours += duration;
    
    return acc;
  }, {} as Record<string, any>);

  const courses = Object.values(courseStats);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Course Breakdown</h3>
        <span className="text-sm text-gray-500">({events.length} total classes)</span>
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{course.name}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  {course.totalHours.toFixed(1)} hours per week
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-blue-600">{course.totalClasses}</span>
                <p className="text-xs text-gray-500">classes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-purple-600" />
                <span className="text-gray-600">
                  {course.lectures} lectures
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-600" />
                <span className="text-gray-600">
                  {course.labs} labs
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-orange-600" />
                <span className="text-gray-600">
                  {course.instructors.size} faculty
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-red-600" />
                <span className="text-gray-600">
                  {course.rooms.size} rooms
                </span>
              </div>
            </div>

            {/* Progress bar for weekly hours */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Weekly Hours</span>
                <span>{course.totalHours.toFixed(1)}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((course.totalHours / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-xs text-gray-600">Unique Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, course) => sum + course.labs, 0)}
            </div>
            <div className="text-xs text-gray-600">Lab Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, course) => sum + course.lectures, 0)}
            </div>
            <div className="text-xs text-gray-600">Lectures</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableBreakdown;