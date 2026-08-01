/**
 * useReducer Hook for AdminExams State Management
 * Consolidates 20+ useState into single, predictable state object
 */

import { useReducer, useCallback } from 'react';

/**
 * Initial state structure
 */
export const INITIAL_STATE = {
  // Data
  exams: [],
  questions: [],
  categories: [],
  
  // Loading states
  loading: {
    exams: false,
    questions: false,
    categories: false,
    csvImport: false,
    imageUpload: false,
    formSubmit: false,
  },

  // Error states
  errors: {
    exams: null,
    questions: null,
    categories: null,
    csvImport: null,
    imageUpload: null,
    formSubmit: null,
    form: {}, // Field-level validation errors
  },

  // UI states
  ui: {
    modalOpen: false,
    modalMode: null, // 'create', 'edit', 'copy'
    editingQuestionId: null,
    csvModalOpen: false,
    selectedExamId: null,
    selectedCategoryId: null,
    searchQuery: '',
    filterDifficulty: 'all',
    filterTestType: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  },

  // Form states
  form: {
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: '',
    coefficient: '1.0',
    media: '',
    subject: '',
    category: '',
    exam: '',
    testType: '',
  },

  // Image upload
  imageUpload: {
    file: null,
    preview: null,
    progress: 0,
    uploading: false,
    error: null,
  },

  // CSV import
  csvImport: {
    file: null,
    progress: 0,
    importing: false,
    results: {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: [],
    },
  },

  // Draft management
  draft: {
    exists: false,
    savedAt: null,
  },
};

/**
 * Action types
 */
