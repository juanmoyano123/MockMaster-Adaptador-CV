# ARCHITECTURE: F-012 - Edit Adapted Resume Before Export

## 1. USER FLOW

### Primary Flow: Edit Adapted Resume
```
1. User navigates to /adapt-resume page
2. User sees adapted resume preview (AdaptedResumePreview component)
3. User clicks "Edit Resume" toggle button
4. Component enters Edit Mode:
   - Summary section becomes contentEditable
   - Each experience bullet becomes editable on click
   - Skills become editable (add/remove chips)
   - Contact info remains read-only (from original resume)
   - Education remains read-only (not typically adapted)
5. User makes edits (inline editing):
   - Click on summary text → textarea appears
   - Click on bullet point → input field appears
   - Click "Add Bullet" → new bullet added
   - Click "Remove" on bullet → bullet deleted
   - Click "Add Skill" → new skill chip added
   - Click X on skill chip → skill removed
6. Changes auto-save to localStorage on blur/change (debounced 500ms)
7. Visual feedback: "Saving..." → "Saved ✓" indicator
8. User can toggle back to "Preview Mode" to see final result
9. User can click "Reset to AI Version" → confirmation dialog → restore original
10. User clicks "Download PDF" → PDF contains edited version
```

### Edge Cases Flow
```
- User navigates away while editing → auto-save prevents loss
- User refreshes page → edits persist from localStorage
- User edits then resets → confirmation dialog prevents accidental loss
- User downloads PDF → uses edited version if exists, else original
```

## 2. DATA STORAGE

### localStorage Keys

**Existing (unchanged):**
```typescript
// Original AI-generated version (never modified)
'mockmaster_adapted_resume' → AdaptedResume
```

**New (for F-012):**
```typescript
// User's edited version (only exists if user made edits)
'mockmaster_edited_resume' → AdaptedContent | null

// Metadata about edits
'mockmaster_edit_metadata' → {
  last_edited: string;          // ISO timestamp
  has_edits: boolean;
  sections_edited: string[];    // ['summary', 'experience', 'skills']
}
```

### Data Structures

**No database changes needed** - This is localStorage-only for MVP.

```typescript
// Existing type (unchanged)
export interface AdaptedResume {
  original_resume_hash: string;
  job_analysis_hash: string;
  adapted_content: AdaptedContent;  // Original AI version
  ats_score: number;
  changes_summary: ChangesSummary;
  adapted_at: string;
}

// Edited content stored separately
export interface EditedContent {
  adapted_content: AdaptedContent;  // User's modified version
  last_edited: string;
  sections_edited: string[];
}
```

### Storage Service Extension

**File:** `lib/adapted-resume-storage.ts`

Add new methods:
```typescript
class AdaptedResumeStorage {
  private readonly EDITED_KEY = 'mockmaster_edited_resume';
  private readonly EDIT_METADATA_KEY = 'mockmaster_edit_metadata';

  /**
   * Save user's edited version (separate from original AI version)
   */
  saveEdited(content: AdaptedContent, sectionsEdited: string[]): void {
    const editData: EditedContent = {
      adapted_content: content,
      last_edited: new Date().toISOString(),
      sections_edited: sectionsEdited,
    };
    localStorage.setItem(this.EDITED_KEY, JSON.stringify(editData));
  }

  /**
   * Get user's edited version (null if no edits)
   */
  getEdited(): EditedContent | null {
    const json = localStorage.getItem(this.EDITED_KEY);
    if (!json) return null;
    return JSON.parse(json) as EditedContent;
  }

  /**
   * Get content for display/export (edited if exists, else original)
   */
  getContentForExport(): AdaptedContent | null {
    const edited = this.getEdited();
    if (edited) return edited.adapted_content;

    const original = this.get();
    return original ? original.adapted_content : null;
  }

  /**
   * Check if user has made edits
   */
  hasEdits(): boolean {
    return this.getEdited() !== null;
  }

  /**
   * Delete edited version (keep original AI version)
   */
  deleteEdited(): void {
    localStorage.removeItem(this.EDITED_KEY);
    localStorage.removeItem(this.EDIT_METADATA_KEY);
  }

  /**
   * Reset to AI version (delete all edits)
   */
  resetToAIVersion(): void {
    this.deleteEdited();
  }
}
```

