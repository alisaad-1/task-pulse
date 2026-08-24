import React, { useState, useEffect, useMemo } from 'react';
import { Task, ViewMode, ThemeMode, TaskStatus, WorkItem } from './types/task';
import { loadStoredTasks, saveStoredTasks, exportTasksJSON, importTasksJSON, DEFAULT_CATEGORIES } from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TaskModal } from './components/TaskModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { InventoryView } from './components/InventoryView';
import { WorkView } from './components/WorkView';
import { WorkAddModal } from './components/WorkAddModal';
import { CategoriesView } from './components/CategoriesView';
import { SplashScreen } from './components/SplashScreen';

const WORK_STORAGE_KEY = 'taskpulse_work_items';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [currentView, setCurrentView] = useState<ViewMode>('categories');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accentHue, setAccentHue] = useState<number>(250);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Work state
  const [workItems, setWorkItems] = useState<WorkItem[]>(() => {
    try {
      const stored = localStorage.getItem(WORK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isWorkModalOpen, setIsWorkModalOpen] = useState<boolean>(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultCategoryForNew, setDefaultCategoryForNew] = useState<string>('daily');

  // Pomodoro Active Task
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);

  // Sync tasks to LocalStorage
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Sync work items to LocalStorage
  useEffect(() => {
    localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(workItems));
  }, [workItems]);

  // Apply theme attributes and HSL accent color to <html> element & status bar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-h', String(accentHue));

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'light' ? '#f1f5f9' : '#0b0f19');
    }
  }, [theme, accentHue]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K search focus, Cmd+N new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenNewModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search filter
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCat = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();

      // Priority filter
      const matchesPriority = selectedPriority === 'all' || t.priority.toLowerCase() === selectedPriority.toLowerCase();

      return matchesSearch && matchesCat && matchesPriority;
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority]);

  // Category List
  const categoryNames = useMemo(() => {
    const customCats = tasks.map(t => t.category).filter(Boolean);
    const set = new Set(['daily', 'health', 'finance', 'entertainment', ...DEFAULT_CATEGORIES.map(c => c.name.toLowerCase().split(' ')[0]), ...customCats]);
    return Array.from(set);
  }, [tasks]);

  // Handlers
  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const handleOpenNewModal = (initialStatus?: TaskStatus, initialDate?: string, initialCategory?: string) => {
    setEditingTask(null);
    if (initialCategory) {
      setDefaultCategoryForNew(initialCategory);
    }
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData, updatedAt: new Date().toISOString() } as Task : t));
    } else {
      // Create
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        category: taskData.category || defaultCategoryForNew || 'daily',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: taskData.subtasks || [],
        estimatedMinutes: taskData.estimatedMinutes || 30,
        timeSpentMinutes: 0,
        tags: taskData.tags || []
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const handleAddWorkItem = (value: number, category: string) => {
    const newItem: WorkItem = {
      id: `work-${Date.now()}`,
      value,
      category,
      createdAt: new Date().toISOString()
    };
    setWorkItems(prev => [newItem, ...prev]);
  };

  const handleDeleteWorkItem = (id: string) => {
    setWorkItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStartPomodoro = (task: Task) => {
    setPomodoroTask(task);
    setCurrentView('pomodoro');
  };

  const handleExportData = () => {
    exportTasksJSON(tasks);
  };

  const handleImportData = async (file: File) => {
    try {
      const imported = await importTasksJSON(file);
      setTasks(imported);
      alert('Successfully imported tasks!');
    } catch (err) {
      alert('Failed to import JSON file. Please verify file format.');
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="app-container">
      
      {/* Splash Screen - shows on app launch then fades out */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        categories={categoryNames}
        totalTasks={tasks.length}
        completedTasks={completedCount}
      />

      {/* Main Workspace Area */}
      <div className="main-content">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewTaskModal={() => handleOpenNewModal()}
          theme={theme}
          onThemeChange={setTheme}
          accentHue={accentHue}
          onAccentChange={setAccentHue}
          totalTasks={tasks.length}
          completedTasks={completedCount}
          onExport={handleExportData}
          onImport={handleImportData}
        />

        {/* Dynamic View Body */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {currentView === 'categories' && (
            <CategoriesView 
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onNewTaskWithCategory={(cat) => handleOpenNewModal(undefined, undefined, cat)}
              onStartPomodoro={handleStartPomodoro}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanBoard 
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onNewTaskWithStatus={(status) => handleOpenNewModal(status)}
              onStartPomodoro={handleStartPomodoro}
            />
          )}

          {currentView === 'list' && (
            <ListView 
              tasks={filteredTasks}
              onUpdateStatus={handleUpdateStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStartPomodoro={handleStartPomodoro}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView 
              tasks={filteredTasks}
              onSelectTask={handleEditTask}
              onNewTaskDate={(dateStr) => handleOpenNewModal('todo', dateStr)}
            />
          )}

          {currentView === 'work' && (
            <WorkView 
              workItems={workItems}
              onOpenAddModal={() => setIsWorkModalOpen(true)}
              onDeleteWorkItem={handleDeleteWorkItem}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView tasks={tasks} />
          )}

          {currentView === 'pomodoro' && (
            <PomodoroTimer 
              tasks={tasks}
              activeTask={pomodoroTask}
              onTaskSelect={setPomodoroTask}
              onSessionComplete={(taskId, mins) => {
                if (taskId && mins) {
                  setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeSpentMinutes: (t.timeSpentMinutes || 0) + mins } : t));
                }
              }}
            />
          )}

          {currentView === 'inventory' && (
            <InventoryView 
              isOpenModal={isInventoryModalOpen}
              onCloseModal={() => setIsInventoryModalOpen(false)}
            />
          )}
        </main>
      </div>

      {/* New/Edit Task Modal */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categoryNames}
      />

      {/* Work Add Modal */}
      <WorkAddModal 
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        onAdd={handleAddWorkItem}
        categories={categoryNames}
      />

      {/* Mobile Bottom Navigation Bar & FAB */}
      <MobileBottomNav 
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewTask={() => handleOpenNewModal()}
        onOpenWorkModal={() => setIsWorkModalOpen(true)}
        onOpenInventoryModal={() => setIsInventoryModalOpen(true)}
      />

    </div>
  );
};
