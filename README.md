# Todo App - Complete Task Management Solution

A comprehensive, user-friendly To-Do List application built with React and TypeScript that helps users manage their daily tasks effectively. The app features voice input, calendar view, productivity tracking, and a streak system to encourage consistent task completion.

![Todo App](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## ✨ Features

### Core Task Management
- **Add Tasks**: Create tasks with titles, descriptions, due dates, and times
- **Voice Input**: Add tasks hands-free using voice commands with natural language processing
- **Priority Levels**: Set tasks as High, Medium, or Low priority with visual indicators
- **Task Completion**: Mark tasks as completed with visual feedback
- **Edit & Delete**: Modify or remove tasks with confirmation dialogs

### Advanced Features
- **Calendar View**: Interactive monthly calendar showing tasks by date
- **Streak System**: Track consecutive days of completing all daily tasks
- **Daily Quotes**: Motivational quotes to inspire productivity
- **Smart Notifications**: Customizable reminders with sound alerts
- **Progress Tracking**: Visual progress bars and completion statistics
- **Filtering & Sorting**: Multiple ways to organize and view tasks

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching based on system preference
- **Offline Support**: Progressive Web App (PWA) with offline functionality
- **Data Persistence**: Automatic local storage of all tasks and settings
- **Export/Import**: Backup and restore functionality for data management

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## 📱 Usage Guide

### Dashboard
- View daily progress and motivational quotes
- Quick task overview with today's tasks and upcoming deadlines
- Streak counter and productivity statistics
- Quick task creation button

### Adding Tasks
1. Click the "Add Task" button on any page
2. Fill in the task details:
   - **Title** (required): Brief description of the task
   - **Description** (optional): Additional details
   - **Priority**: High, Medium, or Low
   - **Due Date/Time**: When the task should be completed
3. Use the microphone button for voice input
4. Click "Create Task" to save

### Voice Commands
The voice input feature supports natural language commands:
- "Add task buy groceries today at 5 PM"
- "Create high priority task finish report tomorrow"
- "Remind me to call mom this afternoon"

### Calendar View
- Navigate between months using arrow buttons
- Click on any date to view tasks for that day
- Visual indicators show task count and completion progress
- Color-coded task previews by priority level

### Statistics & Analytics
- View completion rates and productivity trends
- Weekly and daily progress charts
- Priority distribution and task status breakdowns
- Streak information and achievement tracking

### Settings
- **Notifications**: Enable/disable with custom reminder times
- **Sound Alerts**: Toggle notification sounds with test functionality
- **Theme Selection**: Light, Dark, or System preference
- **Data Management**: Export/import backup files
- **Browser Support**: View compatible features

## 🎯 Key Features Explained

### Streak System
The streak system encourages consistent productivity:
- A streak increases only when ALL tasks for a day are completed
- Partial completion doesn't count toward the streak
- Visual feedback shows current and longest streak
- Motivational messages encourage continued progress

### Smart Notifications
- Browser notifications appear 15 minutes before due time (customizable)
- Sound alerts with auto-dismissal after 10 seconds
- In-app notification popups with action buttons
- Respects browser notification permissions

### Voice Input Intelligence
Voice commands are parsed to extract:
- Task titles and descriptions
- Priority levels (urgent, important, low priority)
- Time references (today, tomorrow, next week)
- Specific times (at 3 PM, this afternoon)

### Progressive Web App (PWA)
- Install as a native app on mobile devices
- Offline functionality with service worker caching
- App-like experience with splash screen and icons
- Background sync capabilities

## 🛠️ Technical Architecture

### Built With
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Date-fns** - Lightweight date manipulation
- **Recharts** - Beautiful and responsive charts
- **Lucide React** - Consistent icon library
- **CSS Variables** - Themeable design system

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.294.0",
  "recharts": "^2.8.0",
  "uuid": "^9.0.1"
}
```

### Browser Support
- **Chrome/Edge 88+** - Full feature support including voice input
- **Firefox 85+** - Full support except voice input
- **Safari 14+** - Full support with limited voice input
- **Mobile browsers** - Responsive design with touch optimization

## 📊 Performance Features

### Optimizations
- **Local Storage**: All data persists locally without server dependency
- **Lazy Loading**: Components load on demand for faster initial load
- **Memoization**: React hooks optimize re-renders
- **Service Worker**: Caches resources for offline use
- **Responsive Images**: Optimized for different screen sizes

### Accessibility
- **Keyboard Navigation**: Full app usable with keyboard only
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Dark mode and customizable themes
- **Focus Management**: Clear focus indicators throughout

## 🔧 Customization

### Adding Custom Themes
Modify CSS variables in `src/index.css`:
```css
:root {
  --primary-color: #your-color;
  --success-color: #your-color;
  /* ... other variables */
}
```

### Extending Voice Commands
Update the parsing logic in `src/hooks/useVoiceInput.ts`:
```typescript
// Add new command patterns
const timePatterns = [
  { pattern: /your-pattern/i, action: yourAction }
];
```

### Custom Notification Sounds
Replace the Web Audio API implementation in `src/hooks/useNotifications.ts` with custom audio files.

## 📝 Data Structure

### Task Object
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Settings Object
```typescript
interface AppSettings {
  notifications: {
    enabled: boolean;
    soundEnabled: boolean;
    reminderTime: number;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}
```

## 🤝 Contributing

This is a demonstration project showcasing modern React development practices. The codebase demonstrates:

- **Clean Architecture**: Separation of concerns with hooks and context
- **Type Safety**: Comprehensive TypeScript integration
- **Modern React**: Hooks, context, and functional components
- **Accessibility**: WCAG compliance and inclusive design
- **Performance**: Optimized rendering and caching strategies

## 📄 License

This project is created for demonstration purposes. Feel free to use, modify, and learn from the code.

## 🙏 Acknowledgments

- **Lucide Icons** - Beautiful, consistent icon set
- **Recharts** - Excellent charting library for React
- **Date-fns** - Lightweight date manipulation
- **Web Speech API** - Browser-native voice recognition

---

**Happy Task Managing! 🎯**

Start building productive habits with smart task management, voice input, and streak tracking. This Todo App combines modern web technologies with intuitive design to help you stay organized and motivated.