/**
 * Image Upload Utilities with Retry Logic and Progress Tracking
 */

import { retryWithBackoff, getErrorMessage } from './apiErrorHandler';

const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxRetries: 3,
  initialDelayMs: 1000,
  timeoutMs: 60000,
};

/**
 * Validates image file before upload
 * @param {File} file - File object
 * @param {Object} config - Configuration
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateImageFile = (file, config = {}) => {
  const cfg = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  if (!file) {
    return { isValid: false, error: 'Dosya seçilmedi' };
  }

  if (!cfg.allowedTypes.includes(file.type)) {
    const validTypes = cfg.allowedTypes.map(t => t.split('/')[1]).join(', ');
    return {
      isValid: false,
      error: `Geçersiz dosya türü. Lütfen ${validTypes} formatında resim yükleyiniz.`,
    };
  }

  if (file.size > cfg.maxFileSize) {
    const sizeMB = (cfg.maxFileSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Dosya çok büyük. Maksimum ${sizeMB}MB olabilir (${fileSizeMB}MB)`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Generates image preview from file
 * @param {File} file - Image file
 * @returns {Promise<string>} Data URL for preview
 */
export const generateImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Dosya gerekli'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        resolve(e.target.result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compresses image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Resim yüklenemedi'));
        };

        img.src = e.target.result;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Uploads image to server with retry logic
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<{success: boolean, url: string, error: string | null}>}
 */
export const uploadImage = async (file, options = {}) => {
  const { apiEndpoint = '/api/upload', onProgress, config = {} } = options;
  const cfg = { ...DEFAULT_UPLOAD_CONFIG, ...config };

  // Validate file
  const validation = validateImageFile(file, cfg);
  if (!validation.isValid) {
    return { success: false, url: '', error: validation.error };
  }

  try {
    // Optionally compress image
    let fileToUpload = file;
    if (options.compress) {
      onProgress?.(10);
      fileToUpload = await compressImage(file, options.compressionOptions);
      onProgress?.(15);
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', fileToUpload);
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    // Upload with retry and timeout
    let uploadedUrl = '';

    const uploadResult = await retryWithBackoff(
      async () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          let isResolved = false;

          // Timeout handling
          const timeoutId = setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              xhr.abort();
              reject(new Error(`Upload timeout (${cfg.timeoutMs}ms)`));
            }
          }, cfg.timeoutMs);

          // Progress tracking
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 70) + 15; // Scale to 15-85%
              onProgress?.(percentComplete);
            }
          });

          // Success handler
          xhr.addEventListener('load', () => {
            clearTimeout(timeoutId);
            if (isResolved) return;
            isResolved = true;

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                uploadedUrl = response.url || response.data?.url;
                if (!uploadedUrl) {
                  throw new Error('No URL in response');
                }
                onProgress?.(90);
                resolve(response);
              } catch (error) {
                reject(new Error('Invalid response format'));
              }
            } else {
              const error = new Error(`Upload failed with status ${xhr.status}`);
              error.response = { status: xhr.status, data: xhr.responseText };
              reject(error);
            }
          });

          // Error handlers
          xhr.addEventListener('error', () => {
            clearTimeout(timeoutId);
            if (isResolved) return;
            isResolved = true;
            reject(new Error('Network error'));
          });

          xhr.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            if (isResolved) return;
            isResolved = true;
            reject(new Error('Upload cancelled'));
          });

          // Execute upload
          try {
            xhr.open('POST', apiEndpoint);
            xhr.send(formData);
          } catch (error) {
            clearTimeout(timeoutId);
            isResolved = true;
            reject(error);
          }
        });
      },
      {
        maxRetries: cfg.maxRetries,
        initialDelayMs: cfg.initialDelayMs,
        backoffMultiplier: 2,
      }
    );

    onProgress?.(100);

    return {
      success: true,
      url: uploadedUrl,
      error: null,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('Image upload failed:', error);

    return {
      success: false,
      url: '',
      error: errorMessage,
    };
  }
};

/**
 * Uploads multiple images in parallel with concurrency control
 * @param {File[]} files - Array of image files
 * @param {Object} options - Upload options
 * @param {number} options.concurrency - Max concurrent uploads (default: 3)
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  const { concurrency = 3, onProgress } = options;
  const results = [];

  // Process files in batches
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map((file, idx) =>
        uploadImage(file, {
          ...options,
          onProgress: (progress) => {
            onProgress?.({
              fileIndex: i + idx,
              progress,
              fileName: file.name,
            });
          },
        })
      )
    );

    results.push(...batchResults);
  }

  return results;
};

/**
 * Validates image URL by checking if it's accessible
 * @param {string} url - Image URL
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<boolean>}
 */
export const validateImageUrl = (url, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, timeoutMs);

    const img = new Image();

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };

    try {
      img.src = url;
    } catch {
      clearTimeout(timeoutId);
      resolve(false);
    }
  });
};

/**
 * Gets image dimensions
 * @param {string} url - Image URL or data URL
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    try {
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};