## 3. COMPONENT ARCHITECTURE

### Component Hierarchy

```
AdaptedResumePreview (MODIFIED)
├── Edit Mode Toggle Button (NEW)
├── Reset to AI Version Button (NEW)
├── Save Status Indicator (NEW)
├── EditableResumeSection (NEW)
│   ├── EditableSummary (NEW)
│   ├── EditableExperience (NEW)
│   │   └── EditableExperienceItem (NEW)
│   │       └── EditableBullets (NEW)
│   └── EditableSkills (NEW)
├── DownloadPDFButton (MODIFIED)
└── TemplateSelectorModal (UNCHANGED)

ResetConfirmationDialog (NEW)
```

### 3.1. AdaptedResumePreview Component (MODIFIED)

**File:** `components/AdaptedResumePreview.tsx`

**New State:**
```typescript
const [isEditMode, setIsEditMode] = useState(false);
const [editedContent, setEditedContent] = useState<AdaptedContent | null>(null);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
const [sectionsEdited, setSectionsEdited] = useState<Set<string>>(new Set());
const [showResetDialog, setShowResetDialog] = useState(false);
```

**New Functions:**
```typescript
// Load edited version on mount
useEffect(() => {
  const edited = adaptedResumeStorage.getEdited();
  if (edited) {
    setEditedContent(edited.adapted_content);
    setSectionsEdited(new Set(edited.sections_edited));
  }
}, []);

// Auto-save with debouncing (500ms)
const debouncedSave = useMemo(
  () =>
    debounce((content: AdaptedContent, sections: string[]) => {
      setSaveStatus('saving');
      adaptedResumeStorage.saveEdited(content, sections);
      setTimeout(() => setSaveStatus('saved'), 1000);
    }, 500),
  []
);

// Handle content changes
const handleContentChange = (
  section: keyof AdaptedContent,
  value: any
) => {
  const newContent = { ...currentContent, [section]: value };
  setEditedContent(newContent);

  const newSections = new Set(sectionsEdited);
  newSections.add(section);
  setSectionsEdited(newSections);

  debouncedSave(newContent, Array.from(newSections));
};

// Reset to AI version
const handleReset = () => {
  setShowResetDialog(true);
};

const confirmReset = () => {
  adaptedResumeStorage.resetToAIVersion();
  setEditedContent(null);
  setSectionsEdited(new Set());
  setShowResetDialog(false);
  setIsEditMode(false);
};

// Get current content (edited or original)
const currentContent = editedContent || resume.adapted_content;
```

**New UI Elements:**
```tsx
{/* Edit Mode Controls */}
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-4">
    {/* Edit Toggle */}
    <button
      onClick={() => setIsEditMode(!isEditMode)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isEditMode
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {isEditMode ? '✓ Editing' : 'Edit Resume'}
    </button>

    {/* Save Status */}
    {saveStatus !== 'idle' && (
      <div className="flex items-center gap-2 text-sm">
        {saveStatus === 'saving' ? (
          <>
            <Spinner size="sm" />
            <span className="text-gray-600">Saving...</span>
          </>
        ) : (
          <>
            <CheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Saved</span>
          </>
        )}
      </div>
    )}
  </div>

  {/* Reset Button (only show if has edits) */}
  {sectionsEdited.size > 0 && (
    <button
      onClick={handleReset}
      className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
    >
      Reset to AI Version
    </button>
  )}
</div>
```

### 3.2. EditableSummary Component (NEW)

**File:** `components/EditableSummary.tsx`

```typescript
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
    onChange(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="w-full p-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => isEditMode && setIsEditing(true)}
      className={`p-3 rounded-lg ${
        isEditMode
          ? 'cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-300'
          : ''
      }`}
    >
      <p className="text-gray-700 leading-relaxed">{value}</p>
      {isEditMode && (
        <p className="text-xs text-blue-600 mt-2">Click to edit</p>
      )}
    </div>
  );
}
```

### 3.3. EditableExperience Component (NEW)

