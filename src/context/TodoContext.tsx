import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, isToday, isSameDay, startOfDay } from 'date-fns';
import { Task, UserStats, AppSettings, StreakInfo } from '../types';

interface TodoState {
  tasks: Task[];
  stats: UserStats;
  settings: AppSettings;
  streak: StreakInfo;
  isLoading: boolean;
}

interface TodoContextType extends TodoState {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  calculateDailyProgress: (date: Date) => number;
  getTasksForDate: (date: Date) => Task[];
}

type TodoAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_STATS'; payload: UserStats }
  | { type: 'UPDATE_STREAK'; payload: StreakInfo }
  | { type: 'SET_LOADING'; payload: boolean };

const initialSettings: AppSettings = {
  notifications: {
    enabled: true,
    soundEnabled: true,
    reminderTime: 15
  },
  theme: 'system',
  language: 'en'
};

const initialStats: UserStats = {
  totalTasks: 0,
  completedTasks: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyCompletion: {},
  weeklyCompletion: {}
};

const initialStreak: StreakInfo = {
  current: 0,
  longest: 0,
  daysWithAllTasksCompleted: []
};

const initialState: TodoState = {
  tasks: [],
  stats: initialStats,
  settings: initialSettings,
  streak: initialStreak,
  isLoading: false
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        )
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    
    case 'UPDATE_STREAK':
      return { ...state, streak: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTasks = localStorage.getItem('todoApp_tasks');
        const savedSettings = localStorage.getItem('todoApp_settings');
        const savedStats = localStorage.getItem('todoApp_stats');
        const savedStreak = localStorage.getItem('todoApp_streak');

        if (savedTasks) {
          const tasks = JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }));
          dispatch({ type: 'SET_TASKS', payload: tasks });
        }

        if (savedSettings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: JSON.parse(savedSettings) });
        }

        if (savedStats) {
          dispatch({ type: 'UPDATE_STATS', payload: JSON.parse(savedStats) });
        }

        if (savedStreak) {
          const streak = JSON.parse(savedStreak);
          dispatch({ type: 'UPDATE_STREAK', payload: {
            ...streak,
            lastCompletionDate: streak.lastCompletionDate ? new Date(streak.lastCompletionDate) : undefined
          }});
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('todoApp_tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    localStorage.setItem('todoApp_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    localStorage.setItem('todoApp_stats', JSON.stringify(state.stats));
  }, [state.stats]);

  useEffect(() => {
    localStorage.setItem('todoApp_streak', JSON.stringify(state.streak));
  }, [state.streak]);

  // Calculate and update stats whenever tasks change
  useEffect(() => {
    const calculateStats = () => {
      const totalTasks = state.tasks.length;
      const completedTasks = state.tasks.filter(task => task.completed).length;
      
      // Calculate daily completion rates
      const dailyCompletion: { [date: string]: number } = {};
      const weeklyCompletion: { [week: string]: number } = {};

      state.tasks.forEach(task => {
        const dateKey = format(task.createdAt, 'yyyy-MM-dd');
        if (!dailyCompletion[dateKey]) {
          dailyCompletion[dateKey] = 0;
        }
        if (task.completed) {
          dailyCompletion[dateKey]++;
        }
      });

      const newStats: UserStats = {
        totalTasks,
        completedTasks,
        currentStreak: state.streak.current,
        longestStreak: state.streak.longest,
        dailyCompletion,
        weeklyCompletion
      };

      dispatch({ type: 'UPDATE_STATS', payload: newStats });
    };

    calculateStats();
  }, [state.tasks, state.streak]);

  // Calculate streak whenever tasks change
  useEffect(() => {
    const calculateStreak = () => {
      const today = startOfDay(new Date());
      const todayKey = format(today, 'yyyy-MM-dd');
      
      // Get all tasks for today
      const todayTasks = state.tasks.filter(task => 
        task.dueDate && isSameDay(task.dueDate, today)
      );
      
      // Check if all today's tasks are completed
      const allTodayTasksCompleted = todayTasks.length > 0 && 
        todayTasks.every(task => task.completed);
      
      let newDaysWithAllCompleted = [...state.streak.daysWithAllTasksCompleted];
      
      if (allTodayTasksCompleted && !newDaysWithAllCompleted.includes(todayKey)) {
        newDaysWithAllCompleted.push(todayKey);
      } else if (!allTodayTasksCompleted && newDaysWithAllCompleted.includes(todayKey)) {
        newDaysWithAllCompleted = newDaysWithAllCompleted.filter(day => day !== todayKey);
      }
      
      // Calculate current streak
      let currentStreak = 0;
      const sortedDays = newDaysWithAllCompleted.sort();
      
      if (sortedDays.length > 0) {
        // Check for consecutive days ending today or yesterday
        const lastDay = new Date(sortedDays[sortedDays.length - 1]);
        const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
          // Count consecutive days backwards
          for (let i = sortedDays.length - 1; i >= 0; i--) {
            const currentDay = new Date(sortedDays[i]);
            const expectedDay = new Date(today);
            expectedDay.setDate(expectedDay.getDate() - currentStreak);
            
            if (isSameDay(currentDay, expectedDay)) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
      
      const longestStreak = Math.max(state.streak.longest, currentStreak);
      
      const newStreak: StreakInfo = {
        current: currentStreak,
        longest: longestStreak,
        lastCompletionDate: allTodayTasksCompleted ? today : state.streak.lastCompletionDate,
        daysWithAllTasksCompleted: newDaysWithAllCompleted
      };
      
      dispatch({ type: 'UPDATE_STREAK', payload: newStreak });
    };

    calculateStreak();
  }, [state.tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const calculateDailyProgress = (date: Date): number => {
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length === 0) return 0;
    
    const completedTasks = tasksForDate.filter(task => task.completed).length;
    return (completedTasks / tasksForDate.length) * 100;
  };

  const getTasksForDate = (date: Date): Task[] => {
    return state.tasks.filter(task => 
      task.dueDate && isSameDay(task.dueDate, date)
    );
  };

  const value: TodoContextType = {
    ...state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateSettings,
    calculateDailyProgress,
    getTasksForDate
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}