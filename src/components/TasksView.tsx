import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskPriority } from '../types';

export const TasksView: React.FC = () => {
  const { state, addTask, toggleTask, deleteTask } = useApp();

  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      contactName: contactName || undefined,
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority,
    });

    setTitle('');
    setContactName('');
    setDueDate('');
    setIsAdding(false);
  };

  const filteredTasks = state.tasks.filter((t) => {
    if (filter === 'open') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const openCount = state.tasks.filter((t) => !t.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Client Follow-Ups & Tasks
          </h2>
          <p className="text-sm text-slate-500">
            Keep track of client check-ins, proposal deadlines, contract reviews, and financial reviews.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-sm transition active:scale-[0.98] cursor-pointer flex items-center gap-2"
          id="tasks-add-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-Up</span>
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900">Add New Follow-Up Action</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Action Description
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Call Amara to confirm invoice settlement date"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Linked Client (Optional)
              </label>
              <select
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select client...</option>
                {state.contacts.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 cursor-pointer"
            >
              Save Follow-up
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('open')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === 'open' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          All ({state.tasks.length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            filter === 'done' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition ${
              task.done ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                  task.done
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-blue-500'
                }`}
              >
                {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div>
                <h4
                  className={`text-sm font-bold text-slate-900 ${
                    task.done ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  {task.contactName && (
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Building className="w-3 h-3 text-slate-400" />
                      {task.contactName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  task.priority === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : task.priority === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {task.priority}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tasks found. Keep up the great work!
          </div>
        )}
      </div>
    </div>
  );
};
