import React, { useState, useMemo } from 'react';
import { useTodo } from '../context/TodoContext';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  CheckSquare,
  Square,
  AlertCircle,
  Clock
} from 'lucide-react';
import { isToday, isPast, isFuture } from 'date-fns';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { FilterType, SortType } from '../types';

const Tasks: React.FC = () => {
  const { tasks } = useTodo();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('dueDate');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: Square },
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckSquare },
    { value: 'overdue', label: 'Overdue', icon: AlertCircle }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'created', label: 'Created Date' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          task.dueDate && 
          isPast(task.dueDate) && 
          !task.completed && 
          !isToday(task.dueDate)
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Tasks without due date go to end, then sort by due date
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          // Secondary sort by due date
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, filter, sortBy]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => 
      task.dueDate && 
      isPast(task.dueDate) && 
      !task.completed && 
      !isToday(task.dueDate)
    ).length;

    return { total, completed, pending, overdue };
  }, [tasks]);

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all':
        return taskStats.total;
      case 'pending':
        return taskStats.pending;
      case 'completed':
        return taskStats.completed;
      case 'overdue':
        return taskStats.overdue;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted">
            {taskStats.total} total, {taskStats.pending} pending, {taskStats.completed} completed
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

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Filter size={16} />
          Filters
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortType)}
          className="select"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="card fade-in">
          <div className="card-body">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {filterOptions.map(option => {
                const Icon = option.icon;
                const count = getFilterCount(option.value);
                const isActive = filter === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} justify-start`}
                  >
                    <Icon size={16} />
                    <span>{option.label}</span>
                    <span className={`ml-auto px-2 py-1 rounded text-xs ${
                      isActive ? 'bg-white bg-opacity-20' : 'bg-surface-alt'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <CheckSquare size={64} className="mx-auto text-muted opacity-30 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No tasks found' : filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </h3>
              <p className="text-muted mb-6">
                {searchQuery 
                  ? 'Try adjusting your search query or filters'
                  : filter === 'all' 
                    ? 'Create your first task to get started!'
                    : `You have no ${filter} tasks at the moment.`
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  Create First Task
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedTasks.map(task => (
              <TaskItem key={task.id} task={task} showDate />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSubmit={() => setShowTaskForm(false)}
        />
      )}

      {/* Results Summary */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="text-center text-sm text-muted">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          {searchQuery && ` matching "${searchQuery}"`}
          {filter !== 'all' && ` in ${filter} category`}
        </div>
      )}
    </div>
  );
};

export default Tasks;