import { VerseService } from '../bible/verse.service';
import { AIResponse } from './chatGPT.service';
import logger from '../../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  corrections: string[];
  warnings: string[];
}

export class ValidationService {
  private verseService: VerseService;
  private theologicalRedFlags: RegExp[];

  constructor() {
    this.verseService = new VerseService();

    this.theologicalRedFlags = [
      /God wants you to be (rich|wealthy|prosperous)/i,
      /you are a god/i,
      /Bible says.*\[no verse\]/i,
      /Scripture tells us.*\[citation needed\]/i,
      /Jesus never/i, // Often used in false claims
    ];
  }

  async validateResponse(
    response: AIResponse,
    originalQuestion: string
  ): Promise<ValidationResult> {
    const issues: string[] = [];
    const corrections: string[] = [];
    const warnings: string[] = [];

    // Validate verse references
    const verseValidation = await this.validateVerseReferences(response.response);
    issues.push(...verseValidation.issues);
    corrections.push(...verseValidation.corrections);

    // Check for theological red flags
    const theologicalCheck = this.checkTheologicalAccuracy(response.response);
    issues.push(...theologicalCheck.issues);
    warnings.push(...theologicalCheck.warnings);

    // Check for sensitive topics
    const sensitiveCheck = this.checkSensitiveTopics(
      originalQuestion,
      response.response
    );
    warnings.push(...sensitiveCheck.warnings);
    corrections.push(...sensitiveCheck.requiredAdditions);

    // Validate appropriate disclaimers
    const disclaimerCheck = this.checkDisclaimers(
      originalQuestion,
      response.response
    );
    corrections.push(...disclaimerCheck.missingDisclaimers);

    const isValid = issues.length === 0;

    return {
      isValid,
      issues,
      corrections,
      warnings,
    };
  }

