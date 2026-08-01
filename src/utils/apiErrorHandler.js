/**
 * API Error Handler with Retry Logic
 * Handles API errors, retries with exponential backoff, and provides user-friendly messages
 */

const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/**
 * Calculates delay with exponential backoff
 * @param {number} retryCount - Current retry attempt (0-based)
 * @param {number} initialDelayMs - Initial delay in milliseconds
 * @param {number} backoffMultiplier - Multiplier for exponential backoff
 * @param {number} maxDelayMs - Maximum delay cap
 * @returns {number} Delay in milliseconds
 */
const calculateBackoffDelay = (
  retryCount,
  initialDelayMs = 1000,
  backoffMultiplier = 2,
  maxDelayMs = 10000
) => {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, retryCount);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = exponentialDelay * (0.8 + Math.random() * 0.4);
  return Math.min(jitter, maxDelayMs);
};

/**
 * Determines if an error is retryable
 * @param {Error|Object} error - The error object
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  // Network errors
  if (error.message === 'Network Error' || error.message === 'timeout of') {
    return true;
  }

  // HTTP status codes that are retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  if (error.response?.status && retryableStatuses.includes(error.response.status)) {
    return true;
  }

  // Connection refused, etc.
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
};

/**
 * Extracts user-friendly error message from API error
 * @param {Error|Object} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Custom error message
  if (error?.message) {
    // Network errors
    if (error.message === 'Network Error') {
      return 'İnternet bağlantısında sorun var. Lütfen kontrol ediniz.';
    }
    if (error.message.includes('timeout')) {
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    }
  }

  // API response error
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // HTTP status codes
  if (error?.response?.status) {
    const status = error.response.status;
    const statusMessages = {
      400: 'Geçersiz istek. Lütfen bilgilerinizi kontrol ediniz.',
      401: 'Oturum açmanız gerekli. Lütfen yeniden giriş yapınız.',
      403: 'Bu işlemi gerçekleştirme izni yok.',
      404: 'İstenen kaynak bulunamadı.',
      408: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
      409: 'Bu kayıt zaten mevcut.',
      429: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
      500: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      502: 'Geçici sunucu hatası. Lütfen tekrar deneyin.',
      503: 'Sunucu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      504: 'Sunucu zaman aşımına uğradı. Lütfen tekrar deneyin.',
    };
    return statusMessages[status] || `Sunucu hatası: ${status}`;
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

/**
 * Executes an async function with retry logic and exponential backoff
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry configuration
 * @param {number} options.maxRetries - Maximum retry attempts
 * @param {number} options.initialDelayMs - Initial delay between retries
 * @param {number} options.backoffMultiplier - Exponential backoff multiplier
 * @param {number} options.maxDelayMs - Maximum delay between retries
 * @param {Function} options.onRetry - Callback on retry attempt
 * @returns {Promise} Result of the function
 * @throws {Error} The last error if all retries fail
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => api.post('/exams', data),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, delay) => console.log(`Retry ${attempt} in ${delay}ms`)
 *   }
 * );
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay and call onRetry callback
      const delay = calculateBackoffDelay(
        attempt,
        config.initialDelayMs,
        config.backoffMultiplier,
        config.maxDelayMs
      );

      if (config.onRetry) {
        config.onRetry(attempt + 1, delay, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper for API calls with error handling and retry logic
 * @param {Function} apiCall - The API call function
 * @param {string} operationName - Name of the operation for error reporting
 * @param {Object} options - Options including retry config
 * @returns {Promise<{success: boolean, data: any, error: string | null}>}
 */
export const executeAPICall = async (apiCall, operationName = 'İşlem', options = {}) => {
  try {
    const result = await retryWithBackoff(apiCall, {
      maxRetries: options.maxRetries ?? 3,
      initialDelayMs: options.initialDelayMs ?? 1000,
      onRetry: (attempt, delay) => {
        console.warn(
          `[${operationName}] Retry attempt ${attempt} in ${Math.round(delay)}ms`,
          `Previous error:`,
          options.lastError
        );
      },
    });

    return { success: true, data: result, error: null };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`[${operationName}] Failed after retries:`, error);

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * Handles file upload with retry logic and progress tracking
 * @param {File} file - File to upload
 * @param {Function} uploadFn - Upload function that returns Promise
 * @param {Object} options - Options
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @param {number} options.maxRetries - Max retry attempts
 * @returns {Promise<{success: boolean, data: any, error: string | null}>}
 */
export const uploadFileWithRetry = async (file, uploadFn, options = {}) => {
  const { onProgress, maxRetries = 3 } = options;

  try {
    onProgress?.(0);

    // Use XMLHttpRequest for better progress tracking
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress?.(percentComplete);
        }
      });

      // Completion handling
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            onProgress?.(100);
            resolve({ success: true, data: response, error: null });
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Error handling
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Execute upload function with retry
      retryWithBackoff(() => uploadFn(xhr, file), { maxRetries }).catch(reject);
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('File upload failed:', error);

    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
};

/**
 * Creates a timeout promise that rejects after specified milliseconds
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise}
 */
export const createTimeoutPromise = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
};

/**
 * Race between a promise and a timeout
 * @param {Promise} promise - Promise to race
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise}
 */
export const raceWithTimeout = (promise, timeoutMs = 30000) => {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
};

/**
 * Creates a debounced version of an async function
 * @param {Function} fn - Async function to debounce
 * @param {number} delayMs - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceAsync = (fn, delayMs = 300) => {
  let timeoutId;
  let lastResult;

  return async function debounced(...args) {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          lastResult = await fn(...args);
          resolve(lastResult);
        } catch (error) {
          resolve({ success: false, error: getErrorMessage(error) });
        }
      }, delayMs);
    });
  };
};
