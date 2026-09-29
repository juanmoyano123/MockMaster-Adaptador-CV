/**
 * Editable Skills Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Editable skills list with add/remove functionality
 */

'use client';

import { useState } from 'react';

interface EditableSkillsProps {
  skills: string[];
  highlightedCount: number;
  onChange: (skills: string[]) => void;
  isEditMode: boolean;
}

export default function EditableSkills({
  skills,
  highlightedCount,
  onChange,
  isEditMode,
}: EditableSkillsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) {
      alert('Skill name cannot be empty');
      return;
    }
    if (skills.includes(trimmedSkill)) {
      alert('This skill is already in your list');
      return;
    }
    onChange([...skills, trimmedSkill]);
    setNewSkill('');
    setIsAdding(false);
  };

  const handleRemoveSkill = (index: number) => {
    if (skills.length <= 1) {
      alert('You must have at least one skill on your resume');
      return;
    }
    const updated = skills.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSkill();
    }
    if (e.key === 'Escape') {
      setNewSkill('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Skills List */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => {
          const isHighlighted = idx < highlightedCount;
          return (
            <div
              key={idx}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors ${
                isEditMode
                  ? isHighlighted
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-blue-100 text-blue-700'
                  : isHighlighted
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span>{skill}</span>
              {isEditMode && (
                <button
                  onClick={() => handleRemoveSkill(idx)}
                  className={`font-bold hover:scale-110 transition-transform ${
                    isHighlighted ? 'text-white' : 'text-red-600'
                  }`}
                  title="Remove skill"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Skill Section */}
      {isEditMode && (
        <div>
          {isAdding ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Python, Project Management, AWS"
                className="flex-1 p-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewSkill('');
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add skill
            </button>
          )}
        </div>
      )}
    </div>
  );
}
