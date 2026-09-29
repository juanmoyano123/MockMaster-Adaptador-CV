/**
 * Editable Summary Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Inline editable professional summary with click-to-edit functionality
 */

'use client';

import { useState } from 'react';

interface EditableSummaryProps {
  value: string;
  onChange: (value: string) => void;
  isEditMode: boolean;
  wasModified: boolean;
}

export default function EditableSummary({
  value,
  onChange,
  isEditMode,
  wasModified,
}: EditableSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = () => {
    if (localValue.trim().length === 0) {
      alert('Summary cannot be empty');
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  // Edit mode active and editing
  if (isEditMode && isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 leading-relaxed resize-y min-h-[120px]"
          rows={5}
          autoFocus
          placeholder="Enter your professional summary..."
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <span className="text-xs text-gray-500 ml-2">
            Press Ctrl+Enter to save, Esc to cancel
          </span>
        </div>
      </div>
    );
  }

  // Edit mode but not currently editing - show clickable preview
  if (isEditMode && !isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="p-4 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-300 transition-colors group"
      >
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {value}
        </p>
        <p className="text-sm text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit summary
        </p>
      </div>
    );
  }

  // Read-only mode - normal display
  return (
    <div className="p-2">
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {value}
      </p>
    </div>
  );
}
