/**
 * API Route: POST /api/parse-resume
 * Uses Claude API to structure raw resume text into JSON
 * Feature: F-002
 */

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { ParsedContent, APIError } from '@/lib/types';

// Maximum text length (50KB)
const MAX_TEXT_LENGTH = 50 * 1024;

/**
 * Extract JSON from Claude's response
 * Claude may wrap JSON in markdown code blocks or add explanations
 */
function extractJSON(content: string): ParsedContent {
  // Try to find JSON in the response
  let jsonStr = content;

  // Remove markdown code blocks if present
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  }

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonStr.trim());

    // Validate structure
    if (!parsed.contact || !parsed.experience || !parsed.education || !parsed.skills) {
      throw new Error('Invalid JSON structure from Claude');
    }

    return parsed as ParsedContent;
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', error);
    throw new Error('Failed to parse Claude response');
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { text } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      const errorResponse: APIError = {
        error: 'Missing or invalid "text" field in request body',
        code: 'INVALID_FORMAT',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      const errorResponse: APIError = {
        error: `Resume text too long. Maximum is ${MAX_TEXT_LENGTH / 1024}KB`,
        code: 'TEXT_TOO_LONG',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      const errorResponse: APIError = {
        error: 'Server configuration error. Please contact support.',
        code: 'INTERNAL_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create prompt for Claude
    const prompt = `You are a resume parser. Extract structured information from this resume text.

Return ONLY valid JSON (no markdown, no explanations) in this exact format:
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/username",
    "location": "City, State"
  },
  "summary": "Professional summary paragraph (optional, omit if not present)",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dates": "Jan 2020 - Present",
      "bullets": [
        "Achievement bullet point 1",
        "Achievement bullet point 2"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2020"
    }
  ],
  "skills": ["JavaScript", "Python", "React", "Node.js"]
}

Important:
- Extract ALL work experience entries (not just the most recent)
- Extract ALL education entries
- Extract ALL skills mentioned
- Preserve bullet points exactly as written
- If optional fields (phone, linkedin, location, summary) are not present, omit them
- Return ONLY the JSON object, no additional text

Resume text:
${text}`;

    // Call Claude API
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        temperature: 0, // Deterministic for parsing
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } catch (error) {
      console.error('Claude API error:', error);
      const errorResponse: APIError = {
        error: 'Failed to connect to AI service. Please try again.',
        code: 'CLAUDE_API_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Extract text from Claude's response
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    if (!responseText) {
      const errorResponse: APIError = {
        error: 'No response from AI service',
        code: 'CLAUDE_API_ERROR',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Extract and validate JSON
    let parsedContent: ParsedContent;
    try {
      parsedContent = extractJSON(responseText);
    } catch (error) {
      // Retry once if JSON parsing fails
      console.warn('First JSON parse attempt failed, retrying...');

      try {
        const retryMessage = await anthropic.messages.create({
          model: 'claude-sonnet-4.5-20250929',
          max_tokens: 4000,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const retryText = retryMessage.content
          .filter((block) => block.type === 'text')
          .map((block) => ('text' in block ? block.text : ''))
          .join('\n');

        parsedContent = extractJSON(retryText);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        const errorResponse: APIError = {
          error: 'Failed to parse resume. Please try text paste mode or contact support.',
          code: 'PARSING_FAILED',
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }
    }

    // Return successfully parsed content
    return NextResponse.json({
      parsed_content: parsedContent,
    });
  } catch (error) {
    console.error('Unexpected error in /api/parse-resume:', error);

    const errorResponse: APIError = {
      error: 'Internal server error. Please try again.',
      code: 'INTERNAL_ERROR',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
