/**
 * Template Preferences Storage
 * Feature: F-006
 *
 * Manages user's template selection in localStorage
 */

import { TemplateType, TemplatePreferences } from './types';

const PREFERENCES_KEY = 'mockmaster_preferences';

/**
 * Get template preferences from localStorage
 */
export function getTemplatePreferences(): TemplatePreferences {
  if (typeof window === 'undefined') {
    return { preferred_template: 'modern' };
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return { preferred_template: 'modern', show_tutorial: true };
    }

    const preferences = JSON.parse(stored) as TemplatePreferences;
    return preferences;
  } catch (error) {
    console.error('Failed to load template preferences:', error);
    return { preferred_template: 'modern', show_tutorial: true };
  }
}

/**
 * Save template preference to localStorage
 */
export function saveTemplatePreference(template: TemplateType): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const preferences = getTemplatePreferences();
    preferences.preferred_template = template;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save template preference:', error);
  }
}

/**
 * Get preferred template (default: 'modern')
 */
export function getPreferredTemplate(): TemplateType {
  const preferences = getTemplatePreferences();
  return preferences.preferred_template || 'modern';
}

/**
 * Update tutorial visibility preference
 */
export function setTutorialShown(shown: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const preferences = getTemplatePreferences();
    preferences.show_tutorial = !shown;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to update tutorial preference:', error);
  }
}