  private async validateVerseReferences(text: string): Promise<{
    issues: string[];
    corrections: string[];
  }> {
    const issues: string[] = [];
    const corrections: string[] = [];

    // Extract verse references from text
    const referencePattern = /([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/g;
    const matches = text.matchAll(referencePattern);

    for (const match of matches) {
      const reference = match[0];
      const exists = await this.verseService.validateVerseExists(reference);
      
      if (!exists) {
        issues.push(`Invalid verse reference: ${reference}`);
        corrections.push(`Remove or correct the reference "${reference}"`);
      }
    }

    // Check for vague references
    const vaguePatterns = [
      /the Bible says/i,
      /Scripture tells us/i,
      /it is written/i,
      /God's word says/i,
    ];

    for (const pattern of vaguePatterns) {
      if (pattern.test(text)) {
        // Check if followed by actual verse reference within 50 characters
        const match = text.match(new RegExp(pattern.source + '.{0,50}', 'i'));
        if (match && !referencePattern.test(match[0])) {
          // warnings.push('Vague biblical reference without citation');
          corrections.push('Add specific verse reference after biblical claim');
        }
      }
    }

    return { issues, corrections };
  }

  private checkTheologicalAccuracy(text: string): {
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for theological red flags
    for (const pattern of this.theologicalRedFlags) {
      if (pattern.test(text)) {
        issues.push(`Potential theological concern: ${pattern.source}`);
      }
    }

    // Check for absolute statements that might be denominational
    const denominationalPatterns = [
      /baptism is required for salvation/i,
      /speaking in tongues is evidence/i,
      /predestination means/i,
      /Mary is/i,
    ];

    for (const pattern of denominationalPatterns) {
      if (pattern.test(text)) {
        warnings.push('Response may contain denominational-specific theology');
      }
    }

    // Check for prosperity gospel
    if (/God wants you to be (rich|wealthy|successful)/i.test(text)) {
      issues.push('Potential prosperity gospel theology detected');
    }

    // Check for works-based salvation
    if (/salvation (by|through) works/i.test(text) && 
        !/not by works/i.test(text)) {
      issues.push('Potential works-based salvation theology');
    }

    return { issues, warnings };
  }

  private checkSensitiveTopics(question: string, response: string): {
    warnings: string[];
    requiredAdditions: string[];
  } {
    const warnings: string[] = [];
    const requiredAdditions: string[] = [];
    const combinedText = (question + ' ' + response).toLowerCase();

    // Check for suicide/self-harm
    if (combinedText.includes('suicide') || combinedText.includes('self-harm')) {
      warnings.push('Response addresses suicide/self-harm');
      
      if (!response.includes('988') && !response.includes('crisis')) {
        requiredAdditions.push(
          'Add crisis helpline information: "If you\'re in crisis, please call 988 (Suicide & Crisis Lifeline) or reach out to a trusted counselor."'
        );
      }
      
      if (!response.includes('pastor') && !response.includes('counselor')) {
        requiredAdditions.push(
          'Recommend professional help: "Please speak with a pastor, counselor, or mental health professional."'
        );
      }
    }

    // Check for medical issues
    if (combinedText.includes('medical') || combinedText.includes('disease') || 
        combinedText.includes('diagnosis')) {
      if (!response.includes('doctor') && !response.includes('medical professional')) {
        warnings.push('Medical topic without professional disclaimer');
        requiredAdditions.push(
          'Add medical disclaimer: "This is spiritual guidance only. Please consult with medical professionals for health concerns."'
        );
      }
    }

    // Check for legal issues
    if (combinedText.includes('legal') || combinedText.includes('lawsuit') || 
        combinedText.includes('divorce')) {
      if (!response.includes('attorney') && !response.includes('legal counsel')) {
        warnings.push('Legal topic without professional disclaimer');
        requiredAdditions.push(
          'Add legal disclaimer: "For legal matters, please consult with a qualified attorney."'
        );
      }
    }

    return { warnings, requiredAdditions };
  }

  private checkDisclaimers(question: string, response: string): {
    missingDisclaimers: string[];
  } {
    const missingDisclaimers: string[] = [];

    // Check if discussing other religions
    if (question.toLowerCase().includes('islam') || 
        question.toLowerCase().includes('buddhism') ||
        question.toLowerCase().includes('hinduism')) {
      if (!response.includes('Christian perspective') && 
          !response.includes('biblical view')) {
        missingDisclaimers.push(
          'Add disclaimer: "This response represents a Christian biblical perspective."'
        );
      }
    }

    // Check for controversial topics
    const controversial = ['homosexuality', 'abortion', 'politics', 'evolution'];
    const hasControversial = controversial.some(topic => 
      question.toLowerCase().includes(topic)
    );

    if (hasControversial) {
      if (!response.includes('Christians hold different views') &&
          !response.includes('various interpretations')) {
        missingDisclaimers.push(
          'Add disclaimer: "Christians hold different biblical views on this topic."'
        );
      }
    }

    return { missingDisclaimers };
  }

  validateVerseFormat(reference: string): boolean {
    const pattern = /^[1-3]?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?$/;
    return pattern.test(reference);
  }

  async ensureVerseAccuracy(
    response: string,
    citedVerses: string[]
  ): Promise<boolean> {
    for (const reference of citedVerses) {
      const verse = await this.verseService.getVerseByReference(reference);
      if (!verse) {
        logger.warn(`Cited verse not found: ${reference}`);
        return false;
      }

      // Check if the verse content matches what's claimed in the response
      // This is a simplified check - could be enhanced with NLP
      const verseWords = verse.text.toLowerCase().split(/\s+/);
      const responseWords = response.toLowerCase().split(/\s+/);
      
      const hasRelevantContent = verseWords.some(word => 
        responseWords.includes(word) && word.length > 4
      );

      if (!hasRelevantContent) {
        logger.warn(`Verse ${reference} may not be relevant to the response`);
      }
    }

    return true;
  }
}