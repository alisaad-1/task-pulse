import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Heart, 
  Smile, 
  Tv
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CategoriesViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onNewTaskWithCategory: (category: string) => void;
  onStartPomodoro?: (task: Task) => void;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  matchingCategories: string[];
}

const MAIN_SECTIONS: SectionConfig[] = [
  {
    id: 'daily',
    title: 'Daily Tasks',
    icon: <Calendar size={20} />,
    color: '#38bdf8',
    matchingCategories: ['daily', 'work', 'personal', 'general', 'todo']
  },
  {
    id: 'health',
    title: 'Health & Fitness',
    icon: <Heart size={20} />,
    color: '#10b981',
    matchingCategories: ['health', 'fitness', 'wellness', 'sports']
  },
  {
    id: 'mental',
    title: 'Mental & Mind',
    icon: <Smile size={20} />,
    color: '#a855f7',
    matchingCategories: ['mental', 'mind', 'focus', 'meditation', 'learning']
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    icon: <Tv size={20} />,
    color: '#ec4899',
    matchingCategories: ['entertainment', 'leisure', 'fun', 'movies', 'gaming']
  }
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onNewTaskWithCategory,
  onStartPomodoro
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    soundFx.playPopSound();
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
      
      {/* 4 Main Category Sections */}
      {MAIN_SECTIONS.map((section) => {
        const sectionTasks = tasks.filter(t => {
          const taskCat = (t.category || '').toLowerCase();
          if (section.id === 'daily') {
            return section.matchingCategories.includes(taskCat) || 
              (!['health', 'fitness', 'mental', 'mind', 'focus', 'entertainment', 'leisure', 'fun'].includes(taskCat));
          }
          return section.matchingCategories.some(c => taskCat.includes(c));
        });

        const isCollapsed = Boolean(collapsedSections[section.id]);
        const completedCount = sectionTasks.filter(t => t.status === 'done').length;

        return (
          <div 
            key={section.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Section Accordion Header */}
            <div
              onClick={() => toggleSection(section.id)}
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none',
                background: isCollapsed ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Arrow Icon */}
                <div style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                </div>

                {/* Section Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: `${section.color}20`,
                  color: section.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {section.icon}
                </div>

                {/* Section Title */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {section.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {completedCount} of {sectionTasks.length} completed
                  </div>
                </div>
              </div>

              {/* Right side: Task count badge & Quick add button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: section.color,
                  color: '#ffffff'
                }}>
                  {sectionTasks.length}
                </span>

                <button
                  className="btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playPopSound();
                    onNewTaskWithCategory(section.id);
                  }}
                  title={`Add task to ${section.title}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-primary)',
                    borderRadius: '50%',
                    padding: '6px'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Section Tasks Content */}
            {!isCollapsed && (
              <div style={{ padding: '14px 16px' }}>
                {sectionTasks.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                      No tasks in {section.title} yet
                    </p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onNewTaskWithCategory(section.id)}
                      style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      <Plus size={14} /> Add Task
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {sectionTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={onUpdateStatus}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onToggleSubtask={onToggleSubtask}
                        onStartPomodoro={onStartPomodoro}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
};
