/**
 * ResumePreview Component
 * Displays parsed resume with editable sections
 * Feature: F-002
 */

'use client';

import { useState } from 'react';
import { ResumeData, ParsedContent, ContactInfo, ExperienceItem, EducationItem } from '@/lib/types';

interface ResumePreviewProps {
  resumeData: ResumeData;
  onSave: (data: ResumeData) => void;
  onUploadNew: () => void;
  isEditing?: boolean;
}

export default function ResumePreview({ resumeData, onSave, onUploadNew, isEditing = false }: ResumePreviewProps) {
  const [editableData, setEditableData] = useState<ParsedContent>(resumeData.parsed_content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);

    const updatedResume: ResumeData = {
      ...resumeData,
      parsed_content: editableData,
    };

    onSave(updatedResume);

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const updateContact = (field: keyof ContactInfo, value: string) => {
    setEditableData({
      ...editableData,
      contact: {
        ...editableData.contact,
        [field]: value,
      },
    });
  };

  const updateSummary = (value: string) => {
    setEditableData({
      ...editableData,
      summary: value,
    });
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string | string[]) => {
    const newExperience = [...editableData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value,
    };
    setEditableData({
      ...editableData,
      experience: newExperience,
    });
  };

  const addExperience = () => {
    setEditableData({
      ...editableData,
      experience: [
        ...editableData.experience,
        {
          company: '',
          title: '',
          dates: '',
          bullets: [''],
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    setEditableData({
      ...editableData,
      experience: editableData.experience.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const newEducation = [...editableData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value,
    };
    setEditableData({
      ...editableData,
      education: newEducation,
    });
  };

  const addEducation = () => {
    setEditableData({
      ...editableData,
      education: [
        ...editableData.education,
        {
          school: '',
          degree: '',
          year: '',
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    setEditableData({
      ...editableData,
      education: editableData.education.filter((_, i) => i !== index),
    });
  };

  const updateSkills = (skills: string) => {
    setEditableData({
      ...editableData,
      skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Resume</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and edit your information before saving
          </p>
        </div>
        <button
          onClick={onUploadNew}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Upload New Resume
        </button>
      </div>

      {/* Preview Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={editableData.contact.name}
                onChange={(e) => updateContact('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={editableData.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={editableData.contact.phone || ''}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                value={editableData.contact.linkedin || ''}
                onChange={(e) => updateContact('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editableData.contact.location || ''}
                onChange={(e) => updateContact('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Summary */}
        {(editableData.summary || isEditing) && (
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
              Professional Summary
            </h3>
            <textarea
              value={editableData.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-24"
              placeholder="Brief professional summary..."
            />
          </section>
        )}

        {/* Experience */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
              Work Experience
            </h3>
            <button
              onClick={addExperience}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Experience
            </button>
          </div>
          <div className="space-y-6">
            {editableData.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
                    <input
                      type="text"
                      value={exp.dates}
                      onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                      placeholder="e.g., Jan 2020 - Present"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (one per line)</label>
                    <textarea
                      value={exp.bullets.join('\n')}
                      onChange={(e) => updateExperience(index, 'bullets', e.target.value.split('\n'))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
                      placeholder="- Achievement 1&#10;- Achievement 2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
              Education
            </h3>
            <button
              onClick={addEducation}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Education
            </button>
          </div>
          <div className="space-y-4">
            {editableData.education.map((edu, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                <button
                  onClick={() => removeEducation(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="2020"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-2">
            Skills
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <textarea
              value={editableData.skills.join(', ')}
              onChange={(e) => updateSkills(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-24"
              placeholder="JavaScript, Python, React, Node.js, etc."
            />
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>
    </div>
  );
}
