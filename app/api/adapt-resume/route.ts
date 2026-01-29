/**
 * API Route: POST /api/adapt-resume
 * Feature: F-004 - AI Resume Adaptation Engine
 *
 * Uses Claude API to intelligently adapt a resume to match job requirements.
 * CRITICAL: Implements anti-hallucination validation to prevent AI from
 * inventing fake experiences, companies, or skills.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  ResumeData,
  JobAnalysis,
  AdaptedResume,
  AdaptationAPIError,
} from '@/lib/types';
import { validateNoHallucination, simpleHash } from '@/lib/validation';
import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/subscription-config';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/adapt-resume
 * Adapts a resume to match job requirements using Claude API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobAnalysis } = body as {
      resume?: ResumeData;
      jobAnalysis?: JobAnalysis;
    };

    // Check subscription limits (F-009)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Get subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      const tier = (subscription?.tier || 'free') as 'free' | 'pro';
      const plan = PLANS[tier];

      // Check usage if not unlimited
      if (plan.limits.adaptations_per_month !== -1) {
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodKey = periodStart.toISOString().split('T')[0];

        const { data: usage } = await supabase
          .from('subscription_usage')
          .select('adaptations_count')
          .eq('user_id', user.id)
          .eq('period_start', periodKey)
          .single();

        const usedCount = usage?.adaptations_count || 0;

        if (usedCount >= plan.limits.adaptations_per_month) {
          return NextResponse.json<AdaptationAPIError>(
            {
              error: `Has alcanzado el limite de ${plan.limits.adaptations_per_month} adaptaciones este mes. Actualiza a Pro para adaptaciones ilimitadas.`,
              code: 'VALIDATION_FAILED',
            },
            { status: 403 }
          );
        }
      }
    }

    // Validation: Check required inputs
    if (!resume || !resume.parsed_content) {
      return NextResponse.json<AdaptationAPIError>(
        {
          error: 'Resume data is missing or invalid',
          code: 'MISSING_RESUME',
        },
        { status: 400 }
      );
    }

    if (!jobAnalysis || !jobAnalysis.analysis) {
      return NextResponse.json<AdaptationAPIError>(
        {
          error: 'Job analysis data is missing or invalid',
          code: 'MISSING_JOB_ANALYSIS',
        },
        { status: 400 }
      );
    }

    // Build prompt for Claude API
    const prompt = buildAdaptationPrompt(resume, jobAnalysis);

    // Call Claude API
    console.log('Calling Claude API for resume adaptation...');
    const startTime = Date.now();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      temperature: 0.3, // Slight creativity for reformulation
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`Claude API responded in ${duration}ms`);

    // Extract JSON from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // Extract JSON from response (Claude may wrap it in markdown)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Claude response:', content.text);
      return NextResponse.json<AdaptationAPIError>(
        {
          error: 'Failed to extract JSON from Claude response',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    const adaptationResult = JSON.parse(jsonMatch[0]);

    // Build final AdaptedResume object
    const adaptedResume: AdaptedResume = {
      original_resume_hash: simpleHash(resume.original_text),
      job_analysis_hash: jobAnalysis.text_hash,
      adapted_content: adaptationResult.adapted_content,
      ats_score: adaptationResult.ats_score,
      changes_summary: adaptationResult.changes_summary,
      adapted_at: new Date().toISOString(),
    };

    // CRITICAL: Anti-hallucination validation
    const validation = validateNoHallucination(resume, adaptedResume);
    if (!validation.valid) {
      console.error('Hallucination detected:', validation.errors);
      return NextResponse.json<AdaptationAPIError>(
        {
          error: `Validation failed: ${validation.errors.join(', ')}`,
          code: 'VALIDATION_FAILED',
        },
        { status: 500 }
      );
    }

    // Increment usage counter after successful adaptation (F-009)
    if (user) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodKey = periodStart.toISOString().split('T')[0];

      // Try to get existing usage
      const { data: existingUsage } = await supabase
        .from('subscription_usage')
        .select('adaptations_count')
        .eq('user_id', user.id)
        .eq('period_start', periodKey)
        .single();

      if (existingUsage) {
        await supabase
          .from('subscription_usage')
          .update({ adaptations_count: existingUsage.adaptations_count + 1 })
          .eq('user_id', user.id)
          .eq('period_start', periodKey);
      } else {
        await supabase.from('subscription_usage').insert({
          user_id: user.id,
          period_start: periodKey,
          adaptations_count: 1,
        });
      }
    }

    // Success - return adapted resume
    return NextResponse.json<AdaptedResume>(adaptedResume, { status: 200 });
  } catch (error) {
    console.error('Error in /api/adapt-resume:', error);

    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json<AdaptationAPIError>(
        {
          error: `Claude API error: ${error.message}`,
          code: 'CLAUDE_API_ERROR',
        },
        { status: 500 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json<AdaptationAPIError>(
        {
          error: 'Failed to parse JSON response from AI',
          code: 'JSON_PARSE_ERROR',
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json<AdaptationAPIError>(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Builds the prompt for Claude API to adapt the resume
 * This is the MOST CRITICAL function - prompt quality determines output quality
 *
 * @param resume - Original resume data
 * @param jobAnalysis - Job requirements analysis
 * @returns Prompt string for Claude API
 */
