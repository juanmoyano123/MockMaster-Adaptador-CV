/**
 * Editable Experience Item Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Displays a single experience item with editable bullets
 */

'use client';

import { AdaptedExperienceItem, ExperienceItem } from '@/lib/types';
import EditableBullet from './EditableBullet';

interface EditableExperienceItemProps {
  experience: AdaptedExperienceItem;
  originalExperience?: ExperienceItem;
  isEditMode: boolean;
  onBulletChange: (bulletIndex: number, value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (bulletIndex: number) => void;
}

export default function EditableExperienceItem({
  experience,
  originalExperience,
  isEditMode,
  onBulletChange,
  onAddBullet,
  onRemoveBullet,
}: EditableExperienceItemProps) {
  return (
    <div className="relative pl-4 border-l-2 border-blue-500">
      {/* Job Title, Company, Dates - Read-only */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {experience.title}
        </h3>
        <p className="text-md text-gray-700 font-medium">
          {experience.company}
        </p>
        <p className="text-sm text-gray-500">{experience.dates}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Relevance: {experience.relevance_score}%
          </span>
        </div>
      </div>

      {/* Editable Bullets */}
      <ul className="list-inside space-y-1">
        {experience.bullets.map((bullet, idx) => {
          // Check if this bullet was reformulated by AI
          const wasReformulated =
            originalExperience &&
            idx < originalExperience.bullets.length &&
            bullet !== originalExperience.bullets[idx];

          return (
            <EditableBullet
              key={idx}
              value={bullet}
              onChange={(value) => onBulletChange(idx, value)}
              onRemove={() => onRemoveBullet(idx)}
              isEditMode={isEditMode}
              wasReformulated={wasReformulated}
            />
          );
        })}
      </ul>

      {/* Add Bullet Button */}
      {isEditMode && (
        <button
          onClick={onAddBullet}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors flex items-center gap-1"
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
          Add bullet point
        </button>
      )}
    </div>
  );
}