export const ACTIONS = {
  // Data fetching
  FETCH_EXAMS_START: 'FETCH_EXAMS_START',
  FETCH_EXAMS_SUCCESS: 'FETCH_EXAMS_SUCCESS',
  FETCH_EXAMS_ERROR: 'FETCH_EXAMS_ERROR',

  FETCH_QUESTIONS_START: 'FETCH_QUESTIONS_START',
  FETCH_QUESTIONS_SUCCESS: 'FETCH_QUESTIONS_SUCCESS',
  FETCH_QUESTIONS_ERROR: 'FETCH_QUESTIONS_ERROR',

  FETCH_CATEGORIES_START: 'FETCH_CATEGORIES_START',
  FETCH_CATEGORIES_SUCCESS: 'FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_ERROR: 'FETCH_CATEGORIES_ERROR',

  // Modal/UI
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  OPEN_CSV_MODAL: 'OPEN_CSV_MODAL',
  CLOSE_CSV_MODAL: 'CLOSE_CSV_MODAL',

  // Form
  SET_FORM_FIELD: 'SET_FORM_FIELD',
  SET_FORM: 'SET_FORM',
  RESET_FORM: 'RESET_FORM',
  SET_FORM_ERROR: 'SET_FORM_ERROR',
  CLEAR_FORM_ERROR: 'CLEAR_FORM_ERROR',
  SET_FORM_ERRORS: 'SET_FORM_ERRORS',

  // Image upload
  SET_IMAGE_FILE: 'SET_IMAGE_FILE',
  SET_IMAGE_PREVIEW: 'SET_IMAGE_PREVIEW',
  SET_IMAGE_UPLOAD_PROGRESS: 'SET_IMAGE_UPLOAD_PROGRESS',
  IMAGE_UPLOAD_START: 'IMAGE_UPLOAD_START',
  IMAGE_UPLOAD_SUCCESS: 'IMAGE_UPLOAD_SUCCESS',
  IMAGE_UPLOAD_ERROR: 'IMAGE_UPLOAD_ERROR',

  // Form submission
  FORM_SUBMIT_START: 'FORM_SUBMIT_START',
  FORM_SUBMIT_SUCCESS: 'FORM_SUBMIT_SUCCESS',
  FORM_SUBMIT_ERROR: 'FORM_SUBMIT_ERROR',

  // CSV Import
  CSV_IMPORT_START: 'CSV_IMPORT_START',
  CSV_IMPORT_PROGRESS: 'CSV_IMPORT_PROGRESS',
  CSV_IMPORT_SUCCESS: 'CSV_IMPORT_SUCCESS',
  CSV_IMPORT_ERROR: 'CSV_IMPORT_ERROR',

  // Filters/Search
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTER_DIFFICULTY: 'SET_FILTER_DIFFICULTY',
  SET_FILTER_TEST_TYPE: 'SET_FILTER_TEST_TYPE',
  SET_SORT: 'SET_SORT',
  SET_SELECTED_EXAM: 'SET_SELECTED_EXAM',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',

  // Draft
  SET_DRAFT_EXISTS: 'SET_DRAFT_EXISTS',
  UPDATE_DRAFT_SAVED_TIME: 'UPDATE_DRAFT_SAVED_TIME',

  // General error
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Reducer function
 */
export const examsReducer = (state, action) => {
  switch (action.type) {
    // Data Fetching
    case ACTIONS.FETCH_EXAMS_START:
      return {
        ...state,
        loading: { ...state.loading, exams: true },
        errors: { ...state.errors, exams: null },
      };

    case ACTIONS.FETCH_EXAMS_SUCCESS:
      return {
        ...state,
        exams: action.payload,
        loading: { ...state.loading, exams: false },
        errors: { ...state.errors, exams: null },
      };

    case ACTIONS.FETCH_EXAMS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, exams: false },
        errors: { ...state.errors, exams: action.payload },
      };

    case ACTIONS.FETCH_QUESTIONS_START:
      return {
        ...state,
        loading: { ...state.loading, questions: true },
        errors: { ...state.errors, questions: null },
      };

    case ACTIONS.FETCH_QUESTIONS_SUCCESS:
      return {
        ...state,
        questions: action.payload,
        loading: { ...state.loading, questions: false },
        errors: { ...state.errors, questions: null },
      };

    case ACTIONS.FETCH_QUESTIONS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, questions: false },
        errors: { ...state.errors, questions: action.payload },
      };

    case ACTIONS.FETCH_CATEGORIES_START:
      return {
        ...state,
        loading: { ...state.loading, categories: true },
        errors: { ...state.errors, categories: null },
      };

    case ACTIONS.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        loading: { ...state.loading, categories: false },
        errors: { ...state.errors, categories: null },
      };

    case ACTIONS.FETCH_CATEGORIES_ERROR:
      return {
        ...state,
        loading: { ...state.loading, categories: false },
        errors: { ...state.errors, categories: action.payload },
      };

    // Modal/UI
    case ACTIONS.OPEN_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: true,
          modalMode: action.payload.mode,
          editingQuestionId: action.payload.questionId || null,
        },
      };

    case ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        ui: { ...state.ui, modalOpen: false, modalMode: null },
        form: { ...INITIAL_STATE.form },
        imageUpload: { ...INITIAL_STATE.imageUpload },
        errors: { ...state.errors, form: {} },
      };

    case ACTIONS.OPEN_CSV_MODAL:
      return {
        ...state,
        ui: { ...state.ui, csvModalOpen: true },
      };

    case ACTIONS.CLOSE_CSV_MODAL:
      return {
        ...state,
        ui: { ...state.ui, csvModalOpen: false },
        csvImport: { ...INITIAL_STATE.csvImport },
      };

    // Form
    case ACTIONS.SET_FORM_FIELD:
      return {
        ...state,
        form: { ...state.form, [action.payload.field]: action.payload.value },
        errors: { ...state.errors, form: { ...state.errors.form, [action.payload.field]: null } },
      };

    case ACTIONS.SET_FORM:
      return {
        ...state,
        form: action.payload,
        errors: { ...state.errors, form: {} },
      };

    case ACTIONS.RESET_FORM:
      return {
        ...state,
        form: { ...INITIAL_STATE.form },
        imageUpload: { ...INITIAL_STATE.imageUpload },
        errors: { ...state.errors, form: {}, formSubmit: null },
      };

    case ACTIONS.SET_FORM_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          form: {
            ...state.errors.form,
            [action.payload.field]: action.payload.error,
          },
        },
      };

    case ACTIONS.CLEAR_FORM_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          form: {
            ...state.errors.form,
            [action.payload]: null,
          },
        },
      };

    case ACTIONS.SET_FORM_ERRORS:
      return {
        ...state,
        errors: { ...state.errors, form: action.payload },
      };

    // Image Upload
    case ACTIONS.SET_IMAGE_FILE:
      return {
        ...state,
        imageUpload: { ...state.imageUpload, file: action.payload },
      };

    case ACTIONS.SET_IMAGE_PREVIEW:
      return {
        ...state,
        imageUpload: { ...state.imageUpload, preview: action.payload },
      };

    case ACTIONS.SET_IMAGE_UPLOAD_PROGRESS:
      return {
        ...state,
        imageUpload: { ...state.imageUpload, progress: action.payload },
      };

    case ACTIONS.IMAGE_UPLOAD_START:
      return {
        ...state,
        loading: { ...state.loading, imageUpload: true },
        imageUpload: { ...state.imageUpload, uploading: true, error: null, progress: 0 },
      };

    case ACTIONS.IMAGE_UPLOAD_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, imageUpload: false },
        imageUpload: {
          ...state.imageUpload,
          uploading: false,
          error: null,
          progress: 100,
        },
        form: { ...state.form, media: action.payload },
      };

    case ACTIONS.IMAGE_UPLOAD_ERROR:
      return {
        ...state,
        loading: { ...state.loading, imageUpload: false },
        imageUpload: { ...state.imageUpload, uploading: false, error: action.payload, progress: 0 },
      };

    // Form Submission
    case ACTIONS.FORM_SUBMIT_START:
      return {
        ...state,
        loading: { ...state.loading, formSubmit: true },
        errors: { ...state.errors, formSubmit: null },
      };

    case ACTIONS.FORM_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, formSubmit: false },
        errors: { ...state.errors, formSubmit: null },
        form: { ...INITIAL_STATE.form },
        ui: { ...state.ui, modalOpen: false },
      };

    case ACTIONS.FORM_SUBMIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, formSubmit: false },
        errors: { ...state.errors, formSubmit: action.payload },
      };

    // CSV Import
    case ACTIONS.CSV_IMPORT_START:
      return {
        ...state,
        loading: { ...state.loading, csvImport: true },
        csvImport: { ...state.csvImport, importing: true, progress: 0 },
        errors: { ...state.errors, csvImport: null },
      };

    case ACTIONS.CSV_IMPORT_PROGRESS:
      return {
        ...state,
        csvImport: { ...state.csvImport, progress: action.payload },
      };

    case ACTIONS.CSV_IMPORT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, csvImport: false },
        csvImport: { ...state.csvImport, importing: false, results: action.payload },
        errors: { ...state.errors, csvImport: null },
      };

    case ACTIONS.CSV_IMPORT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, csvImport: false },
        csvImport: { ...state.csvImport, importing: false },
        errors: { ...state.errors, csvImport: action.payload },
      };

    // Filters/Search
    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        ui: { ...state.ui, searchQuery: action.payload },
      };

    case ACTIONS.SET_FILTER_DIFFICULTY:
      return {
        ...state,
        ui: { ...state.ui, filterDifficulty: action.payload },
      };

    case ACTIONS.SET_FILTER_TEST_TYPE:
      return {
        ...state,
        ui: { ...state.ui, filterTestType: action.payload },
      };

    case ACTIONS.SET_SORT:
      return {
        ...state,
        ui: {
          ...state.ui,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder,
        },
      };

    case ACTIONS.SET_SELECTED_EXAM:
      return {
        ...state,
        ui: { ...state.ui, selectedExamId: action.payload },
      };

    case ACTIONS.SET_SELECTED_CATEGORY:
      return {
        ...state,
        ui: { ...state.ui, selectedCategoryId: action.payload },
      };

    // Draft
    case ACTIONS.SET_DRAFT_EXISTS:
      return {
        ...state,
        draft: { ...state.draft, exists: action.payload },
      };

    case ACTIONS.UPDATE_DRAFT_SAVED_TIME:
      return {
        ...state,
        draft: { ...state.draft, savedAt: action.payload },
      };

    // General Error
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.error },
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null },
      };

    default:
      return state;
  }
};

