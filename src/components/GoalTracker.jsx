import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../services/calculations';

// Simple local storage for goals (could be moved to IndexedDB)
const GOALS_KEY = 'portfolio-goals';

function loadGoals() {
    try {
        const saved = localStorage.getItem(GOALS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export default function GoalTracker() {
    const [goals, setGoals] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Load goals on mount
    useEffect(() => {
        setGoals(loadGoals());
    }, []);

    // Save goals when they change
    useEffect(() => {
        if (goals.length > 0 || localStorage.getItem(GOALS_KEY)) {
            saveGoals(goals);
        }
    }, [goals]);

    const addGoal = useCallback((newGoal) => {
        const goal = {
            ...newGoal,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        setGoals(prev => [...prev, goal]);
        setShowAddForm(false);
    }, []);

    const updateGoal = useCallback((updatedGoal) => {
        setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
        setEditingGoal(null);
    }, []);

    const deleteGoal = useCallback((id) => {
        if (confirm('Delete this goal?')) {
            setGoals(prev => prev.filter(g => g.id !== id));
        }
    }, []);

    const updateCurrentAmount = useCallback((id, amount) => {
        setGoals(prev => prev.map(g =>
            g.id === id ? { ...g, currentAmount: Number(amount) } : g
        ));
    }, []);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Financial Goals
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Track progress toward your financial milestones
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Goal
                </button>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <p className="text-[var(--color-text-secondary)] mb-2">No goals yet</p>
                    <p className="text-sm text-[var(--color-text-secondary)] opacity-75">
                        Add your first financial goal to start tracking
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onEdit={() => setEditingGoal(goal)}
                            onDelete={() => deleteGoal(goal.id)}
                            onUpdateAmount={(amount) => updateCurrentAmount(goal.id, amount)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {(showAddForm || editingGoal) && (
                <GoalForm
                    goal={editingGoal}
                    onSave={editingGoal ? updateGoal : addGoal}
                    onCancel={() => {
                        setShowAddForm(false);
                        setEditingGoal(null);
                    }}
                />
            )}
        </div>
    );
}

function GoalCard({ goal, onEdit, onDelete, onUpdateAmount }) {
    const [showUpdateInput, setShowUpdateInput] = useState(false);
    const [newAmount, setNewAmount] = useState(goal.currentAmount);

    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const monthsRemaining = calculateMonthsUntil(goal.targetDate);
    const projectedAmount = goal.currentAmount + (goal.monthlyContribution * monthsRemaining);
    const willReach = projectedAmount >= goal.targetAmount;
    const additionalNeeded = willReach ? 0 : Math.ceil((goal.targetAmount - projectedAmount) / Math.max(monthsRemaining, 1));

    const handleUpdateAmount = () => {
        onUpdateAmount(newAmount);
        setShowUpdateInput(false);
    };

    const priorityColors = {
        high: 'var(--color-danger)',
        medium: 'var(--color-warning)',
        low: 'var(--color-success)'
    };

    return (
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: priorityColors[goal.priority] || priorityColors.medium }}
                    ></span>
                    <h3 className="font-semibold">{goal.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="text-sm text-[var(--color-text-secondary)] mb-3">
                Target: {formatCurrency(goal.targetAmount)} by {formatDate(goal.targetDate)}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all ${willReach ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'
                            }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Update Amount */}
            {showUpdateInput ? (
                <div className="flex gap-2 mb-3">
                    <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
                        placeholder="Current amount"
                    />
                    <button onClick={handleUpdateAmount} className="btn-primary text-sm px-3">
                        Save
                    </button>
                    <button onClick={() => setShowUpdateInput(false)} className="btn-icon text-sm px-3">
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowUpdateInput(true)}
                    className="text-sm text-[var(--color-primary)] hover:underline mb-3"
                >
                    Update progress
                </button>
            )}

            {/* Projection */}
            <div className={`p-3 rounded text-sm ${willReach ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-warning)]/10'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                    {willReach ? (
                        <span className="text-[var(--color-success)] font-semibold">✓ On Track</span>
                    ) : (
                        <span className="text-[var(--color-warning)] font-semibold">⚠ Behind</span>
                    )}
                </div>
                <p className="text-[var(--color-text-secondary)]">
                    At ${goal.monthlyContribution}/mo, you'll have{' '}
                    <strong>{formatCurrency(projectedAmount)}</strong> by target
                    {monthsRemaining > 0 && ` (${monthsRemaining} months)`}
                </p>
                {!willReach && additionalNeeded > 0 && (
                    <p className="text-[var(--color-warning)] mt-1 font-medium">
                        Need ${additionalNeeded}/mo more
                    </p>
                )}
            </div>
        </div>
    );
}

function GoalForm({ goal, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: goal?.name || '',
        targetAmount: goal?.targetAmount || '',
        currentAmount: goal?.currentAmount || 0,
        targetDate: goal?.targetDate || '',
        monthlyContribution: goal?.monthlyContribution || '',
        priority: goal?.priority || 'medium'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...goal,
            ...formData,
            targetAmount: Number(formData.targetAmount),
            currentAmount: Number(formData.currentAmount),
            monthlyContribution: Number(formData.monthlyContribution)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-md w-full animate-fadeIn">
                <h3 className="text-xl font-bold mb-4">
                    {goal ? 'Edit Goal' : 'Add New Goal'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Goal Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                            placeholder="Emergency Fund"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
                            <input
                                type="number"
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                                placeholder="20000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Current Amount ($)</label>
                            <input
                                type="number"
                                value={formData.currentAmount}
                                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                                placeholder="5000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Date</label>
                            <input
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Monthly Contribution ($)</label>
                            <input
                                type="number"
                                value={formData.monthlyContribution}
                                onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                                placeholder="500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 btn-primary">
                            {goal ? 'Update Goal' : 'Add Goal'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-[var(--color-bg-secondary)] py-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function calculateMonthsUntil(dateString) {
    const target = new Date(dateString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
}
