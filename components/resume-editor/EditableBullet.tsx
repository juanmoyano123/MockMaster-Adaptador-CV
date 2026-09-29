/**
 * Editable Bullet Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Inline editable bullet point for experience items
 */

'use client';

import { useState } from 'react';

interface EditableBulletProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  isEditMode: boolean;
  wasReformulated?: boolean;
}

export default function EditableBullet({
  value,
  onChange,
  onRemove,
  isEditMode,
  wasReformulated = false,
}: EditableBulletProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = () => {
    if (localValue.trim().length === 0) {
      alert('Bullet point cannot be empty. Use Remove if you want to delete it.');
      return;
    }
    if (localValue.trim() !== value) {
      onChange(localValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Currently editing
  if (isEditMode && isEditing) {
    return (
      <li className="flex items-start gap-2 my-2">
        <span className="text-gray-400 mt-2">•</span>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            autoFocus
            placeholder="Enter bullet point..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 font-medium transition-colors"
            >
              Cancel
            </button>
            <span className="text-xs text-gray-500 self-center ml-2">
              Press Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      </li>
    );
  }

  // Edit mode but not editing - show with edit/remove buttons
  if (isEditMode && !isEditing) {
    return (
      <li
        className="flex items-start gap-2 group p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <span className="text-gray-700 flex-1">
          {value}
          {wasReformulated && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Reformulated
            </span>
          )}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Remove this bullet point?')) {
                onRemove();
              }
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </li>
    );
  }

  // Read-only mode
  return (
    <li className={wasReformulated ? 'text-green-700 font-medium' : 'text-gray-700'}>
      {value}
      {wasReformulated && (
        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          Reformulated
        </span>
      )}
    </li>
  );
}
