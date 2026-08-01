/**
 * Form Validation Utilities for AdminExams
 * Handles question form validation with detailed error messages
 */

export const VALIDATION_RULES = {
  QUESTION_TEXT_MIN: 5,
  QUESTION_TEXT_MAX: 500,
  OPTION_MIN: 2,
  OPTION_MAX: 300,
  EXPLANATION_MAX: 1000,
  COEFFICIENT_MIN: 0.5,
  COEFFICIENT_MAX: 5.0,
};

/**
 * Validates question form data
 * @param {Object} form - Form data object
 * @param {string} form.text - Question text
 * @param {Array<string>} form.options - Answer options
 * @param {number} form.correctAnswer - Index of correct answer
 * @param {string} form.difficulty - Difficulty level
 * @param {string} form.explanation - Explanation text
 * @param {string} form.coefficient - Coefficient value
 * @param {string} form.exam - Exam ID
 * @param {string} form.category - Category ID
 * @returns {Object} { isValid: boolean, errors: Object<string, string> }
 */
export const validateQuestionForm = (form) => {
  const errors = {};

  // Question text validation
  if (!form.text || !form.text.trim()) {
    errors.text = 'Soru metni zorunludur';
  } else if (form.text.trim().length < VALIDATION_RULES.QUESTION_TEXT_MIN) {
    errors.text = `Soru metni en az ${VALIDATION_RULES.QUESTION_TEXT_MIN} karakter olmalıdır`;
  } else if (form.text.trim().length > VALIDATION_RULES.QUESTION_TEXT_MAX) {
    errors.text = `Soru metni en fazla ${VALIDATION_RULES.QUESTION_TEXT_MAX} karakter olabilir`;
  }

  // Options validation
  if (!Array.isArray(form.options) || form.options.length < 2) {
    errors.options = 'En az 2 şık gereklidir';
  } else {
    const nonEmptyOptions = form.options.filter(opt => opt && opt.trim());
    if (nonEmptyOptions.length < 2) {
      errors.options = 'En az 2 dolu şık gereklidir';
    }

    // Check each option length
    form.options.forEach((opt, idx) => {
      if (opt && opt.trim().length > VALIDATION_RULES.OPTION_MAX) {
        errors[`option_${idx}`] = `Şık ${idx + 1} en fazla ${VALIDATION_RULES.OPTION_MAX} karakter olabilir`;
      }
    });
  }

  // Correct answer validation
  const validAnswerIndex = typeof form.correctAnswer === 'number' && form.correctAnswer >= 0;
  if (!validAnswerIndex) {
    errors.correctAnswer = 'Lütfen doğru cevabı seçiniz';
  } else if (form.correctAnswer >= form.options.length) {
    errors.correctAnswer = 'Doğru cevap indeksi geçersiz';
  } else if (!form.options[form.correctAnswer] || !form.options[form.correctAnswer].trim()) {
    errors.correctAnswer = 'Seçilen doğru cevap boş olamaz';
  }

  // Difficulty validation
  if (!['easy', 'medium', 'hard'].includes(form.difficulty)) {
    errors.difficulty = 'Geçersiz zorluk seviyesi';
  }

  // Explanation validation (optional but check length if provided)
  if (form.explanation && form.explanation.length > VALIDATION_RULES.EXPLANATION_MAX) {
    errors.explanation = `Açıklama en fazla ${VALIDATION_RULES.EXPLANATION_MAX} karakter olabilir`;
  }

  // Coefficient validation
  if (form.coefficient) {
    const coeff = parseFloat(form.coefficient);
    if (isNaN(coeff)) {
      errors.coefficient = 'Katsayı sayısal olmalıdır';
    } else if (coeff < VALIDATION_RULES.COEFFICIENT_MIN || coeff > VALIDATION_RULES.COEFFICIENT_MAX) {
      errors.coefficient = `Katsayı ${VALIDATION_RULES.COEFFICIENT_MIN} ile ${VALIDATION_RULES.COEFFICIENT_MAX} arasında olmalıdır`;
    }
  }

  // Exam validation
  if (!form.exam || !form.exam.trim()) {
    errors.exam = 'Sınav seçimi zorunludur';
  }

  // Category validation
  if (!form.category || !form.category.trim()) {
    errors.category = 'Kategori seçimi zorunludur';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates CSV row data
 * @param {Object} row - CSV row object
 * @param {number} rowIndex - Row index (for error reporting)
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateCSVRow = (row, rowIndex) => {
  const lineNum = rowIndex + 2; // +2 because header is row 1, data starts at row 2

  if (!row.text || !row.text.trim()) {
    return { isValid: false, error: `Satır ${lineNum}: Soru metni boş` };
  }

  if (row.text.trim().length > VALIDATION_RULES.QUESTION_TEXT_MAX) {
    return { isValid: false, error: `Satır ${lineNum}: Soru metni çok uzun (max ${VALIDATION_RULES.QUESTION_TEXT_MAX})` };
  }

  // Parse options
  const options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
  if (options.length < 2) {
    return { isValid: false, error: `Satır ${lineNum}: En az 2 şık gerekli` };
  }

  // Validate correctAnswer
  const correctAnswerStr = String(row.correctAnswer || '').trim();
  if (!correctAnswerStr) {
    return { isValid: false, error: `Satır ${lineNum}: Doğru cevap indeksi boş` };
  }

  const correctAnswer = parseInt(correctAnswerStr, 10);
  if (isNaN(correctAnswer) || correctAnswer < 1 || correctAnswer > options.length) {
    return {
      isValid: false,
      error: `Satır ${lineNum}: Doğru cevap 1-${options.length} arasında olmalı (aldığı değer: ${correctAnswerStr})`,
    };
  }

  // Validate difficulty
  if (!['easy', 'medium', 'hard'].includes(row.difficulty?.toLowerCase())) {
    return { isValid: false, error: `Satır ${lineNum}: Zorluk (easy|medium|hard) geçersiz: ${row.difficulty}` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates CSV headers
 * @param {Array<string>} headers - CSV header row
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateCSVHeaders = (headers) => {
  const required = ['text', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'difficulty'];
  const missing = required.filter(h => !headers.includes(h));

  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Gerekli sütunlar eksik: ${missing.join(', ')}`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Gets human-readable error message for a specific field
 * @param {string} field - Field name
 * @param {Object} errors - Validation errors object
 * @returns {string | null} Error message or null
 */
export const getFieldError = (field, errors) => {
  return errors[field] || null;
};

/**
 * Checks if form has any errors
 * @param {Object} errors - Errors object
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Clears specific field error
 * @param {string} field - Field name
 * @param {Object} errors - Current errors object
 * @returns {Object} New errors object without the field error
 */
export const clearFieldError = (field, errors) => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};
