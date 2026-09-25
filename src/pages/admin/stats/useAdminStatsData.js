import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../api';
import {
  loadDashboardStats, loadJourneyStats, loadRootCategories, loadTimeline,
} from './adminStatsRepository';

export function useAdminStatsData(client = api) {
  const [overview, setOverview] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [difficultQuestions, setDifficultQuestions] = useState([]);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [qrStats, setQrStats] = useState({ count: 0, daily: {} });
  const [dailyGoals, setDailyGoals] = useState([]);
  const [journeyAnalytics, setJourneyAnalytics] = useState(null);
  const [journeyDays, setJourneyDays] = useState('30');
  const [journeySource, setJourneySource] = useState('all');
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [timelineUser, setTimelineUser] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rootCategories, setRootCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const statsRequest = useRef(0);
  const journeyRequest = useRef(0);
  const timelineRequest = useRef(0);

  useEffect(() => () => {
    statsRequest.current++;
    journeyRequest.current++;
    timelineRequest.current++;
  }, []);

  useEffect(() => {
    let active = true;
    loadRootCategories(client)
      .then(categories => { if (active) setRootCategories(categories); })
      .catch(error => console.error('Kategoriler alınamadı:', error));
    return () => { active = false; };
  }, [client]);

  const fetchStats = useCallback(async () => {
    const request = ++statsRequest.current;
    setLoading(true);
    try {
      const result = await loadDashboardStats(client, selectedCategoryId);
      if (request !== statsRequest.current) return;
      setOverview(result.overview);
      setCategoryStats(result.categoryStats);
      setDifficultQuestions(result.difficultQuestions);
      setQrStats(result.qrStats);
      setRegistrationTrend(result.registrationTrend);
      setDailyGoals(result.dailyGoals);
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    } finally {
      if (request === statsRequest.current) setLoading(false);
    }
  }, [client, selectedCategoryId]);

  const fetchJourneyStats = useCallback(async () => {
    const request = ++journeyRequest.current;
    setJourneyLoading(true);
    try {
      const result = await loadJourneyStats(client, {
        days: journeyDays, source: journeySource, categoryId: selectedCategoryId,
      });
      if (request === journeyRequest.current) setJourneyAnalytics(result);
    } catch (error) {
      console.error('Kullanıcı yolculuğu alınamadı:', error);
      if (request === journeyRequest.current) setJourneyAnalytics(null);
    } finally {
      if (request === journeyRequest.current) setJourneyLoading(false);
    }
  }, [client, journeyDays, journeySource, selectedCategoryId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchJourneyStats(); }, [fetchJourneyStats]);

  const openTimeline = async user => {
    if (!user?.id) return;
    const request = ++timelineRequest.current;
    setTimelineUser(user);
    setTimelineLoading(true);
    setTimelineEvents([]);
    try {
      const events = await loadTimeline(client, user.id);
      if (request === timelineRequest.current) setTimelineEvents(events);
    } catch (error) {
      console.error('Kullanıcı timeline alınamadı:', error);
    } finally {
      if (request === timelineRequest.current) setTimelineLoading(false);
    }
  };
  const closeTimeline = () => {
    timelineRequest.current++;
    setTimelineUser(null);
    setTimelineEvents([]);
    setTimelineLoading(false);
  };

  return {
    overview, categoryStats, difficultQuestions, registrationTrend, qrStats,
    dailyGoals, journeyAnalytics, journeyDays, setJourneyDays,
    journeySource, setJourneySource, journeyLoading, timelineUser,
    timelineEvents, timelineLoading, loading, rootCategories,
    selectedCategoryId, setSelectedCategoryId, fetchStats, fetchJourneyStats,
    openTimeline, closeTimeline,
  };
}
