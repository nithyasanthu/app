import React, { useMemo } from 'react';
import { useTodo } from '../context/TodoContext';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  CheckCircle,
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, eachDayOfInterval, isWithinInterval } from 'date-fns';

const Stats: React.FC = () => {
  const { tasks, stats, streak } = useTodo();

  // Calculate various statistics
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now
    });
    const last30Days = eachDayOfInterval({
      start: subDays(now, 29),
      end: now
    });

    // Daily completion data for the last 7 days
    const dailyData = last7Days.map(date => {
      const dayTasks = tasks.filter(task => 
        task.dueDate && 
        format(task.dueDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      const completed = dayTasks.filter(task => task.completed).length;
      
      return {
        date: format(date, 'MMM d'),
        fullDate: date,
        total: dayTasks.length,
        completed,
        percentage: dayTasks.length > 0 ? (completed / dayTasks.length) * 100 : 0
      };
    });

    // Weekly completion data for the last 4 weeks
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(now, (i + 1) * 7);
      const weekEnd = subDays(now, i * 7);
      const weekTasks = tasks.filter(task => 
        task.dueDate && 
        isWithinInterval(task.dueDate, { start: weekStart, end: weekEnd })
      );
      const completed = weekTasks.filter(task => task.completed).length;
      
      weeklyData.push({
        week: `Week ${4 - i}`,
        total: weekTasks.length,
        completed,
        percentage: weekTasks.length > 0 ? (completed / weekTasks.length) * 100 : 0
      });
    }

    // Priority distribution
    const priorityData = [
      { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#ef4444' },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' },
      { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10b981' }
    ].filter(item => item.value > 0);

    // Completion status
    const statusData = [
      { name: 'Completed', value: tasks.filter(t => t.completed).length, color: '#10b981' },
      { name: 'Pending', value: tasks.filter(t => !t.completed).length, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    // Productivity metrics
    const completionRate = tasks.length > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
    const avgTasksPerDay = last7Days.reduce((sum, day) => {
      const dayTasks = tasks.filter(task => 
        task.createdAt && 
        format(task.createdAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length;
      return sum + dayTasks;
    }, 0) / 7;

    const tasksWithDueDate = tasks.filter(t => t.dueDate).length;
    const onTimeCompletions = tasks.filter(t => 
      t.completed && t.dueDate && t.updatedAt <= t.dueDate
    ).length;
    const onTimeRate = tasksWithDueDate > 0 ? (onTimeCompletions / tasksWithDueDate) * 100 : 0;

    return {
      dailyData,
      weeklyData,
      priorityData,
      statusData,
      completionRate,
      avgTasksPerDay,
      onTimeRate,
      totalTasks: tasks.length,
      completedTasks: stats.completedTasks
    };
  }, [tasks, stats]);

  const statCards = [
    {
      title: 'Total Tasks',
      value: analytics.totalTasks,
      icon: CheckCircle,
      color: 'text-primary-color',
      bgColor: 'bg-blue-50',
      change: '+12% this week'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(analytics.completionRate)}%`,
      icon: Target,
      color: 'text-success-color',
      bgColor: 'bg-green-50',
      change: `${analytics.completedTasks}/${analytics.totalTasks} completed`
    },
    {
      title: 'Current Streak',
      value: `${streak.current} days`,
      icon: Zap,
      color: 'text-warning-color',
      bgColor: 'bg-yellow-50',
      change: `Best: ${streak.longest} days`
    },
    {
      title: 'On-Time Rate',
      value: `${Math.round(analytics.onTimeRate)}%`,
      icon: Clock,
      color: 'text-secondary-color',
      bgColor: 'bg-purple-50',
      change: 'Tasks completed on time'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
              {entry.dataKey === 'percentage' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted">
          Track your productivity and task completion patterns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:scale-105 transition-transform">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted">{stat.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Completion Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} />
              <h3 className="font-semibold">Daily Completion (Last 7 Days)</h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  stroke="#64748b"
                />
                <YAxis fontSize={12} stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <h3 className="font-semibold">Weekly Progress</h3>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="week" 
                  fontSize={12}
                  stroke="#64748b"
                />
                <YAxis fontSize={12} stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target size={20} />
              <h3 className="font-semibold">Priority Distribution</h3>
            </div>
          </div>
          <div className="card-body">
            {analytics.priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted">
                <div className="text-center">
                  <Target size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No tasks to analyze</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Status */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <h3 className="font-semibold">Completion Status</h3>
            </div>
          </div>
          <div className="card-body">
            {analytics.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted">
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No tasks to analyze</p>
                </div>
              </div>
            )}
            
            {/* Status Legend */}
            <div className="flex justify-center gap-4 mt-4">
              {analytics.statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Streak Information */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Award size={20} />
            <h3 className="font-semibold">Streak Information</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-color mb-2">
                {streak.current}
              </div>
              <div className="text-sm text-muted">Current Streak</div>
              <div className="text-xs text-muted mt-1">
                Days with all tasks completed
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-success-color mb-2">
                {streak.longest}
              </div>
              <div className="text-sm text-muted">Longest Streak</div>
              <div className="text-xs text-muted mt-1">
                Your personal best
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-color mb-2">
                {streak.daysWithAllTasksCompleted.length}
              </div>
              <div className="text-sm text-muted">Perfect Days</div>
              <div className="text-xs text-muted mt-1">
                Total days with 100% completion
              </div>
            </div>
          </div>

          {streak.current > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-primary-color mb-2">
                <Zap size={16} />
                <span className="font-medium">Keep it up!</span>
              </div>
              <p className="text-sm text-muted">
                You're on a {streak.current}-day streak! Complete all your tasks today to continue your momentum.
              </p>
            </div>
          )}

          {streak.current === 0 && streak.longest > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-warning-color mb-2">
                <Target size={16} />
                <span className="font-medium">Start a new streak!</span>
              </div>
              <p className="text-sm text-muted">
                Your longest streak was {streak.longest} days. Complete all your tasks today to start building a new streak!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Productivity Insights</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="font-medium mb-2">Task Creation Pattern</h4>
              <p className="text-sm text-muted">
                You create an average of {analytics.avgTasksPerDay.toFixed(1)} tasks per day over the last week.
              </p>
            </div>
            
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="font-medium mb-2">Completion Efficiency</h4>
              <p className="text-sm text-muted">
                {analytics.completionRate > 80 
                  ? "Excellent! You're completing most of your tasks."
                  : analytics.completionRate > 60
                    ? "Good progress! Try to complete a few more tasks."
                    : "Consider breaking down larger tasks into smaller, manageable ones."
                }
              </p>
            </div>
            
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="font-medium mb-2">Time Management</h4>
              <p className="text-sm text-muted">
                {analytics.onTimeRate > 80
                  ? "Great! You're excellent at meeting deadlines."
                  : analytics.onTimeRate > 60
                    ? "Good timing! A few more tasks completed on time would be perfect."
                    : "Consider setting more realistic deadlines or breaking tasks into smaller chunks."
                }
              </p>
            </div>
            
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="font-medium mb-2">Streak Building</h4>
              <p className="text-sm text-muted">
                {streak.current > 7
                  ? "Amazing streak! You're building excellent habits."
                  : streak.current > 3
                    ? "Great momentum! Keep completing all your daily tasks."
                    : "Focus on completing all tasks each day to build a streak."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;