import React, { useState, useEffect } from 'react';

const HabitTracker = () => {
  const [habitName, setHabitName] = useState('Daily Exercise');
  const [completedDays, setCompletedDays] = useState(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Calculate streaks
  useEffect(() => {
    const calculateStreaks = () => {
      const sortedDays = Array.from(completedDays).sort((a, b) => a - b);
      
      let current = 0;
      let longest = 0;
      let tempStreak = 0;
      
      // Check for current streak (from today backwards)
      let checkDay = today.getDate();
      while (checkDay > 0 && completedDays.has(checkDay)) {
        current++;
        checkDay--;
      }
      
      // Calculate longest streak
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0 || sortedDays[i] === sortedDays[i - 1] + 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        longest = Math.max(longest, tempStreak);
      }
      
      setCurrentStreak(current);
      setLongestStreak(longest);
    };
    
    calculateStreaks();
  }, [completedDays]);

  const toggleDay = (day) => {
    if (day > today.getDate()) return; // Can't mark future days
    
    const newCompletedDays = new Set(completedDays);
    if (newCompletedDays.has(day)) {
      newCompletedDays.delete(day);
    } else {
      newCompletedDays.add(day);
    }
    setCompletedDays(newCompletedDays);
  };

  const getIntensity = (day) => {
    if (!day || day > today.getDate()) return 'bg-gray-100';
    return completedDays.has(day) ? 'bg-green-500' : 'bg-gray-200';
  };

  const getHoverIntensity = (day) => {
    if (!day || day > today.getDate()) return '';
    return completedDays.has(day) ? 'hover:bg-green-600' : 'hover:bg-gray-300';
  };

  const completionRate = Math.round((completedDays.size / today.getDate()) * 100) || 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Habit Tracker</h1>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            className="text-lg font-semibold text-gray-700 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-1"
            placeholder="Enter habit name"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold">Current Streak:</span>
            <span className="text-green-600 font-bold">{currentStreak} days</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Longest Streak:</span>
            <span className="text-blue-600 font-bold">{longestStreak} days</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Completion Rate:</span>
            <span className="text-purple-600 font-bold">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center py-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => day && toggleDay(day)}
              className={`
                w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium
                transition-colors duration-200 cursor-pointer
                ${day ? getIntensity(day) : 'bg-transparent'}
                ${day && day <= today.getDate() ? getHoverIntensity(day) : ''}
                ${day && day > today.getDate() ? 'cursor-not-allowed opacity-50' : ''}
                ${completedDays.has(day) ? 'text-white' : 'text-gray-600'}
              `}
              title={day ? `${monthNames[currentMonth]} ${day}${completedDays.has(day) ? ' - Completed' : ' - Click to mark as completed'}` : ''}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Click on a day to mark it as completed</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
        <div className="text-center">
          You've completed your habit {completedDays.size} out of {today.getDate()} days this month
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
