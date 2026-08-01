/**
 * Improved CSV Parser for AdminExams
 * Handles malformed CSV, encoding issues, and provides detailed error reporting
 */

import { validateCSVRow, validateCSVHeaders } from './formValidation';

/**
 * Parses CSV content with error handling
 * @param {string} csvContent - Raw CSV content
 * @returns {Object} { success: boolean, data: Array, errors: Array, warnings: Array }
 */
export const parseCSV = (csvContent) => {
  const errors = [];
  const warnings = [];
  const data = [];

  try {
    // Normalize line endings
    const normalized = csvContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    if (!normalized) {
      return { success: false, data: [], errors: ['CSV dosyası boş'], warnings: [] };
    }

    const lines = normalized.split('\n');

    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        errors: ['CSV dosyasında en az başlık ve bir veri satırı olmalı'],
        warnings: [],
      };
    }

    // Parse headers
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);

    if (headers.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['CSV başlık satırı boş veya geçersiz'],
        warnings: [],
      };
    }

    // Validate headers
    const headerValidation = validateCSVHeaders(headers);
    if (!headerValidation.isValid) {
      return {
        success: false,
        data: [],
        errors: [headerValidation.error],
        warnings: [],
      };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        continue;
      }

      try {
        const values = parseCSVLine(line);

        if (values.length === 0) {
          warnings.push(`Satır ${i + 1}: Boş satır atlandı`);
          continue;
        }

        // Map values to headers
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        // Validate row
        const rowValidation = validateCSVRow(row, i);
        if (!rowValidation.isValid) {
          errors.push(rowValidation.error);
          continue;
        }

        // Transform correctAnswer from 1-based to 0-based index
        const correctAnswerIndex = parseInt(row.correctAnswer, 10) - 1;

        // Build question object
        const question = {
          text: row.text.trim(),
          options: [row.option1, row.option2, row.option3, row.option4]
            .filter(Boolean)
            .map(opt => opt.trim()),
          correctAnswer: correctAnswerIndex,
          difficulty: row.difficulty.toLowerCase(),
          explanation: row.explanation?.trim() || '',
          coefficient: parseFloat(row.coefficient) || 1.0,
          media: row.media?.trim() || '',
        };

        data.push(question);
      } catch (lineError) {
        errors.push(`Satır ${i + 1}: ${lineError.message}`);
      }
    }

    // Check if we parsed any data
    if (data.length === 0 && errors.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['CSV dosyasında geçerli veri satırı bulunamadı'],
        warnings,
      };
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [`CSV ayrıştırma hatası: ${error.message}`],
      warnings: [],
    };
  }
};

/**
 * Parses a single CSV line handling quoted fields and escaped characters
 * @param {string} line - CSV line
 * @returns {Array<string>} Parsed fields
 *
 * Handles:
 * - Quoted fields with commas: "field with, comma"
 * - Escaped quotes: "field with \" quote"
 * - Empty fields
 * - Different quote styles
 */
const parseCSVLine = (line) => {
  if (!line || typeof line !== 'string') {
    return [];
  }

  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add last field
  fields.push(current.trim());

  return fields.filter(f => f !== ''); // Remove completely empty fields
};

/**
 * Validates CSV file size and type before parsing
 * @param {File} file - File object
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateCSVFile = (file, options = {}) => {
  const { maxSizeMB = 10, allowedTypes = ['text/csv', 'application/vnd.ms-excel'] } = options;

  if (!file) {
    return { isValid: false, error: 'Dosya seçilmedi' };
  }

  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Geçersiz dosya türü. Lütfen CSV dosyası yükleyiniz.',
    };
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      isValid: false,
      error: 'Dosya .csv uzantısına sahip olmalıdır',
    };
  }

  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeMB) {
    return {
      isValid: false,
      error: `Dosya çok büyük. Maksimum ${maxSizeMB}MB olabilir (${fileSizeInMB.toFixed(2)}MB)`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Reads CSV file and returns content
 * @param {File} file - File object
 * @returns {Promise<{success: boolean, content: string, error: string | null}>}
 */
export const readCSVFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // Handle different encodings
        if (!content || typeof content !== 'string') {
          return resolve({
            success: false,
            content: '',
            error: 'Dosya içeriği okunamadı',
          });
        }

        resolve({ success: true, content, error: null });
      } catch (error) {
        resolve({
          success: false,
          content: '',
          error: `Dosya okuma hatası: ${error.message}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        content: '',
        error: 'Dosya okunamadı. Lütfen tekrar deneyin.',
      });
    };

    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Complete CSV import workflow
 * @param {File} file - CSV file
 * @param {Object} options - Options for validation and parsing
 * @returns {Promise<{success: boolean, data: Array, summary: Object, errors: Array}>}
 */
export const importCSV = async (file, options = {}) => {
  // Validate file
  const fileValidation = validateCSVFile(file, options.fileValidation);
  if (!fileValidation.isValid) {
    return {
      success: false,
      data: [],
      summary: { total: 0, valid: 0, invalid: 0 },
      errors: [fileValidation.error],
    };
  }

  // Read file
  const fileRead = await readCSVFile(file);
  if (!fileRead.success) {
    return {
      success: false,
      data: [],
      summary: { total: 0, valid: 0, invalid: 0 },
      errors: [fileRead.error],
    };
  }

  // Parse CSV
  const parseResult = parseCSV(fileRead.content);

  return {
    success: parseResult.success,
    data: parseResult.data,
    summary: {
      total: parseResult.data.length + parseResult.errors.length,
      valid: parseResult.data.length,
      invalid: parseResult.errors.length,
      warnings: parseResult.warnings.length,
    },
    errors: parseResult.errors,
    warnings: parseResult.warnings,
  };
};

/**
 * Generates CSV template with example data
 * @returns {string} CSV content
 */
export const generateCSVTemplate = () => {
  const headers = ['text', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'difficulty', 'explanation', 'coefficient', 'media'];
  const examples = [
    [
      'Emniyet şeridi nedir?',
      'Sol şerit',
      'Sağ şerit',
      'Orta şerit',
      'Acil durum şeridi',
      '4',
      'easy',
      'Sağ kenardaki şerit acil durumlara ayrılmıştır.',
      '1.0',
      '',
    ],
    [
      'Hız limiti şehir içinde nedir?',
      '30 km/h',
      '50 km/h',
      '70 km/h',
      '90 km/h',
      '2',
      'medium',
      'Şehir içinde yasal hız limiti 50 km/h dir.',
      '1.5',
      '',
    ],
  ];

  const rows = [headers, ...examples].map(row =>
    row.map(cell => {
      // Quote fields that contain commas or quotes
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );

  return rows.join('\n');
};

/**
 * Downloads CSV template
 */
export const downloadCSVTemplate = () => {
  const content = generateCSVTemplate();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'soru-template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
