import React, { useState, useEffect } from 'react';
import { useTodo } from '../context/TodoContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { 
  X, 
  Mic, 
  MicOff, 
  Calendar, 
  Clock, 
  Flag,
  Save,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskFormData } from '../types';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSubmit: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, onSubmit }) => {
  const { addTask, updateTask } = useTodo();
  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    parseTaskFromTranscript
  } = useVoiceInput();

  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
    dueTime: task?.dueDate ? format(task.dueDate, 'HH:mm') : ''
  });
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-success-color' },
    { value: 'medium', label: 'Medium Priority', color: 'text-warning-color' },
    { value: 'high', label: 'High Priority', color: 'text-error-color' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.dueDate && formData.dueTime) {
      const selectedDate = new Date(`${formData.dueDate}T${formData.dueTime}`);
      if (selectedDate < new Date()) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dueDate = formData.dueDate && formData.dueTime 
      ? new Date(`${formData.dueDate}T${formData.dueTime}`)
      : formData.dueDate 
        ? new Date(`${formData.dueDate}T23:59`)
        : undefined;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      dueDate,
      completed: task?.completed || false
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }

    onSubmit();
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setShowVoicePanel(true);
      startListening();
    }
  };

  // Process voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      const parsed = parseTaskFromTranscript(transcript);
      
      if (parsed.title) {
        setFormData(prev => ({
          ...prev,
          title: parsed.title,
          description: parsed.description || prev.description,
          priority: parsed.priority,
          dueDate: parsed.dueDate ? format(parsed.dueDate, 'yyyy-MM-dd') : prev.dueDate,
          dueTime: parsed.dueTime || prev.dueTime
        }));
      }
      
      resetTranscript();
      setShowVoicePanel(false);
    }
  }, [transcript, isListening, parseTaskFromTranscript, resetTranscript]);

  const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');
  const getCurrentTime = () => format(new Date(), 'HH:mm');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Title *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title..."
                className={`input flex-1 ${errors.title ? 'border-error-color' : ''}`}
                autoFocus
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`btn btn-icon ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                  title="Voice input"
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
            </div>
            {errors.title && (
              <p className="text-error-color text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Voice Panel */}
          {showVoicePanel && (
            <div className="p-4 bg-surface-alt rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-error-color animate-pulse' : 'bg-muted'}`}></div>
                <span className="text-sm font-medium">
                  {isListening ? 'Listening...' : 'Voice input ready'}
                </span>
              </div>
              
              {(transcript || interimTranscript) && (
                <div className="text-sm text-muted">
                  <strong>Transcript:</strong> {transcript}
                  {interimTranscript && <em className="opacity-60">{interimTranscript}</em>}
                </div>
              )}
              
              {voiceError && (
                <div className="text-error-color text-sm mt-2">
                  <AlertCircle size={16} className="inline mr-1" />
                  {voiceError}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowVoicePanel(false)}
                  className="btn btn-sm btn-secondary"
                >
                  Close
                </button>
                {transcript && (
                  <button
                    type="button"
                    onClick={resetTranscript}
                    className="btn btn-sm btn-secondary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add a description (optional)..."
              className="textarea"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('priority', option.value)}
                  className={`btn ${
                    formData.priority === option.value 
                      ? 'btn-primary' 
                      : 'btn-secondary'
                  }`}
                >
                  <Flag size={16} className={option.color} />
                  {option.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={getTodayDate()}
                  className={`input ${errors.dueDate ? 'border-error-color' : ''}`}
                />
                <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none" />
              </div>
              {errors.dueDate && (
                <p className="text-error-color text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Due Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  className="input"
                />
                <Clock size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Date Buttons */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  handleInputChange('dueDate', getTodayDate());
                  handleInputChange('dueTime', getCurrentTime());
                }}
                className="btn btn-sm btn-secondary"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('dueDate', getTodayDate())}
                className="btn btn-sm btn-secondary"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleInputChange('dueDate', format(tomorrow, 'yyyy-MM-dd'));
                }}
                className="btn btn-sm btn-secondary"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  handleInputChange('dueDate', format(nextWeek, 'yyyy-MM-dd'));
                }}
                className="btn btn-sm btn-secondary"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} />
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;