**File:** `components/EditableExperience.tsx`

```typescript
interface EditableExperienceProps {
  experiences: AdaptedExperienceItem[];
  onChange: (experiences: AdaptedExperienceItem[]) => void;
  isEditMode: boolean;
}

export default function EditableExperience({
  experiences,
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
    updated[expIndex].bullets.push('');
    onChange(updated);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.splice(bulletIndex, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, expIndex) => (
        <EditableExperienceItem
          key={expIndex}
          experience={exp}
          isEditMode={isEditMode}
          onBulletChange={(bulletIdx, value) =>
            handleBulletChange(expIndex, bulletIdx, value)
          }
          onAddBullet={() => handleAddBullet(expIndex)}
          onRemoveBullet={(bulletIdx) => handleRemoveBullet(expIndex, bulletIdx)}
        />
      ))}
    </div>
  );
}
```

### 3.4. EditableExperienceItem Component (NEW)

**File:** `components/EditableExperienceItem.tsx`

```typescript
interface EditableExperienceItemProps {
  experience: AdaptedExperienceItem;
  isEditMode: boolean;
  onBulletChange: (bulletIndex: number, value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (bulletIndex: number) => void;
}

export default function EditableExperienceItem({
  experience,
  isEditMode,
  onBulletChange,
  onAddBullet,
  onRemoveBullet,
}: EditableExperienceItemProps) {
  return (
    <div className="relative pl-4 border-l-2 border-blue-500">
      {/* Job Title, Company, Dates - Read-only */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {experience.title}
        </h3>
        <p className="text-md text-gray-700 font-medium">
          {experience.company}
        </p>
        <p className="text-sm text-gray-500">{experience.dates}</p>
      </div>

      {/* Editable Bullets */}
      <ul className="list-disc list-inside space-y-2">
        {experience.bullets.map((bullet, idx) => (
          <EditableBullet
            key={idx}
            value={bullet}
            onChange={(value) => onBulletChange(idx, value)}
            onRemove={() => onRemoveBullet(idx)}
            isEditMode={isEditMode}
          />
        ))}
      </ul>

      {/* Add Bullet Button */}
      {isEditMode && (
        <button
          onClick={onAddBullet}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add bullet point
        </button>
      )}
    </div>
  );
}
```

### 3.5. EditableBullet Component (NEW)

**File:** `components/EditableBullet.tsx`

```typescript
interface EditableBulletProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  isEditMode: boolean;
}

export default function EditableBullet({
  value,
  onChange,
  onRemove,
  isEditMode,
}: EditableBulletProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  if (isEditMode && isEditing) {
    return (
      <li className="flex items-start gap-2">
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="flex-1 p-2 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li
      onClick={() => isEditMode && setIsEditing(true)}
      className={`flex items-start gap-2 group ${
        isEditMode ? 'cursor-pointer hover:bg-blue-50 p-2 rounded' : ''
      }`}
    >
      <span className="flex-1 text-gray-700">{value}</span>
      {isEditMode && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </li>
  );
}
```

### 3.6. EditableSkills Component (NEW)

**File:** `components/EditableSkills.tsx`

```typescript
interface EditableSkillsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  isEditMode: boolean;
}

export default function EditableSkills({
  skills,
  onChange,
  isEditMode,
}: EditableSkillsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill('');
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updated = [...skills];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
              isEditMode
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <span>{skill}</span>
            {isEditMode && (
              <button
                onClick={() => handleRemoveSkill(idx)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Skill */}
      {isEditMode && (
        <div>
          {isAdding ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                className="flex-1 p-2 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSkill();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add skill
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3.7. ResetConfirmationDialog Component (NEW)

**File:** `components/ResetConfirmationDialog.tsx`

```typescript
interface ResetConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ResetConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Reset to AI Version?
        </h3>
        <p className="text-gray-700 mb-6">
          This will discard all your edits and restore the original AI-generated
          resume. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.8. DownloadPDFButton Component (MODIFIED)

**File:** `components/DownloadPDFButton.tsx`

**Changes:** Use edited content if exists, else use original

