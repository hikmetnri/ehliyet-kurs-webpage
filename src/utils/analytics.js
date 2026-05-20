import api from '../api';

const SOURCE_KEY = 'analytics_source';
const CONTEXT_KEY = 'analytics_acquisition_context';
const SESSION_KEY = 'analytics_session_id';

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const readStoredContext = () => {
  try {
    return JSON.parse(localStorage.getItem(CONTEXT_KEY) || '{}');
  } catch {
    return {};
  }
};

export const getAcquisitionContext = () => {
  const params = new URLSearchParams(window.location.search);
  const stored = readStoredContext();
  const context = {
    source: params.get('utm_source') || params.get('ref') || stored.source || localStorage.getItem(SOURCE_KEY) || 'direct',
    medium: params.get('utm_medium') || stored.medium || '',
    campaign: params.get('utm_campaign') || stored.campaign || '',
    content: params.get('utm_content') || stored.content || '',
    term: params.get('utm_term') || stored.term || '',
    landingPath: stored.landingPath || window.location.pathname,
  };

  if (params.toString()) {
    context.landingPath = window.location.pathname;
  }

  localStorage.setItem(SOURCE_KEY, context.source);
  localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  return context;
};

export const getAcquisitionSource = () => {
  return getAcquisitionContext().source;
};

export const trackEvent = async (eventType, metadata = {}) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const acquisition = getAcquisitionContext();
    await api.post('/analytics/events', {
      eventType,
      metadata: {
        ...metadata,
        acquisition,
      },
      source: acquisition.source,
      platform: 'web',
      sessionId: getSessionId(),
    });
  } catch {
    // Analitik hatası kullanıcı akışını bozmamalı.
  }
};
