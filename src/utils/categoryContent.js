export const VIDEO_CATEGORY_MARKER = '@[video_category]';
export const VIDEO_REGEX = /@\[video\]\((.*?)\)/;

export const isVideoCategory = (category) =>
  Boolean(category?.content?.includes(VIDEO_CATEGORY_MARKER));

export const isVideoCourse = (category) =>
  Boolean(category?.content && VIDEO_REGEX.test(category.content));

export const isVideoRecord = (category) =>
  isVideoCategory(category) || isVideoCourse(category);

export const getVideoUrl = (category) =>
  category?.content?.match(VIDEO_REGEX)?.[1]?.trim() || '';

export const getVideoNotes = (category) =>
  (category?.content || '').replace(VIDEO_REGEX, '').trim();

export const limitQuoteText = (text, maxLength = 350) => {
  const trimmed = String(text || '').trim();
  return trimmed.length > maxLength
    ? trimmed.slice(0, maxLength).trimEnd()
    : trimmed;
};
