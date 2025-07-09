import React, { useState, useEffect } from 'react';

const HabitTracker = () => {
  const [habitName, setHabitName] = useState('Daily Exercise');
  const [completedDays, setCompletedDays] = useState(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [monthlyGoal, setMonthlyGoal] = useState(20);
  const [showGoals, setShowGoals] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [userEmail, setUserEmail] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Check notification permission on component mount and periodically
  useEffect(() => {
    const checkPermission = () => {
      if ('Notification' in window) {
        const currentPermission = Notification.permission;
        setNotificationPermission(currentPermission);
        console.log('Permission check - Current notification permission:', currentPermission);
        
        // If permission was previously granted but now denied, show helpful message
        const wasGranted = localStorage.getItem('notificationWasGranted');
        if (wasGranted === 'true' && currentPermission === 'denied') {
          console.log('⚠️ Notification permission was revoked - user may need to re-enable');
        }
        
        // Save current permission state
        if (currentPermission === 'granted') {
          localStorage.setItem('notificationWasGranted', 'true');
        }
      }
    };
    
    checkPermission();
    
    // Check permission every 5 seconds to catch changes
    const interval = setInterval(checkPermission, 5000);
    
    // Also check when the page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkPermission, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Badge definitions
  const badges = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first day', requirement: 1, icon: '🎯', type: 'total' },
    { id: 'week-warrior', name: 'Week Warrior', description: '7-day streak', requirement: 7, icon: '🔥', type: 'streak' },
    { id: 'consistency-king', name: 'Consistency King', description: '14-day streak', requirement: 14, icon: '👑', type: 'streak' },
    { id: 'unstoppable', name: 'Unstoppable', description: '21-day streak', requirement: 21, icon: '💎', type: 'streak' },
    { id: 'legend', name: 'Legend', description: '30-day streak', requirement: 30, icon: '🏆', type: 'streak' },
    { id: 'ten-club', name: 'Ten Club', description: 'Complete 10 days total', requirement: 10, icon: '⭐', type: 'total' },
    { id: 'goal-crusher', name: 'Goal Crusher', description: 'Reach weekly goal', requirement: 'weekly', icon: '💪', type: 'goal' },
    { id: 'month-master', name: 'Month Master', description: 'Reach monthly goal', requirement: 'monthly', icon: '🎊', type: 'goal' }
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Calculate streaks and goals
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
    if (day > today.getDate()) return;
    
    const newCompletedDays = new Set(completedDays);
    const wasCompleted = newCompletedDays.has(day);
    
    if (wasCompleted) {
      newCompletedDays.delete(day);
    } else {
      newCompletedDays.add(day);
      
      // Check for celebrations
      if (day === today.getDate()) {
        const newStreak = calculateCurrentStreak(newCompletedDays);
        const newTotalDays = newCompletedDays.size;
        
        // Celebrate streaks
        if (newStreak === 7) triggerCelebration('🔥 Week Warrior badge unlocked!');
        else if (newStreak === 14) triggerCelebration('👑 Consistency King badge unlocked!');
        else if (newStreak === 21) triggerCelebration('💎 Unstoppable badge unlocked!');
        else if (newStreak === 30) triggerCelebration('🏆 Legend badge unlocked!');
        else if (newTotalDays === 10) triggerCelebration('⭐ Ten Club badge unlocked!');
        else if (newTotalDays === monthlyGoal) triggerCelebration('🎊 Month Master badge unlocked!');
        else if (getCurrentWeekCompletions() + 1 === weeklyGoal) triggerCelebration('💪 Goal Crusher badge unlocked!');
        else triggerCelebration(`Great job! Day ${day} completed! 🎉`);
        
        // Send notification
        if (notificationPermission === 'granted') {
          sendNotification(
            'Habit Completed! 🎉',
            `You completed ${habitName} today! Current streak: ${newStreak} days`,
            '✅'
          );
        }
      }
    }
    
    setCompletedDays(newCompletedDays);
  };

  const calculateCurrentStreak = (days) => {
    let streak = 0;
    let checkDay = today.getDate();
    while (checkDay > 0 && days.has(checkDay)) {
      streak++;
      checkDay--;
    }
    return streak;
  };

  const getIntensity = (day) => {
    if (!day || day > today.getDate()) return 'bg-gray-100';
    return completedDays.has(day) ? 'bg-green-500' : 'bg-gray-200';
  };

  const getHoverIntensity = (day) => {
    if (!day || day > today.getDate()) return '';
    return completedDays.has(day) ? 'hover:bg-green-600' : 'hover:bg-gray-300';
  };

  // Notification and reminder functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission response:', permission);
        
        setNotificationPermission(permission);
        
        // Force multiple re-checks to catch the permission change
        setTimeout(() => {
          const newPermission = Notification.permission;
          console.log('Permission after 100ms:', newPermission);
          setNotificationPermission(newPermission);
        }, 100);
        
        setTimeout(() => {
          const newPermission = Notification.permission;
          console.log('Permission after 500ms:', newPermission);
          setNotificationPermission(newPermission);
        }, 500);
        
        setTimeout(() => {
          const newPermission = Notification.permission;
          console.log('Permission after 1000ms:', newPermission);
          setNotificationPermission(newPermission);
        }, 1000);
        
        // Test notification immediately if granted
        if (permission === 'granted') {
          setTimeout(() => {
            console.log('Auto-testing notification after permission granted...');
            sendNotification('Permission Granted! 🎉', 'Notifications are now working! You can now set up your daily reminders.');
          }, 1200);
        }
        
        return permission === 'granted';
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return false;
  };

  const sendNotification = (title, body, icon = '🎯') => {
    console.log('Attempting to send notification...');
    console.log('Title:', title);
    console.log('Body:', body);
    
    // Always check current permission
    const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
    console.log('Current permission:', currentPermission);
    console.log('Notification support:', 'Notification' in window);
    
    if (currentPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          requireInteraction: true,
          silent: false,
          tag: 'habit-reminder-' + Date.now(),
          renotify: true
        });
        
        console.log('Notification object created');
        
        // Set up event handlers
        let notificationWorked = false;
        let userInteracted = false;
        
        notification.onshow = () => {
          console.log('⚠️ onshow event fired (but this can be unreliable on Mac)');
          // Don't trust onshow on Mac - it often lies
        };
        
        notification.onclick = () => {
          console.log('✅ Notification was actually clicked - it definitely showed!');
          userInteracted = true;
          notificationWorked = true;
          window.focus();
          notification.close();
        };
        
        notification.onclose = () => {
          console.log('Notification closed');
        };
        
        notification.onerror = (error) => {
          console.error('❌ Notification error event:', error);
          alert(`🔔 ${title}\n\n${body}\n\n(Notification error - using popup fallback)`);
        };
        
        // Mac Chrome often lies about notifications working, so always show fallback after delay
        setTimeout(() => {
          if (!userInteracted) {
            console.log('⚠️ No user interaction with notification detected - likely silently blocked');
            console.log('Using reliable alert fallback...');
            try {
              notification.close();
            } catch (e) {
              console.log('Could not close notification:', e);
            }
            alert(`🔔 ${title}\n\n${body}\n\n(Browser notifications seem to be silently blocked by macOS/Chrome - using reliable popup instead)`);
          }
        }, 2000); // Give 2 seconds for user to potentially click
        
        console.log('Notification setup complete, waiting to see if user interacts...');
        return;
        
      } catch (error) {
        console.error('❌ Failed to create notification:', error);
        alert(`🔔 ${title}\n\n${body}\n\n(Notification creation failed - using popup fallback)`);
        return;
      }
    } else {
      console.log('❌ Permission not granted:', currentPermission);
    }
    
    // Immediate fallback for permission issues
    alert(`🔔 ${title}\n\n${body}\n\n(Notifications not permitted - using popup fallback)`);
  };

  const scheduleReminder = () => {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':');
    const reminderDate = new Date();
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    const timeUntilReminder = reminderDate.getTime() - now.getTime();
    const minutesUntilReminder = Math.round(timeUntilReminder / 1000 / 60);
    
    console.log(`Current time: ${now.toLocaleString()}`);
    console.log(`Reminder scheduled for: ${reminderDate.toLocaleString()}`);
    console.log(`Time until reminder: ${minutesUntilReminder} minutes`);
    console.log(`Milliseconds until reminder: ${timeUntilReminder}`);
    
    // Clear any existing reminder
    if (window.habitReminderTimeout) {
      clearTimeout(window.habitReminderTimeout);
      console.log('Cleared existing reminder');
    }
    
    // Set the new reminder
    window.habitReminderTimeout = setTimeout(() => {
      console.log('🔔 Reminder time reached!');
      console.log(`Current time: ${new Date().toLocaleString()}`);
      
      // Check if habit was completed today
      const todayDate = new Date().getDate();
      const isCompleted = completedDays.has(todayDate);
      
      console.log(`Today's date: ${todayDate}`);
      console.log(`Habit completed today: ${isCompleted}`);
      
      if (!isCompleted) {
        const title = `${habitName} Reminder! ⏰`;
        const body = `Don't forget your daily ${habitName.toLowerCase()}. Keep your ${currentStreak}-day streak alive!`;
        
        console.log('Sending reminder notification...');
        sendNotification(title, body);
      } else {
        console.log('✅ Habit already completed today - no reminder needed');
        // Optional: send congratulations instead
        const title = `Great job! 🎉`;
        const body = `You already completed your ${habitName.toLowerCase()} today. Keep it up!`;
        sendNotification(title, body);
      }
      
      // Auto-schedule for tomorrow
      console.log('Auto-scheduling reminder for tomorrow...');
      setTimeout(() => {
        scheduleReminder();
      }, 1000);
      
    }, timeUntilReminder);
    
    // Show confirmation with more details
    const confirmationMessage = `Daily reminder set! 🔔

⏰ Reminder time: ${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}
📅 Date: ${reminderDate.toLocaleDateString()}
⏳ Time until reminder: ${minutesUntilReminder} minutes

Keep this browser tab open for reminders to work.
Check the console for debug info.`;
    
    alert(confirmationMessage);
  };

  const triggerCelebration = (message) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const generateGmailReminder = () => {
    const subject = encodeURIComponent(`${habitName} Daily Reminder`);
    const body = encodeURIComponent(`Hi there! 👋

This is your daily reminder to complete: ${habitName}

📊 Your Current Stats:
• Current streak: ${currentStreak} days
• Goal this week: ${getCurrentWeekCompletions()}/${weeklyGoal} days  
• Goal this month: ${completedDays.size}/${monthlyGoal} days
• Overall completion rate: ${Math.round((completedDays.size / today.getDate()) * 100)}%

Keep up the great work! 💪

Track your progress: ${window.location.href}

Best,
Your Habit Tracker 🎯`);
    
    // If user provided email, use it as recipient
    const recipient = userEmail ? encodeURIComponent(userEmail) : '';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  // Smart email detection attempt
  const tryDetectEmail = () => {
    // Try to get email from Google account (if signed in)
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance && authInstance.isSignedIn.get()) {
        const profile = authInstance.currentUser.get().getBasicProfile();
        const email = profile.getEmail();
        if (email) {
          setUserEmail(email);
          return true;
        }
      }
    }
    
    // Try localStorage for previously saved email
    const savedEmail = localStorage.getItem('habitTrackerEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      return true;
    }
    
    return false;
  };

  const saveEmailPreference = (email) => {
    setUserEmail(email);
    if (email) {
      localStorage.setItem('habitTrackerEmail', email);
    } else {
      localStorage.removeItem('habitTrackerEmail');
    }
  };

  const generateGoogleCalendarReminder = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(parseInt(reminderTime.split(':')[0]), parseInt(reminderTime.split(':')[1]), 0, 0);
    
    const startTime = tomorrow.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = new Date(tomorrow.getTime() + 30 * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const title = encodeURIComponent(`${habitName} Daily Reminder`);
    const details = encodeURIComponent(`Time for your daily ${habitName}! 

Current streak: ${currentStreak} days
Don't break the chain! 🔥

Track progress: ${window.location.href}`);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&recur=RRULE:FREQ=DAILY`;
    
    window.open(googleCalendarUrl, '_blank');
  };
  const getDayOfWeekStats = () => {
    const dayStats = Array(7).fill(null).map((_, i) => ({
      day: dayNames[i],
      completed: 0,
      total: 0,
      rate: 0
    }));

    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      dayStats[dayOfWeek].total++;
      if (completedDays.has(day)) {
        dayStats[dayOfWeek].completed++;
      }
    }

    dayStats.forEach(stat => {
      stat.rate = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    });

    return dayStats;
  };

  // Get weekly patterns
  const getWeeklyPatterns = () => {
    const dayStats = getDayOfWeekStats();
    const bestDay = dayStats.reduce((best, current) => 
      current.rate > best.rate ? current : best
    );
    const worstDay = dayStats.reduce((worst, current) => 
      current.total > 0 && current.rate < worst.rate ? current : worst
    );
    
    return { bestDay, worstDay, dayStats };
  };

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const weeks = [];
    let currentWeek = [];
    
    // Group days into weeks
    for (let day = 1; day <= today.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentWeek.push({
        day,
        completed: completedDays.has(day),
        dayOfWeek
      });
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    // Calculate week performance
    const weekPerformance = weeks.map((week, index) => {
      const completed = week.filter(d => d.completed).length;
      const total = week.length;
      return {
        week: index + 1,
        completed,
        total,
        rate: Math.round((completed / total) * 100)
      };
    });
    
    return weekPerformance;
  };
  const isBadgeUnlocked = (badge) => {
    switch (badge.type) {
      case 'streak':
        return longestStreak >= badge.requirement;
      case 'total':
        return completedDays.size >= badge.requirement;
      case 'goal':
        if (badge.requirement === 'weekly') {
          const currentWeekDays = getCurrentWeekCompletions();
          return currentWeekDays >= weeklyGoal;
        }
        if (badge.requirement === 'monthly') {
          return completedDays.size >= monthlyGoal;
        }
        return false;
      default:
        return false;
    }
  };

  const getCurrentWeekCompletions = () => {
    const todayDate = today.getDate();
    const todayDayOfWeek = today.getDay();
    const weekStart = Math.max(1, todayDate - todayDayOfWeek);
    const weekEnd = Math.min(daysInMonth, weekStart + 6);
    
    let weekCompletions = 0;
    for (let day = weekStart; day <= weekEnd; day++) {
      if (completedDays.has(day)) weekCompletions++;
    }
    return weekCompletions;
  };

  const completionRate = Math.round((completedDays.size / today.getDate()) * 100) || 0;
  const weeklyProgress = Math.min(100, Math.round((getCurrentWeekCompletions() / weeklyGoal) * 100));
  const monthlyProgress = Math.min(100, Math.round((completedDays.size / monthlyGoal) * 100));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const unlockedBadges = badges.filter(badge => isBadgeUnlocked(badge));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
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
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
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

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowGoals(!showGoals)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {showGoals ? 'Hide Goals' : 'Set Goals'}
          </button>
          <button
            onClick={() => setShowBadges(!showBadges)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            {showBadges ? 'Hide Badges' : `View Badges (${unlockedBadges.length}/${badges.length})`}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
          >
            {showStats ? 'Hide Stats' : 'Advanced Stats'}
          </button>
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            {showReminders ? 'Hide Reminders' : 'Set Reminders'}
          </button>
        </div>

        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white p-8 rounded-xl shadow-2xl transform animate-bounce">
              <div className="text-2xl text-center font-bold text-gray-800">
                {celebrationMessage}
              </div>
            </div>
          </div>
        )}

        {/* Reminders Section */}
        {showReminders && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminders & Notifications</h3>
            
            <div className="space-y-4">
              {/* Browser Notifications */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">🔔 Browser Notifications</h4>
                
                {(() => {
                  const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
                  const wasGranted = localStorage.getItem('notificationWasGranted') === 'true';
                  
                  return (
                    <div className="space-y-3">
                      {/* Permission status and help */}
                      {currentPermission === 'denied' && wasGranted && (
                        <div className="p-3 bg-yellow-100 border border-yellow-400 rounded text-sm">
                          <div className="font-semibold text-yellow-800">⚠️ Notifications were reset</div>
                          <div className="text-yellow-700 mt-1">
                            Chrome seems to have reset your notification permission. 
                            Click the lock icon in your address bar → Notifications → Allow, 
                            or use the "Reset permission" button in Chrome settings.
                          </div>
                        </div>
                      )}
                      
                      {currentPermission === 'denied' && !wasGranted && (
                        <div className="p-3 bg-blue-100 border border-blue-400 rounded text-sm">
                          <div className="font-semibold text-blue-800">💡 Enable notifications for the best experience</div>
                          <div className="text-blue-700 mt-1">
                            Get automatic reminders right to your desktop! Click "Enable Notifications" below.
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600">Daily reminder time:</label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {currentPermission !== 'granted' ? (
                          <div className="space-y-2">
                            <button
                              onClick={requestNotificationPermission}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Enable Notifications
                            </button>
                            <div className="text-xs text-gray-500">
                              If this doesn't work, manually enable in Chrome settings (lock icon → Notifications → Allow)
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={scheduleReminder}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                              Schedule Daily Reminder
                            </button>
                            <button
                              onClick={() => sendNotification('Test Notification! 🎯', 'This is how your habit reminders will look! If you see this, notifications are working perfectly.')}
                              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                            >
                              Test Notification
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Status: {(() => {
                          const currentPermission = 'Notification' in window ? Notification.permission : 'denied';
                          return currentPermission === 'granted' ? '✅ Enabled' : 
                                 currentPermission === 'denied' ? '❌ Blocked' : 
                                 '⏳ Not set up';
                        })()} 
                        {currentPermission === 'denied' && wasGranted && ' (was previously granted - may need reset)'}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Email Reminders */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">📧 Email Reminders</h4>
                
                {/* Email input */}
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Your email (optional - for pre-filled reminders):</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => saveEmailPreference(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={tryDetectEmail}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                    >
                      Auto-detect
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    We'll remember this and pre-fill the "To" field in Gmail
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={generateGmailReminder}
                    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm mr-2"
                  >
                    📧 Create Gmail Reminder
                  </button>
                  <button
                    onClick={generateGoogleCalendarReminder}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                  >
                    📅 Add to Google Calendar
                  </button>
                  <div className="text-xs text-gray-500 mt-2">
                    Gmail opens with a pre-written reminder email{userEmail ? ` to ${userEmail}` : ''}. Google Calendar creates a daily recurring reminder event.
                  </div>
                </div>
              </div>

              {/* Smart Alerts */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">⚡ Smart Alerts</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Automatic celebrations when you unlock badges 🎉</div>
                  <div>• Streak warnings to keep you motivated 🔥</div>
                  <div>• Goal progress notifications 🎯</div>
                  <div>• Daily completion confirmations ✅</div>
                </div>
                {!completedDays.has(today.getDate()) && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm">
                    💡 <strong>Reminder:</strong> You haven't completed your habit today! Don't break your {currentStreak}-day streak.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Statistics Section */}
        {showStats && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Statistics</h3>
            
            {/* Day of Week Performance */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Success Rate by Day of Week</h4>
              <div className="grid grid-cols-7 gap-2">
                {getDayOfWeekStats().map((stat, index) => (
                  <div key={stat.day} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">{stat.day}</div>
                    <div className="h-20 bg-gray-200 rounded relative overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-green-500 transition-all duration-500 rounded"
                        style={{ height: `${stat.rate}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">{stat.rate}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.completed}/{stat.total}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Performance Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const { bestDay, worstDay } = getWeeklyPatterns();
                  const weeklyTrends = getMonthlyTrends();
                  const avgWeeklyRate = weeklyTrends.length > 0 
                    ? Math.round(weeklyTrends.reduce((sum, week) => sum + week.rate, 0) / weeklyTrends.length)
                    : 0;
                  
                  return (
                    <>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-green-800">Best Day</div>
                        <div className="text-lg font-bold text-green-900">{bestDay.day}</div>
                        <div className="text-sm text-green-700">{bestDay.rate}% success rate</div>
                        <div className="text-xs text-green-600">{bestDay.completed}/{bestDay.total} completed</div>
                      </div>
                      
                      <div className="bg-red-100 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-red-800">Challenging Day</div>
                        <div className="text-lg font-bold text-red-900">{worstDay.day}</div>
                        <div className="text-sm text-red-700">{worstDay.rate}% success rate</div>
                        <div className="text-xs text-red-600">{worstDay.completed}/{worstDay.total} completed</div>
                      </div>
                      
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-blue-800">Weekly Average</div>
                        <div className="text-lg font-bold text-blue-900">{avgWeeklyRate}%</div>
                        <div className="text-sm text-blue-700">Consistency score</div>
                        <div className="text-xs text-blue-600">{weeklyTrends.length} weeks tracked</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Weekly Trends */}
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Weekly Performance Trends</h4>
              <div className="space-y-2">
                {getMonthlyTrends().map((week, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600 w-16">Week {week.week}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 rounded-full"
                        style={{ width: `${week.rate}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">{week.rate}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 w-20">{week.completed}/{week.total} days</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-gray-800">{completedDays.size}</div>
                <div className="text-xs text-gray-600">Total Days</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-gray-800">{today.getDate() - completedDays.size}</div>
                <div className="text-xs text-gray-600">Missed Days</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-gray-800">{longestStreak}</div>
                <div className="text-xs text-gray-600">Best Streak</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-lg font-bold text-gray-800">{currentStreak}</div>
                <div className="text-xs text-gray-600">Current Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Goals Section */}
        {showGoals && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Goal (days per week)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>This week: {getCurrentWeekCompletions()}/{weeklyGoal}</span>
                    <span>{weeklyProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${weeklyProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Goal (days this month)
                </label>
                <input
                  type="number"
                  min="1"
                  max={daysInMonth}
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>This month: {completedDays.size}/{monthlyGoal}</span>
                    <span>{monthlyProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${monthlyProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badges Section */}
        {showBadges && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Achievement Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const isUnlocked = isBadgeUnlocked(badge);
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-lg text-center transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md' 
                        : 'bg-gray-100 border-2 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className={`text-2xl mb-1 ${isUnlocked ? 'animate-pulse' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <div className={`font-semibold text-xs ${isUnlocked ? 'text-yellow-800' : 'text-gray-500'}`}>
                      {badge.name}
                    </div>
                    <div className={`text-xs ${isUnlocked ? 'text-yellow-700' : 'text-gray-400'}`}>
                      {badge.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
                ${day === today.getDate() && !completedDays.has(day) ? 'ring-2 ring-orange-400 animate-pulse' : ''}
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
