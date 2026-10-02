import { useCallback, useEffect, useState } from 'react';
import {
  fetchReadinessScores,
  fetchConnections,
  fetchTrackerEntries,
  fetchInterviewQuestions,
  fetchInterviewAnswers,
  fetchDailyQuestions,
  type ReadinessScore,
  type Connection,
  type TrackerEntry,
  type InterviewQuestion,
  type InterviewAnswer,
  type DailyQuestion,
} from './dashboard-data';

export function useDashboardData() {
  const [scores, setScores] = useState<ReadinessScore[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [trackerEntries, setTrackerEntries] = useState<TrackerEntry[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [s, c, t, iq, ia, dq] = await Promise.all([
        fetchReadinessScores(),
        fetchConnections(),
        fetchTrackerEntries(),
        fetchInterviewQuestions(),
        fetchInterviewAnswers(),
        fetchDailyQuestions(),
      ]);
      setScores(s);
      setConnections(c);
      setTrackerEntries(t);
      setInterviewQuestions(iq);
      setInterviewAnswers(ia);
      setDailyQuestions(dq);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    scores,
    connections,
    trackerEntries,
    interviewQuestions,
    interviewAnswers,
    dailyQuestions,
    loading,
    error,
    refresh: loadAll,
  };
}
