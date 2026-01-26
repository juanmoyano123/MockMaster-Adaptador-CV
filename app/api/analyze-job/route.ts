/**
 * API Route: Job Description Analysis
 * Feature: F-003
 *
 * Analyzes job descriptions using Claude AI to extract structured information.
 */

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { JobAnalysisAPIError } from '@/lib/types';

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 20000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      const error: JobAnalysisAPIError = {
        error: 'Missing or invalid "text" field in request body.',
        code: 'INVALID_INPUT',
      };
      return Response.json(error, { status: 400 });
    }

    const trimmedText = text.trim();

    if (trimmedText.length < MIN_TEXT_LENGTH) {
      const error: JobAnalysisAPIError = {
        error: `Job description too short. Please paste the full job posting (minimum ${MIN_TEXT_LENGTH} characters).`,
        code: 'TEXT_TOO_SHORT',
      };
      return Response.json(error, { status: 400 });
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      const error: JobAnalysisAPIError = {
        error: `Job description too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`,
        code: 'TEXT_TOO_LONG',
      };
      return Response.json(error, { status: 400 });
    }

    // Calculate text hash for caching
    const textHash = crypto
      .createHash('sha256')
      .update(trimmedText.toLowerCase())
      .digest('hex');

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Construct prompt for Claude
    const prompt = `Analyze this job description and extract structured information in JSON format.

Job Description:
${trimmedText}

Extract and return ONLY a JSON object with this exact structure:
{
  "job_title": "extracted job title or 'Not specified'",
  "company_name": "extracted company name or 'Not specified'",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "seniority_level": "Junior/Mid/Senior/Staff/Principal with years range",
  "industry": "industry/domain like FinTech, E-commerce, Healthcare, etc."
}

Guidelines:
- Extract 5-10 required skills (prioritize technical skills, years of experience, certifications)
- Extract 3-8 preferred skills (nice-to-haves mentioned)
- Extract 4-8 key responsibilities
- Infer seniority from years of experience mentioned or job title
- If info is not available, use "Not specified" or empty array
- Return ONLY valid JSON, no additional text`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      temperature: 0, // Deterministic results
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      const error: JobAnalysisAPIError = {
        error: 'Unexpected response type from Claude API.',
        code: 'CLAUDE_API_ERROR',
      };
      return Response.json(error, { status: 500 });
    }

    // Extract JSON from response using regex
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const error: JobAnalysisAPIError = {
        error: 'Failed to extract valid JSON from Claude response.',
        code: 'JSON_PARSE_ERROR',
      };
      return Response.json(error, { status: 500 });
    }

    // Parse JSON
    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      const error: JobAnalysisAPIError = {
        error: 'Failed to parse JSON from Claude response.',
        code: 'JSON_PARSE_ERROR',
      };
      return Response.json(error, { status: 500 });
    }

    // Validate analysis structure
    if (
      !analysis.job_title ||
      !analysis.company_name ||
      !Array.isArray(analysis.required_skills) ||
      !Array.isArray(analysis.preferred_skills) ||
      !Array.isArray(analysis.responsibilities) ||
      !analysis.seniority_level ||
      !analysis.industry
    ) {
      const error: JobAnalysisAPIError = {
        error: 'Invalid analysis structure returned from Claude.',
        code: 'JSON_PARSE_ERROR',
      };
      return Response.json(error, { status: 500 });
    }

    // Return successful response
    return Response.json(
      {
        text_hash: textHash,
        analysis,
        analyzed_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/analyze-job:', error);

    const apiError: JobAnalysisAPIError = {
      error: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
    };
    return Response.json(apiError, { status: 500 });
  }
}