```typescript
// Add prop to receive edited content
interface DownloadPDFButtonProps {
  adaptedContent: AdaptedContent;  // Original or edited
  companyName: string;
  template: TemplateType;
  hasEdits?: boolean;  // NEW: Show indicator if using edited version
}

// In component body, add indicator
{hasEdits && (
  <span className="text-xs text-green-600 flex items-center gap-1">
    <CheckIcon className="w-3 h-3" />
    Using your edited version
  </span>
)}
```

## 4. STATE MANAGEMENT

### React State Architecture

```typescript
// AdaptedResumePreview Component State
interface ComponentState {
  // Edit mode
  isEditMode: boolean;

  // Content (null if no edits, uses original from props)
  editedContent: AdaptedContent | null;

  // Save status for UI feedback
  saveStatus: 'idle' | 'saving' | 'saved';

  // Track which sections were edited
  sectionsEdited: Set<'summary' | 'experience' | 'skills'>;

  // Reset dialog
  showResetDialog: boolean;

  // Template selection (existing)
  selectedTemplate: TemplateType;
  isTemplateModalOpen: boolean;
}
```

### State Flow

```
User Edit → Local State Update → Debounced Save → localStorage
                ↓
         Visual Feedback (Saving... → Saved ✓)
```

### Auto-Save Implementation

```typescript
import { debounce } from 'lodash';

const debouncedSave = useMemo(
  () =>
    debounce((content: AdaptedContent, sections: string[]) => {
      setSaveStatus('saving');
      try {
        adaptedResumeStorage.saveEdited(content, sections);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save edits:', error);
        setSaveStatus('idle');
        // Show error toast
      }
    }, 500),
  []
);

// Cleanup on unmount
useEffect(() => {
  return () => {
    debouncedSave.cancel();
  };
}, [debouncedSave]);
```

## 5. PDF EXPORT INTEGRATION

### Modified PDF Generation Flow

```
User clicks "Download PDF"
  ↓
Check if edited version exists
  ↓
  Yes → Use edited content
  No → Use original AI content
  ↓
Call /api/generate-pdf with content
  ↓
Download PDF
```

### Code Changes

**File:** `components/AdaptedResumePreview.tsx`

```typescript
// Determine content for PDF export
const contentForPDF = adaptedResumeStorage.getContentForExport() || adapted_content;
const hasEdits = adaptedResumeStorage.hasEdits();

<DownloadPDFButton
  adaptedContent={contentForPDF}
  companyName={jobAnalysisCompanyName}
  template={selectedTemplate}
  hasEdits={hasEdits}
/>
```

**No API changes needed** - API already accepts AdaptedContent, doesn't care if it's edited or not.

## 6. TESTING REQUIREMENTS

### 6.1. Unit Tests

**File:** `__tests__/editable-resume.test.ts`

```typescript
describe('Editable Resume', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saves edited summary to localStorage', () => {
    const content: AdaptedContent = {...};
    adaptedResumeStorage.saveEdited(content, ['summary']);
    const saved = adaptedResumeStorage.getEdited();
    expect(saved?.adapted_content.summary).toBe(content.summary);
  });

  test('hasEdits returns true when edits exist', () => {
    adaptedResumeStorage.saveEdited({...}, ['summary']);
    expect(adaptedResumeStorage.hasEdits()).toBe(true);
  });

  test('resetToAIVersion deletes edited content', () => {
    adaptedResumeStorage.saveEdited({...}, ['summary']);
    adaptedResumeStorage.resetToAIVersion();
    expect(adaptedResumeStorage.hasEdits()).toBe(false);
  });

  test('getContentForExport returns edited when exists', () => {
    const original = {...};
    const edited = {...modified...};
    adaptedResumeStorage.save(createAdaptedResume(original));
    adaptedResumeStorage.saveEdited(edited, ['summary']);
    const content = adaptedResumeStorage.getContentForExport();
    expect(content?.summary).toBe(edited.summary);
  });
});
```

### 6.2. Integration Tests