function buildAdaptationPrompt(
  resume: ResumeData,
  jobAnalysis: JobAnalysis
): string {
  const { analysis } = jobAnalysis;

  return `You are an expert resume writer and ATS optimization specialist. Your task is to adapt an existing resume to match a specific job description.

STRICT RULES (CRITICAL - NO EXCEPTIONS):
1. NEVER invent skills, experiences, or achievements that don't exist in the original resume
2. ONLY reorganize, reformulate, and emphasize existing content
3. Use keywords from the job description NATURALLY in context
4. Keep all dates, companies, and titles EXACTLY as provided
5. Do NOT modify contact information or education
6. Return ONLY valid JSON (no markdown, no code blocks, no explanation)

ORIGINAL RESUME:
${JSON.stringify(resume.parsed_content, null, 2)}

JOB REQUIREMENTS:
Job Title: ${analysis.job_title}
Company: ${analysis.company_name}
Required Skills: ${analysis.required_skills.join(', ')}
Preferred Skills: ${analysis.preferred_skills.join(', ')}
Key Responsibilities: ${analysis.responsibilities.join(', ')}
Seniority Level: ${analysis.seniority_level}
Industry: ${analysis.industry}

TASK:
Adapt the resume to maximize match with this job. Return a JSON object with this EXACT structure:

{
  "adapted_content": {
    "contact": {
      "name": "...",
      "email": "...",
      "phone": "...",
      "linkedin": "...",
      "location": "..."
    },
    "summary": "A compelling 2-3 sentence professional summary that includes 3-5 keywords from the required skills list, naturally integrated into a coherent narrative about the candidate's background and relevance to this role.",
    "experience": [
      {
        "company": "Company Name (EXACT MATCH from original)",
        "title": "Job Title (EXACT MATCH from original)",
        "dates": "Start - End (EXACT MATCH from original)",
        "bullets": [
          "Reformulated bullet point that emphasizes relevant skills and uses action verbs from the job description",
          "Another bullet that highlights achievements relevant to this role's responsibilities"
        ],
        "relevance_score": 95
      }
    ],
    "education": [
      {
        "school": "...",
        "degree": "...",
        "year": "..."
      }
    ],
    "skills": ["Skill1", "Skill2", "..."]
  },
  "ats_score": 85,
  "changes_summary": {
    "skills_highlighted": 5,
    "bullets_reformulated": 12,
    "experiences_reordered": true
  }
}

GUIDELINES:

1. Summary:
   - Write a NEW professional summary (2-3 sentences)
   - Include 3-5 keywords from required_skills naturally
   - Focus on relevance to the job title and seniority level
   - Make it compelling and professional

2. Experience:
   - Reorder experiences by relevance_score (most relevant first)
   - relevance_score: 0-100, how well this experience matches the job
   - Keep company, title, and dates EXACTLY as in original
   - Reformulate bullets to emphasize relevant skills and achievements
   - Use strong action verbs from the job responsibilities
   - Quantify achievements where possible (if already quantified in original)
   - Focus on accomplishments, not just duties

3. Education:
   - Copy EXACTLY from original (no changes allowed)

4. Skills:
   - Reorder skills to match job relevance
   - Put required_skills that appear in original first (in order)
   - Then preferred_skills that appear in original
   - Then other skills from original
   - DO NOT add skills that aren't in the original resume

5. ATS Score:
   - Calculate: (matched_required_skills / total_required_skills) * 100
   - Only count EXACT matches (case-insensitive)
   - Be conservative in scoring

6. Changes Summary:
   - skills_highlighted: Number of skills moved to top of list
   - bullets_reformulated: Number of bullet points that were rewritten
   - experiences_reordered: true if order changed from original

FORBIDDEN ACTIONS (will fail validation):
❌ Adding companies that don't exist in original resume
❌ Adding skills that weren't explicitly mentioned in original
❌ Changing dates, job titles (beyond minor formatting), or company names
❌ Inventing projects, achievements, or responsibilities
❌ Modifying contact information or education
❌ Adding markdown, code blocks, or explanatory text

OUTPUT REQUIREMENTS:
- Return ONLY the JSON object
- No markdown formatting (no \`\`\`json)
- No explanation or commentary
- Valid, parseable JSON

Begin your response with { and end with }`;
}
