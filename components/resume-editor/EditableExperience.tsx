/**
 * Editable Experience Component
 * Feature: F-012 - Edit Adapted Resume Before Export
 *
 * Manages all experience items with edit capabilities
 */

'use client';

import { AdaptedExperienceItem, ExperienceItem } from '@/lib/types';
import EditableExperienceItem from './EditableExperienceItem';

interface EditableExperienceProps {
  experiences: AdaptedExperienceItem[];
  originalExperiences: ExperienceItem[];
  onChange: (experiences: AdaptedExperienceItem[]) => void;
  isEditMode: boolean;
}

export default function EditableExperience({
  experiences,
  originalExperiences,
  onChange,
  isEditMode,
}: EditableExperienceProps) {
  const handleBulletChange = (
    expIndex: number,
    bulletIndex: number,
    newValue: string
  ) => {
    const updated = [...experiences];
    updated[expIndex].bullets[bulletIndex] = newValue;
    onChange(updated);
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.push('New accomplishment or responsibility');
    onChange(updated);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    // Don't allow removing the last bullet
    if (updated[expIndex].bullets.length <= 1) {
      alert('Each experience must have at least one bullet point.');
      return;
    }
    updated[expIndex].bullets.splice(bulletIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, expIndex) => {
        // Find matching original experience for comparison
        const originalExp = originalExperiences.find(
          (e) => e.company === exp.company && e.title === exp.title
        );

        return (
          <EditableExperienceItem
            key={expIndex}
            experience={exp}
            originalExperience={originalExp}
            isEditMode={isEditMode}
            onBulletChange={(bulletIdx, value) =>
              handleBulletChange(expIndex, bulletIdx, value)
            }
            onAddBullet={() => handleAddBullet(expIndex)}
            onRemoveBullet={(bulletIdx) =>
              handleRemoveBullet(expIndex, bulletIdx)
            }
          />
        );
      })}
    </div>
  );
}