**File:** `__tests__/edit-flow.integration.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdaptedResumePreview from '@/components/AdaptedResumePreview';

describe('Edit Flow Integration', () => {
  const mockResume: AdaptedResume = {...};
  const mockOriginal: ResumeData = {...};

  test('full edit and save flow', async () => {
    render(
      <AdaptedResumePreview
        resume={mockResume}
        original={mockOriginal}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Resume'));
    expect(screen.getByText('✓ Editing')).toBeInTheDocument();

    // Edit summary
    const summary = screen.getByText(/Professional Summary/i).parentElement;
    fireEvent.click(summary);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New summary' } });
    fireEvent.click(screen.getByText('Save'));

    // Wait for auto-save
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    // Verify localStorage
    const edited = adaptedResumeStorage.getEdited();
    expect(edited?.adapted_content.summary).toBe('New summary');
  });

  test('reset to AI version', async () => {
    adaptedResumeStorage.saveEdited({...edited...}, ['summary']);

    render(<AdaptedResumePreview resume={mockResume} original={mockOriginal} />);

    // Click reset
    fireEvent.click(screen.getByText('Reset to AI Version'));

    // Confirm dialog
    expect(screen.getByText(/discard all your edits/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Reset'));

    // Verify localStorage cleared
    expect(adaptedResumeStorage.hasEdits()).toBe(false);
  });
});
```

### 6.3. Manual Testing Checklist

**Desktop Testing (Chrome, Firefox, Safari):**
- [ ] Edit mode toggle works
- [ ] Summary becomes editable
- [ ] Experience bullets can be edited
- [ ] Add/remove bullets works
- [ ] Skills can be added/removed
- [ ] Auto-save triggers after 500ms
- [ ] "Saving..." → "Saved ✓" indicator appears
- [ ] Reset to AI version shows confirmation
- [ ] Reset restores original content
- [ ] Download PDF contains edited version
- [ ] Edits persist after page refresh
- [ ] Edit indicators show correctly

**Mobile Testing (iOS Safari, Android Chrome):**
- [ ] Edit mode works on mobile
- [ ] Textarea is scrollable and usable
- [ ] Input fields are accessible
- [ ] Buttons are tap-friendly (min 44x44px)
- [ ] Confirmation dialog is mobile-friendly
- [ ] No horizontal scrolling issues

**Edge Cases:**
- [ ] Edit with empty summary → validation error
- [ ] Edit with very long text (>5000 chars) → handled gracefully
- [ ] Remove all bullets from experience → validation warning
- [ ] Add 50+ skills → UI remains usable
- [ ] Navigate away while editing → auto-save prevents loss
- [ ] localStorage quota exceeded → error message shown

## 7. IMPLEMENTATION PLAN

### Phase 1: Storage Layer (1-2 hours)
1. Extend `lib/adapted-resume-storage.ts` with new methods
2. Write unit tests for storage methods
3. Verify localStorage operations work correctly

### Phase 2: Core Edit Components (3-4 hours)
4. Create `EditableSummary.tsx`
5. Create `EditableBullet.tsx`
6. Create `EditableExperienceItem.tsx`
7. Create `EditableExperience.tsx`
8. Create `EditableSkills.tsx`
9. Write component unit tests

### Phase 3: Main Component Integration (2-3 hours)
10. Modify `AdaptedResumePreview.tsx` to support edit mode
11. Add edit mode toggle button
12. Integrate editable components
13. Implement auto-save with debouncing
14. Add save status indicator

### Phase 4: Reset Functionality (1 hour)
15. Create `ResetConfirmationDialog.tsx`
16. Integrate reset button
17. Wire up confirmation flow
18. Test reset functionality

### Phase 5: PDF Integration (1 hour)
19. Modify `DownloadPDFButton.tsx` to use edited content
20. Add "Using edited version" indicator
21. Test PDF generation with edited content

### Phase 6: Testing & Polish (2-3 hours)
22. Run all unit tests (target >80% coverage)
23. Run integration tests
24. Manual testing on desktop browsers
25. Manual testing on mobile browsers
26. Test edge cases
27. Fix bugs and polish UI

### Phase 7: Documentation (1 hour)
28. Update README with edit feature
29. Create testing guide
30. Create implementation summary

**Total Estimated Time:** 11-15 hours (~2 days)

## 8. DEPLOYMENT CHECKLIST

