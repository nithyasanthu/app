import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Flag,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isPast, formatDistanceToNow } from 'date-fns';
import { Task } from '../types';
import TaskForm from './TaskForm';

interface TaskItemProps {
  task: Task;
  compact?: boolean;
  showDate?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  compact = false, 
  showDate = false 
}) => {
  const { toggleTask, deleteTask } = useTodo();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleComplete = () => {
    toggleTask(task.id);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-error-color';
      case 'medium':
        return 'border-warning-color';
      case 'low':
        return 'border-success-color';
      default:
        return 'border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const colors = {
      high: 'text-error-color',
      medium: 'text-warning-color',
      low: 'text-success-color'
    };
    return <Flag size={16} className={colors[priority as keyof typeof colors]} />;
  };

  const isOverdue = task.dueDate && isPast(task.dueDate) && !task.completed && !isToday(task.dueDate);
  const isDueToday = task.dueDate && isToday(task.dueDate);

  const formatDueDate = () => {
    if (!task.dueDate) return null;

    const now = new Date();
    if (isToday(task.dueDate)) {
      return `Today at ${format(task.dueDate, 'HH:mm')}`;
    } else if (isPast(task.dueDate) && !task.completed) {
      return `Overdue by ${formatDistanceToNow(task.dueDate)}`;
    } else {
      return format(task.dueDate, 'MMM d, HH:mm');
    }
  };

  const itemClasses = `
    task-item ${task.completed ? 'completed' : ''} 
    ${task.priority}-priority
    ${compact ? 'py-2' : ''}
    ${isOverdue ? 'border-error-color bg-red-50' : ''}
    ${isDueToday && !task.completed ? 'border-warning-color bg-yellow-50' : ''}
  `;

  return (
    <>
      <div className={itemClasses}>
        {/* Checkbox */}
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            className="task-checkbox"
          />
        </label>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`task-title font-medium ${compact ? 'text-sm' : ''}`}>
                {task.title}
              </h3>
              
              {task.description && !compact && (
                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Task Metadata */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                {/* Priority */}
                <div className="flex items-center gap-1">
                  {getPriorityIcon(task.priority)}
                  <span className="capitalize">{task.priority}</span>
                </div>

                {/* Due Date */}
                {(task.dueDate || showDate) && (
                  <div className={`flex items-center gap-1 ${
                    isOverdue ? 'text-error-color' : 
                    isDueToday ? 'text-warning-color' : ''
                  }`}>
                    {isOverdue && <AlertCircle size={14} />}
                    <Clock size={14} />
                    <span>{formatDueDate()}</span>
                  </div>
                )}

                {/* Created Date (when showing date) */}
                {showDate && !task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Created {format(task.createdAt, 'MMM d')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {!compact && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="btn btn-icon btn-sm text-muted hover:text-primary-color"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-icon btn-sm text-muted hover:text-error-color"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Actions */}
        {compact && (
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setShowEditForm(true)}
              className="btn btn-icon btn-sm text-muted"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-lg max-w-md w-full">
            <div className="card-header">
              <h3 className="font-semibold text-error-color">Delete Task</h3>
            </div>
            <div className="card-body">
              <p className="text-muted">
                Are you sure you want to delete <strong>"{task.title}"</strong>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="card-footer flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          task={task}
          onClose={() => setShowEditForm(false)}
          onSubmit={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default TaskItem;