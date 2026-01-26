/**
 * API Route: POST /api/calculate-ats-breakdown
 * Feature: F-005 - ATS Compatibility Score with Detailed Breakdown
 *
 * Calculates detailed ATS score breakdown including:
 * - Keyword matching (35% weight)
 * - Skills matching (35% weight)
 * - Experience relevance via Claude API (20% weight)
 * - Format score (10% weight - always 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  AdaptedContent,
  JobAnalysis,
  ATSScoreBreakdown,
} from '@/lib/types';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Common English stop words to filter out
 */
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
  'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
  'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
  'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
  'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some',
  'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because',
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adapted_content, job_analysis } = body as {
      adapted_content?: AdaptedContent;
      job_analysis?: JobAnalysis;
    };

    // Validation
    if (!adapted_content) {
      return NextResponse.json(
        { error: 'adapted_content is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!job_analysis) {
      return NextResponse.json(
        { error: 'job_analysis is required', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    console.log('Calculating ATS breakdown...');
    const startTime = Date.now();

    // 1. Extract and match keywords (35% weight)
    const keywords = extractKeywords(job_analysis);
    const { matched: keywordsMatched, missing: missingKeywords } =
      matchKeywords(keywords, adapted_content);
    const keyword_score = (keywordsMatched / keywords.length) * 100;

    console.log(`Keywords: ${keywordsMatched}/${keywords.length} matched`);

    // 2. Match skills (35% weight)
    const { matched: skillsMatched, missing: skillsMissing } = matchSkills(
      job_analysis.analysis.required_skills,
      adapted_content
    );
    const skills_score =
      job_analysis.analysis.required_skills.length === 0
        ? 100
        : (skillsMatched.length / job_analysis.analysis.required_skills.length) *
          100;

    console.log(`Skills: ${skillsMatched.length} matched, ${skillsMissing.length} missing`);

    // 3. Score experience relevance via Claude API (20% weight)
    const experience_score = await scoreExperience(
      adapted_content,
      job_analysis
    );

    console.log(`Experience score: ${experience_score}`);

    // 4. Format score (10% weight) - always 100 for our templates
    const format_score = 100;

    // 5. Calculate total weighted score
    const total_score = Math.round(
      keyword_score * 0.35 +
        skills_score * 0.35 +
        experience_score * 0.2 +
        format_score * 0.1
    );

    // 6. Generate suggestions
    const suggestions = generateSuggestions(
      missingKeywords.slice(0, 10),
      skillsMissing
    );

    // Build breakdown object
    const breakdown: ATSScoreBreakdown = {
      total_score,
      keyword_score: Math.round(keyword_score),
      skills_score: Math.round(skills_score),
      experience_score,
      format_score,
      keywords_matched: keywordsMatched,
      keywords_total: keywords.length,
      missing_keywords: missingKeywords.slice(0, 10),
      skills_matched: skillsMatched,
      skills_missing: skillsMissing,
      suggestions,
    };

    const duration = Date.now() - startTime;
    console.log(`ATS breakdown calculated in ${duration}ms`);

    return NextResponse.json({ breakdown }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/calculate-ats-breakdown:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: `Claude API error: ${error.message}`,
          code: 'CLAUDE_API_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Extract top keywords from job analysis
 * Uses frequency-based extraction and filters stop words
 *
 * @param jobAnalysis - Job analysis data
 * @returns Array of top 20 keywords
 */
function extractKeywords(jobAnalysis: JobAnalysis): string[] {
  // Combine all job text sources
  const text = [
    jobAnalysis.analysis.job_title,
    ...jobAnalysis.analysis.required_skills,
    ...jobAnalysis.analysis.preferred_skills,
    ...jobAnalysis.analysis.responsibilities,
  ].join(' ');

  // Tokenize: split by whitespace and punctuation
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Keep hyphens (e.g., CI-CD)
    .split(/\s+/)
    .filter((word) => word.length > 2); // Filter short words

  // Count word frequency
  const frequency = new Map<string, number>();
  words.forEach((word) => {
    if (!STOP_WORDS.has(word)) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  });

  // Sort by frequency and take top 20
  const sortedWords = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 20);

  return sortedWords;
}

/**
 * Match keywords in adapted resume content
 *
 * @param keywords - Keywords to search for
 * @param content - Adapted resume content
 * @returns Object with matched count and missing keywords
 */
function matchKeywords(
  keywords: string[],
  content: AdaptedContent
): { matched: number; missing: string[] } {
  // Build searchable text from resume
  const resumeText = [
    content.summary,
    ...content.experience.flatMap((exp) => exp.bullets),
    ...content.skills,
  ]
    .join(' ')
    .toLowerCase();

  let matched = 0;
  const missing: string[] = [];

  keywords.forEach((keyword) => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matched++;
    } else {
      missing.push(keyword);
    }
  });

  return { matched, missing };
}

/**
 * Match required skills in resume
 * Checks both skills section and experience bullets
 *
 * @param requiredSkills - Required skills from job analysis
 * @param content - Adapted resume content
 * @returns Object with matched and missing skills
 */
function matchSkills(
  requiredSkills: string[],
  content: AdaptedContent
): { matched: string[]; missing: string[] } {
  const resumeSkills = content.skills.map((s) => s.toLowerCase());

  // Also check experience bullets for skills
  const experienceText = content.experience
    .flatMap((exp) => exp.bullets)
    .join(' ')
    .toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    if (
      resumeSkills.includes(skillLower) ||
      experienceText.includes(skillLower)
    ) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  return { matched, missing };
}

/**
 * Score experience relevance using Claude API
 * Claude evaluates how well the experience matches the job
 *
 * @param content - Adapted resume content
 * @param jobAnalysis - Job analysis data
 * @returns Score from 0-100
 */
async function scoreExperience(
  content: AdaptedContent,
  jobAnalysis: JobAnalysis
): Promise<number> {
  const prompt = `You are an ATS scoring expert. Rate the following resume experience for relevance to this job on a 0-100 scale.

JOB REQUIREMENTS:
Job Title: ${jobAnalysis.analysis.job_title}
Seniority: ${jobAnalysis.analysis.seniority_level}
Required Skills: ${jobAnalysis.analysis.required_skills.join(', ')}
Key Responsibilities: ${jobAnalysis.analysis.responsibilities.slice(0, 5).join(', ')}

RESUME EXPERIENCE:
${JSON.stringify(content.experience, null, 2)}

Rate the experience relevance on a 0-100 scale:
- 90-100: Perfect match (same role, same seniority, all key skills)
- 70-89: Strong match (related role, appropriate seniority, most skills)
- 50-69: Moderate match (transferable skills, some relevance)
- 30-49: Weak match (limited overlap)
- 0-29: Poor match (different field entirely)

IMPORTANT: Return ONLY a single number between 0 and 100. No explanation, just the number.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 50,
      temperature: 0,
      messages: [{ role: 'user', content: prompt }],
    });

    const content_block = message.content[0];
    if (content_block.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const scoreText = content_block.text.trim();
    const score = parseInt(scoreText);

    // Validate and clamp score
    if (isNaN(score)) {
      console.warn('Claude returned non-numeric score, defaulting to 50');
      return 50;
    }

    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error scoring experience:', error);
    // Fallback to medium score
    return 50;
  }
}

/**
 * Generate actionable suggestions based on gaps
 *
 * @param missingKeywords - Keywords not found in resume
 * @param missingSkills - Required skills not found in resume
 * @returns Array of up to 5 suggestions
 */
function generateSuggestions(
  missingKeywords: string[],
  missingSkills: string[]
): string[] {
  const suggestions: string[] = [];

  // Perfect score case
  if (missingKeywords.length === 0 && missingSkills.length === 0) {
    suggestions.push(
      'Your resume is well-optimized for this position'
    );
    return suggestions;
  }

  // Top 3 missing keywords
  missingKeywords.slice(0, 3).forEach((keyword) => {
    suggestions.push(
      `Consider adding "${keyword}" if you have relevant experience with this technology or concept`
    );
  });

  // Top 2 missing skills
  missingSkills.slice(0, 2).forEach((skill) => {
    suggestions.push(
      `Include "${skill}" in your skills section or mention it in experience bullets if applicable`
    );
  });

  return suggestions.slice(0, 5); // Max 5 suggestions
}
