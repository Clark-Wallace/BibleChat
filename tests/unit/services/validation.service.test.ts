import { ValidationService } from '../../../src/services/ai/validation.service';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateBibleReference', () => {
    it('should validate correct Bible references', () => {
      const validReferences = [
        'John 3:16',
        'Genesis 1:1',
        'Revelation 22:21',
        'Psalm 23:1',
        '1 Corinthians 13:4',
        '2 Timothy 3:16',
        'Matthew 5:3-12',
        'Romans 8:28-39'
      ];

      validReferences.forEach(ref => {
        expect(validationService.validateBibleReference(ref)).toBe(true);
      });
    });

    it('should reject invalid Bible references', () => {
      const invalidReferences = [
        'Invalid 1:1',
        'John 100:1', // Chapter too high
        'Genesis 1:1000', // Verse too high
        'NotABook 1:1',
        '1 Nonexistent 1:1',
        '',
        'John',
        '3:16'
      ];

      invalidReferences.forEach(ref => {
        expect(validationService.validateBibleReference(ref)).toBe(false);
      });
    });
  });

  describe('extractBibleReferences', () => {
    it('should extract Bible references from text', () => {
      const text = 'As it says in John 3:16, God loved the world. Also see Romans 8:28.';
      const references = validationService.extractBibleReferences(text);
      
      expect(references).toContain('John 3:16');
      expect(references).toContain('Romans 8:28');
      expect(references.length).toBe(2);
    });

    it('should extract complex references', () => {
      const text = 'Read 1 Corinthians 13:4-7 and 2 Timothy 3:16-17 for more.';
      const references = validationService.extractBibleReferences(text);
      
      expect(references).toContain('1 Corinthians 13:4-7');
      expect(references).toContain('2 Timothy 3:16-17');
    });

    it('should handle text with no references', () => {
      const text = 'This text has no Bible references.';
      const references = validationService.extractBibleReferences(text);
      
      expect(references).toEqual([]);
    });
  });

  describe('validateTheologicalAccuracy', () => {
    it('should validate theologically accurate statements', async () => {
      const accurateStatements = [
        { text: 'God is love', expectation: true },
        { text: 'Jesus died for our sins', expectation: true },
        { text: 'The Bible teaches us to love our neighbors', expectation: true }
      ];

      for (const statement of accurateStatements) {
        const result = await validationService.validateTheologicalAccuracy(statement.text);
        expect(result.isValid).toBe(statement.expectation);
      }
    });

    it('should flag potentially problematic content', async () => {
      const problematicStatements = [
        'The Bible says money is the root of all evil', // Misquote
        'God helps those who help themselves', // Not in Bible
        'Cleanliness is next to godliness' // Not in Bible
      ];

      for (const statement of problematicStatements) {
        const result = await validationService.validateTheologicalAccuracy(statement);
        expect(result.warnings).toBeDefined();
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('sanitizeResponse', () => {
    it('should sanitize responses with fake verses', () => {
      const response = 'As it says in Imaginary 1:1, "This is not real."';
      const sanitized = validationService.sanitizeResponse(response);
      
      expect(sanitized).not.toContain('Imaginary 1:1');
      expect(sanitized).toContain('[Reference removed - not found in Scripture]');
    });

    it('should preserve valid references', () => {
      const response = 'As John 3:16 says, "For God so loved the world..."';
      const sanitized = validationService.sanitizeResponse(response);
      
      expect(sanitized).toContain('John 3:16');
    });
  });

  describe('detectFabricatedContent', () => {
    it('should detect obviously fabricated verses', () => {
      const fabricated = [
        '"God helps those who help themselves" - Benjamin 4:20',
        'As it says in Hesitations 3:14',
        'The Book of Trump says...'
      ];

      fabricated.forEach(text => {
        expect(validationService.detectFabricatedContent(text)).toBe(true);
      });
    });

    it('should not flag legitimate content', () => {
      const legitimate = [
        'John 3:16 tells us about God\'s love',
        'In the beginning (Genesis 1:1)',
        'Paul writes in Romans 8:28'
      ];

      legitimate.forEach(text => {
        expect(validationService.detectFabricatedContent(text)).toBe(false);
      });
    });
  });
});