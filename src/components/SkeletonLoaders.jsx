/**
 * Loading Skeleton Components for AdminExams
 * Used during data fetching, CSV import, and image uploads
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated skeleton loader
 */
const SkeletonBase = ({ className = '' }) => (
  <motion.div
    className={`bg-white/[0.05] rounded ${className}`}
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/**
 * Question card skeleton
 */
export const QuestionCardSkeleton = () => (
  <div className="p-4 border border-white/10 bg-white/[0.02] rounded-2xl space-y-3">
    <div className="flex items-start gap-3">
      <SkeletonBase className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBase key={i} className="h-3" />
      ))}
    </div>
  </div>
);

/**
 * Form field skeleton
 */
export const FormFieldSkeleton = () => (
  <div className="space-y-2">
    <SkeletonBase className="h-3 w-24" />
    <SkeletonBase className="h-10 w-full rounded-lg" />
  </div>
);

/**
 * Modal skeleton with loading state
 */
export const ModalFormSkeleton = () => (
  <div className="space-y-4 p-6">
    {/* Header */}
    <div className="space-y-2 mb-6">
      <SkeletonBase className="h-6 w-1/2" />
      <SkeletonBase className="h-3 w-3/4" />
    </div>

    {/* Form fields */}
    {Array.from({ length: 5 }).map((_, i) => (
      <FormFieldSkeleton key={i} />
    ))}

    {/* Buttons */}
    <div className="flex gap-3 pt-4">
      <SkeletonBase className="h-10 flex-1 rounded-lg" />
      <SkeletonBase className="h-10 flex-1 rounded-lg" />
    </div>
  </div>
);

/**
 * Question list skeleton
 */
export const QuestionListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <QuestionCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * CSV import progress skeleton
 */
export const CSVImportSkeleton = () => (
  <div className="space-y-4">
    {/* Progress header */}
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-4 w-32" />
      <SkeletonBase className="h-4 w-16" />
    </div>

    {/* Progress bar */}
    <div className="space-y-2">
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <SkeletonBase className="h-full w-3/4" />
      </div>
      <SkeletonBase className="h-3 w-1/3" />
    </div>

    {/* Import stats */}
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBase key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  </div>
);

/**
 * Image upload skeleton
 */
export const ImageUploadSkeleton = () => (
  <div className="space-y-3">
    {/* Preview */}
    <SkeletonBase className="w-full aspect-video rounded-lg" />

    {/* Progress */}
    <div className="space-y-2">
      <SkeletonBase className="h-3 w-24" />
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <SkeletonBase className="h-full w-1/2" />
      </div>
    </div>

    {/* Status */}
    <SkeletonBase className="h-3 w-40" />
  </div>
);

/**
 * Exam list skeleton
 */
export const ExamListSkeleton = ({ count = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-3 border border-white/10 rounded-lg space-y-2">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

/**
 * Table skeleton
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className="border-b border-white/5">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className="p-3">
                <SkeletonBase className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Stats card skeleton
 */
export const StatsCardSkeleton = () => (
  <div className="p-4 border border-white/10 rounded-lg space-y-3">
    <SkeletonBase className="h-4 w-24" />
    <SkeletonBase className="h-8 w-32" />
    <SkeletonBase className="h-3 w-1/2" />
  </div>
);

/**
 * Upload area skeleton
 */
export const UploadAreaSkeleton = () => (
  <div className="p-8 border-2 border-dashed border-white/10 rounded-lg space-y-3">
    <SkeletonBase className="w-12 h-12 rounded mx-auto" />
    <SkeletonBase className="h-4 w-32 mx-auto" />
    <SkeletonBase className="h-3 w-40 mx-auto" />
  </div>
);

/**
 * Select dropdown skeleton
 */
export const SelectSkeleton = () => (
  <SkeletonBase className="h-10 w-full rounded-lg" />
);

/**
 * Multi-select skeleton
 */
export const MultiSelectSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonBase key={i} className="h-10 w-full rounded-lg" />
    ))}
  </div>
);

/**
 * Tabs skeleton
 */
export const TabsSkeleton = ({ tabs = 3 }) => (
  <div>
    <div className="flex gap-2 mb-4 border-b border-white/10">
      {Array.from({ length: tabs }).map((_, i) => (
        <SkeletonBase key={i} className="h-10 w-24" />
      ))}
    </div>
    <SkeletonBase className="h-32 w-full" />
  </div>
);

/**
 * Breadcrumb skeleton
 */
export const BreadcrumbSkeleton = () => (
  <div className="flex items-center gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <React.Fragment key={i}>
        <SkeletonBase className="h-3 w-24" />
        {i < 2 && <div className="w-1 h-1 bg-white/20 rounded-full" />}
      </React.Fragment>
    ))}
  </div>
);

/**
 * Modal header skeleton
 */
export const ModalHeaderSkeleton = () => (
  <div className="p-6 border-b border-white/10 space-y-2">
    <SkeletonBase className="h-6 w-1/2" />
    <SkeletonBase className="h-3 w-2/3" />
  </div>
);

/**
 * Loading overlay component
 */
export const LoadingOverlay = ({ isVisible = true, message = 'Yükleniyor...' }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center max-w-sm"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white/80 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

/**
 * Progress bar skeleton
 */
export const ProgressBarSkeleton = ({ value = 0, label = 'İlerleme' }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <span className="text-sm font-semibold text-white">{Math.round(value)}%</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-primary to-primary-light"
      />
    </div>
  </div>
);
