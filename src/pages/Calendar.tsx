import React, { useState, useMemo } from 'react';
import { useTodo } from '../context/TodoContext';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isPast
} from 'date-fns';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';

const Calendar: React.FC = () => {
  const { tasks, getTasksForDate, calculateDailyProgress } = useTodo();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get tasks for a specific date with metadata
  const getDayData = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const completedTasks = dayTasks.filter(task => task.completed);
    const overdueTasks = dayTasks.filter(task => 
      !task.completed && isPast(date) && !isToday(date)
    );
    const progress = calculateDailyProgress(date);

    return {
      tasks: dayTasks,
      completedTasks,
      overdueTasks,
      progress,
      hasEvents: dayTasks.length > 0
    };
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTask = () => {
    setShowTaskForm(true);
  };

  const selectedDateData = selectedDate ? getDayData(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted">
            View and manage your tasks by date
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-secondary"
          >
            Today
          </button>
          <button
            onClick={handleAddTask}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Calendar Header */}
            <div className="card-header flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="btn btn-secondary btn-icon"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="btn btn-secondary btn-icon"
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                  const dayData = getDayData(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelectedDate = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative p-2 min-h-[80px] rounded-lg border text-left transition-all hover:border-primary-color hover:shadow-md
                        ${isCurrentMonth ? 'bg-surface' : 'bg-surface-alt opacity-60'}
                        ${isSelectedDate ? 'border-primary-color bg-blue-50' : 'border-border'}
                        ${isTodayDate ? 'ring-2 ring-primary-color ring-opacity-30' : ''}
                      `}
                    >
                      {/* Date Number */}
                      <div className={`
                        text-sm font-medium mb-1
                        ${isTodayDate ? 'text-primary-color' : isCurrentMonth ? 'text-primary' : 'text-muted'}
                      `}>
                        {format(day, 'd')}
                      </div>

                      {/* Task Indicators */}
                      {dayData.hasEvents && (
                        <div className="space-y-1">
                          {/* Progress Bar */}
                          {dayData.tasks.length > 0 && (
                            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-success-color transition-all duration-300"
                                style={{ width: `${dayData.progress}%` }}
                              />
                            </div>
                          )}

                          {/* Task Count */}
                          <div className="flex items-center gap-1 text-xs">
                            {dayData.completedTasks.length > 0 && (
                              <span className="text-success-color">
                                {dayData.completedTasks.length}✓
                              </span>
                            )}
                            {dayData.overdueTasks.length > 0 && (
                              <span className="text-error-color">
                                {dayData.overdueTasks.length}!
                              </span>
                            )}
                            <span className="text-muted">
                              {dayData.tasks.length} task{dayData.tasks.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Task Preview (first few tasks) */}
                          <div className="space-y-1">
                            {dayData.tasks.slice(0, 2).map(task => (
                              <div
                                key={task.id}
                                className={`
                                  text-xs px-1 py-0.5 rounded truncate
                                  ${task.completed 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.priority === 'high'
                                      ? 'bg-red-100 text-red-800'
                                      : task.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-blue-100 text-blue-800'
                                  }
                                `}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayData.tasks.length > 2 && (
                              <div className="text-xs text-muted">
                                +{dayData.tasks.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Panel */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={20} />
                  <h3 className="font-semibold">
                    {format(selectedDate, 'EEEE, MMM d')}
                  </h3>
                </div>
                {isToday(selectedDate) && (
                  <span className="bg-primary-color text-white px-2 py-1 rounded text-xs">
                    Today
                  </span>
                )}
              </div>

              <div className="card-body">
                {selectedDateData && selectedDateData.tasks.length > 0 ? (
                  <div className="space-y-4">
                    {/* Day Summary */}
                    <div className="flex items-center justify-between p-3 bg-surface-alt rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-success-color" size={16} />
                        <span className="text-sm">
                          {selectedDateData.completedTasks.length} of {selectedDateData.tasks.length} completed
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {Math.round(selectedDateData.progress)}%
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${selectedDateData.progress}%` }}
                      />
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tasks</h4>
                      {selectedDateData.tasks.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          compact 
                        />
                      ))}
                    </div>

                    {/* Overdue Warning */}
                    {selectedDateData.overdueTasks.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-error-color">
                          <AlertCircle size={16} />
                          <span className="text-sm font-medium">
                            {selectedDateData.overdueTasks.length} overdue task{selectedDateData.overdueTasks.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock size={48} className="mx-auto text-muted opacity-30 mb-4" />
                    <p className="text-muted mb-4">No tasks for this day</p>
                    <button
                      onClick={handleAddTask}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <CalendarIcon size={48} className="mx-auto text-muted opacity-30 mb-4" />
                <h3 className="font-medium mb-2">Select a Date</h3>
                <p className="text-muted text-sm">
                  Click on any date to view its tasks and details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSubmit={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
};

export default Calendar;