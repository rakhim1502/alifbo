/**
 * O'zbek Alifbo Konvertori — Validator module
 * Input validation va error handling
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Matn input validation
 */
export function validateInput(text: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Type check
  if (typeof text !== 'string') {
    errors.push('Input must be a string');
    return { valid: false, errors, warnings };
  }
  
  // Empty check
  if (text.trim().length === 0) {
    warnings.push('Input is empty');
  }
  
  // Size limit (10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (text.length > MAX_SIZE) {
    errors.push(`Input too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
  }
  
  // Warning for very large inputs
  const WARNING_SIZE = 1 * 1024 * 1024;
  if (text.length > WARNING_SIZE) {
    warnings.push('Large input may take longer to process');
  }
  
  // Check for null bytes
  if (text.includes('\0')) {
    errors.push('Input contains null bytes');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Fayl validation
 */
export function validateFile(file: File | null): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors, warnings };
  }
  
  // Size limit (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  // Type check
  const validTypes = ['text/plain', 'text/html', 'text/markdown', 'application/json'];
  const validExtensions = ['.txt', '.text', '.md', '.json'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    errors.push('Invalid file type. Supported: TXT, MD, JSON');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Output validation
 */
export function validateOutput(text: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof text !== 'string') {
    errors.push('Output must be a string');
    return { valid: false, errors, warnings };
  }
  
  // Check for placeholder leaks
  if (text.includes('\x00')) {
    errors.push('Output contains internal placeholders');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
