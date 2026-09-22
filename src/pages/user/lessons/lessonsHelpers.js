export const stripMarkdownForSpeech = (input = '') =>
  String(input)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

export const chunkSpeechText = (text, maxLength = 180) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let current = '';

  for (const word of words) {
    if (!word) continue;

    if (!current) {
      current = word;
      continue;
    }

    if ((current + ' ' + word).length > maxLength) {
      chunks.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
};

export const getVoiceKey = (voice) => `${voice?.voiceURI || ''}|${voice?.lang || ''}|${voice?.name || ''}`;
export const getVoiceLabel = (voice) => `${voice?.name || 'Ses'} (${voice?.lang || 'unknown'})`;
export const sortVoices = (voices = []) =>
  [...voices].sort((a, b) => {
    const aIsTr = `${a?.lang || ''}`.toLowerCase().startsWith('tr') ? 0 : 1;
    const bIsTr = `${b?.lang || ''}`.toLowerCase().startsWith('tr') ? 0 : 1;
    if (aIsTr !== bIsTr) return aIsTr - bIsTr;
    return getVoiceLabel(a).localeCompare(getVoiceLabel(b), 'tr');
  });

export const getCategoryIcon = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('trafik') || lowercaseName.includes('levha') || lowercaseName.includes('işaret')) {
    return AlertCircle;
  }
  if (lowercaseName.includes('motor') || lowercaseName.includes('araç') || lowercaseName.includes('teknik')) {
    return Settings2;
  }
  if (lowercaseName.includes('ilkyardım') || lowercaseName.includes('ilk yardım') || lowercaseName.includes('sağlık')) {
    return Activity;
  }
  if (lowercaseName.includes('adab') || lowercaseName.includes('çevre') || lowercaseName.includes('davranış')) {
    return ShieldCheck;
  }
  return BookOpen;
};

// Build a tree from a flat list
export const buildTree = (items, parentId = null) => {
  return items
    .filter(item => {
      const itemParent = item.parent?._id || item.parent || null;
      return itemParent === parentId;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(item => ({
      ...item,
      children: buildTree(items, item._id),
    }));
};

// Tamamlanan dersleri localStorage'dan oku/yaz
export const COMPLETED_KEY = 'completedLessons';
export const getCompletedLessons = () => {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]'); } catch { return []; }
};
export const toggleLessonComplete = (id) => {
  const list = getCompletedLessons();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  return list;
};