**Pre-Deployment:**
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass
- [ ] Manual testing completed on desktop
- [ ] Manual testing completed on mobile
- [ ] Edge cases tested
- [ ] No console errors in browser
- [ ] localStorage operations verified
- [ ] PDF export works with edited content
- [ ] Reset functionality works correctly
- [ ] Code reviewed for security issues
- [ ] TypeScript builds without errors

**Staging Deployment:**
- [ ] Deploy to Vercel staging
- [ ] Run smoke tests
- [ ] Test edit flow end-to-end
- [ ] Test on real mobile devices
- [ ] Verify localStorage persistence
- [ ] Verify PDF download works

**Production Deployment:**
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Verify feature works for new users
- [ ] Verify feature works for existing users with saved resumes

**Post-Deployment:**
- [ ] Update plan.md to mark F-012 as Done
- [ ] Create git commit
- [ ] Update documentation
- [ ] Monitor user feedback

## 9. SECURITY CONSIDERATIONS

### Input Validation
```typescript
// Validate edited content before saving
function validateEditedContent(content: AdaptedContent): ValidationResult {
  const errors: string[] = [];

  if (!content.summary || content.summary.trim().length === 0) {
    errors.push('Summary cannot be empty');
  }

  if (content.summary.length > 5000) {
    errors.push('Summary is too long (max 5000 characters)');
  }

  content.experience.forEach((exp, idx) => {
    if (exp.bullets.length === 0) {
      errors.push(`Experience ${idx + 1} must have at least one bullet`);
    }
  });

  if (content.skills.length === 0) {
    errors.push('At least one skill is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### XSS Prevention
- All user input is sanitized before rendering
- React's default escaping prevents XSS
- No `dangerouslySetInnerHTML` used
- PDF generation library handles escaping

### localStorage Limits
- Catch QuotaExceededError
- Show user-friendly error message
- Provide option to clear old data

## 10. PERFORMANCE CONSIDERATIONS

### Debouncing
- Auto-save debounced to 500ms to prevent excessive localStorage writes
- Only save when content actually changes

### Rendering
- Use React.memo for editable components to prevent unnecessary re-renders
- Only re-render changed sections

### localStorage Size
- Monitor storage size (expect ~50-100KB per resume)
- Warn user if approaching quota

## 11. ACCESSIBILITY CONSIDERATIONS

### Keyboard Navigation
- All edit controls accessible via keyboard
- Tab order is logical
- Enter key saves edits
- Escape key cancels edits

### Screen Readers
- Proper ARIA labels on edit buttons
- Announce save status changes
- Confirmation dialog is accessible

### Focus Management
- Auto-focus on edit fields when entering edit mode
- Return focus to trigger button after save/cancel

## 12. UX DESIGN DECISIONS

### Why Inline Editing?
- Faster than modal editing (fewer clicks)
- More natural (edit in place)
- Similar to Google Docs, Notion (familiar patterns)

### Why Auto-Save?
- Prevents data loss
- Reduces cognitive load (no need to remember to save)
- Industry standard (Google Docs, Notion, etc.)

### Why Confirmation for Reset?
- Prevent accidental data loss
- Give users a chance to cancel

### Why Show "Saved" Indicator?
- Provide feedback that action completed
- Build user confidence in auto-save

## 13. FUTURE ENHANCEMENTS (POST-MVP)

**Not included in F-012, but potential future features:**
- Undo/Redo functionality
- Edit history/version control
- Drag-and-drop reordering of experiences
- Rich text formatting (bold, italic, links)
- AI re-suggestions after manual edits
- Collaborative editing (if multi-user added)
- Export edited version to .docx
- Compare edited vs AI version side-by-side

---

## DEFINITION OF DONE

F-012 is complete when:
- [x] Architecture document approved
- [ ] All storage methods implemented and tested
- [ ] All editable components created
- [ ] Edit mode toggle works
- [ ] Auto-save with debouncing works
- [ ] Reset functionality works with confirmation
- [ ] PDF export uses edited version
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass
- [ ] Manual testing completed (desktop + mobile)
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Deployed to staging and validated
- [ ] Deployed to production and validated
- [ ] Feature marked Done in plan.md