/**
 * Custom hook for ExamForm state management
 */
export const useExamsState = () => {
  const [state, dispatch] = useReducer(examsReducer, INITIAL_STATE);

  // Action creators
  const actions = {
    // Data fetching
    fetchExamsStart: useCallback(() => {
      dispatch({ type: ACTIONS.FETCH_EXAMS_START });
    }, []),
    fetchExamsSuccess: useCallback((exams) => {
      dispatch({ type: ACTIONS.FETCH_EXAMS_SUCCESS, payload: exams });
    }, []),
    fetchExamsError: useCallback((error) => {
      dispatch({ type: ACTIONS.FETCH_EXAMS_ERROR, payload: error });
    }, []),

    fetchQuestionsStart: useCallback(() => {
      dispatch({ type: ACTIONS.FETCH_QUESTIONS_START });
    }, []),
    fetchQuestionsSuccess: useCallback((questions) => {
      dispatch({ type: ACTIONS.FETCH_QUESTIONS_SUCCESS, payload: questions });
    }, []),
    fetchQuestionsError: useCallback((error) => {
      dispatch({ type: ACTIONS.FETCH_QUESTIONS_ERROR, payload: error });
    }, []),

    fetchCategoriesStart: useCallback(() => {
      dispatch({ type: ACTIONS.FETCH_CATEGORIES_START });
    }, []),
    fetchCategoriesSuccess: useCallback((categories) => {
      dispatch({ type: ACTIONS.FETCH_CATEGORIES_SUCCESS, payload: categories });
    }, []),
    fetchCategoriesError: useCallback((error) => {
      dispatch({ type: ACTIONS.FETCH_CATEGORIES_ERROR, payload: error });
    }, []),

    // Modal/UI
    openModal: useCallback((mode, questionId = null) => {
      dispatch({
        type: ACTIONS.OPEN_MODAL,
        payload: { mode, questionId },
      });
    }, []),
    closeModal: useCallback(() => {
      dispatch({ type: ACTIONS.CLOSE_MODAL });
    }, []),
    openCSVModal: useCallback(() => {
      dispatch({ type: ACTIONS.OPEN_CSV_MODAL });
    }, []),
    closeCSVModal: useCallback(() => {
      dispatch({ type: ACTIONS.CLOSE_CSV_MODAL });
    }, []),

    // Form
    setFormField: useCallback((field, value) => {
      dispatch({ type: ACTIONS.SET_FORM_FIELD, payload: { field, value } });
    }, []),
    setForm: useCallback((form) => {
      dispatch({ type: ACTIONS.SET_FORM, payload: form });
    }, []),
    resetForm: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_FORM });
    }, []),
    setFormError: useCallback((field, error) => {
      dispatch({ type: ACTIONS.SET_FORM_ERROR, payload: { field, error } });
    }, []),
    clearFormError: useCallback((field) => {
      dispatch({ type: ACTIONS.CLEAR_FORM_ERROR, payload: field });
    }, []),
    setFormErrors: useCallback((errors) => {
      dispatch({ type: ACTIONS.SET_FORM_ERRORS, payload: errors });
    }, []),

    // Image upload
    setImageFile: useCallback((file) => {
      dispatch({ type: ACTIONS.SET_IMAGE_FILE, payload: file });
    }, []),
    setImagePreview: useCallback((preview) => {
      dispatch({ type: ACTIONS.SET_IMAGE_PREVIEW, payload: preview });
    }, []),
    setImageUploadProgress: useCallback((progress) => {
      dispatch({ type: ACTIONS.SET_IMAGE_UPLOAD_PROGRESS, payload: progress });
    }, []),
    imageUploadStart: useCallback(() => {
      dispatch({ type: ACTIONS.IMAGE_UPLOAD_START });
    }, []),
    imageUploadSuccess: useCallback((url) => {
      dispatch({ type: ACTIONS.IMAGE_UPLOAD_SUCCESS, payload: url });
    }, []),
    imageUploadError: useCallback((error) => {
      dispatch({ type: ACTIONS.IMAGE_UPLOAD_ERROR, payload: error });
    }, []),

    // Form submission
    formSubmitStart: useCallback(() => {
      dispatch({ type: ACTIONS.FORM_SUBMIT_START });
    }, []),
    formSubmitSuccess: useCallback(() => {
      dispatch({ type: ACTIONS.FORM_SUBMIT_SUCCESS });
    }, []),
    formSubmitError: useCallback((error) => {
      dispatch({ type: ACTIONS.FORM_SUBMIT_ERROR, payload: error });
    }, []),

    // CSV Import
    csvImportStart: useCallback(() => {
      dispatch({ type: ACTIONS.CSV_IMPORT_START });
    }, []),
    csvImportProgress: useCallback((progress) => {
      dispatch({ type: ACTIONS.CSV_IMPORT_PROGRESS, payload: progress });
    }, []),
    csvImportSuccess: useCallback((results) => {
      dispatch({ type: ACTIONS.CSV_IMPORT_SUCCESS, payload: results });
    }, []),
    csvImportError: useCallback((error) => {
      dispatch({ type: ACTIONS.CSV_IMPORT_ERROR, payload: error });
    }, []),

    // Filters/Search
    setSearchQuery: useCallback((query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),
    setFilterDifficulty: useCallback((difficulty) => {
      dispatch({ type: ACTIONS.SET_FILTER_DIFFICULTY, payload: difficulty });
    }, []),
    setFilterTestType: useCallback((testType) => {
      dispatch({ type: ACTIONS.SET_FILTER_TEST_TYPE, payload: testType });
    }, []),
    setSort: useCallback((sortBy, sortOrder) => {
      dispatch({ type: ACTIONS.SET_SORT, payload: { sortBy, sortOrder } });
    }, []),
    setSelectedExam: useCallback((examId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_EXAM, payload: examId });
    }, []),
    setSelectedCategory: useCallback((categoryId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_CATEGORY, payload: categoryId });
    }, []),

    // Draft
    setDraftExists: useCallback((exists) => {
      dispatch({ type: ACTIONS.SET_DRAFT_EXISTS, payload: exists });
    }, []),
    updateDraftSavedTime: useCallback((time) => {
      dispatch({ type: ACTIONS.UPDATE_DRAFT_SAVED_TIME, payload: time });
    }, []),

    // General error
    setError: useCallback((key, error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: { key, error } });
    }, []),
    clearError: useCallback((key) => {
      dispatch({ type: ACTIONS.CLEAR_ERROR, payload: key });
    }, []),
  };

  return { state, dispatch, ...actions };
};
