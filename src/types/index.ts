export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyQuote {
  text: string;
  author: string;
  category?: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  dailyCompletion: { [date: string]: number };
  weeklyCompletion: { [week: string]: number };
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dueTime: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  reminderTime: number; // minutes before due time
}

export interface AppSettings {
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export type ViewMode = 'list' | 'calendar';
export type FilterType = 'all' | 'pending' | 'completed' | 'overdue';
export type SortType = 'priority' | 'dueDate' | 'created' | 'alphabetical';

export interface CalendarDay {
  date: Date;
  tasks: Task[];
  hasEvents: boolean;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastCompletionDate?: Date;
  daysWithAllTasksCompleted: string[];
}