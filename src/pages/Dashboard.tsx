import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { useQuotes } from '../hooks/useQuotes';
import { Plus, CheckCircle, Clock, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { Task } from '../types';

const Dashboard: React.FC = () => {
  const { tasks, stats, streak } = useTodo();
  const { quote, isLoading: quoteLoading, refreshQuote } = useQuotes();
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Calculate dashboard metrics
  const todayTasks = tasks.filter(task => task.dueDate && isToday(task.dueDate));
  const overdueTasks = tasks.filter(task => 
    task.dueDate && isPast(task.dueDate) && !task.completed && !isToday(task.dueDate)
  );
  const upcomingTasks = tasks.filter(task => 
    task.dueDate && isFuture(task.dueDate) && !isToday(task.dueDate)
  );
  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const todayProgress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Recent tasks (last 5 incomplete tasks with due dates)
  const recentTasks = tasks
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
    .slice(0, 5);

  const statCards = [
    {
      title: 'Today\'s Tasks',
      value: `${completedToday}/${totalToday}`,
      icon: CheckCircle,
      color: 'text-success-color',
      bgColor: 'bg-green-50',
      trend: todayProgress > 50 ? 'up' : 'down'
    },
    {
      title: 'Overdue',
      value: overdueTasks.length,
      icon: AlertCircle,
      color: 'text-error-color',
      bgColor: 'bg-red-50',
      trend: overdueTasks.length === 0 ? 'up' : 'down'
    },
    {
      title: 'Upcoming',
      value: upcomingTasks.length,
      icon: Clock,
      color: 'text-warning-color',
      bgColor: 'bg-yellow-50',
      trend: 'neutral'
    },
    {
      title: 'Current Streak',
      value: `${streak.current} days`,
      icon: Zap,
      color: 'text-primary-color',
      bgColor: 'bg-blue-50',
      trend: streak.current > 0 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!
          </h1>
          <p className="text-muted">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {/* Daily Quote */}
      {quote && (
        <div className="quote-card fade-in">
          {quoteLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="quote-text">"{quote.text}"</div>
              <div className="quote-author">— {quote.author}</div>
              <button
                onClick={refreshQuote}
                className="mt-4 text-sm opacity-75 hover:opacity-100 transition-opacity"
              >
                Get new quote
              </button>
            </>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                </div>
                {stat.trend !== 'neutral' && (
                  <div className="flex items-center mt-2">
                    <TrendingUp 
                      className={`${stat.trend === 'up' ? 'text-success-color' : 'text-error-color'} ${
                        stat.trend === 'down' ? 'rotate-180' : ''
                      }`} 
                      size={16} 
                    />
                    <span className={`text-sm ml-1 ${
                      stat.trend === 'up' ? 'text-success-color' : 'text-error-color'
                    }`}>
                      {stat.trend === 'up' ? 'Great job!' : 'Needs attention'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Progress */}
      {totalToday > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Today's Progress</h3>
            <span className="text-sm text-muted">{Math.round(todayProgress)}% completed</span>
          </div>
          <div className="card-body">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${todayProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-muted mt-2">
              <span>{completedToday} completed</span>
              <span>{totalToday - completedToday} remaining</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Today's Tasks</h3>
            <span className="text-sm text-muted">{todayTasks.length} tasks</span>
          </div>
          <div className="card-body">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p>No tasks for today</p>
                <p className="text-sm">Add a task to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map(task => (
                  <TaskItem key={task.id} task={task} compact />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Upcoming Tasks</h3>
            <span className="text-sm text-muted">{recentTasks.length} tasks</span>
          </div>
          <div className="card-body">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p>No upcoming tasks</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(task => (
                  <TaskItem key={task.id} task={task} compact showDate />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="card border-error-color border-l-4">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-error-color" size={20} />
              <h3 className="font-semibold text-error-color">Overdue Tasks</h3>
            </div>
            <span className="text-sm text-error-color">{overdueTasks.length} tasks</span>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map(task => (
                <TaskItem key={task.id} task={task} compact showDate />
              ))}
              {overdueTasks.length > 3 && (
                <p className="text-sm text-muted text-center mt-4">
                  And {overdueTasks.length - 3} more overdue tasks...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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

export default Dashboard;