import { useState, useRef, useEffect } from 'react';
import { Mic, Lock, Sparkles, Loader2, ArrowRight, TrendingUp, Volume2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { useMembership } from '@/lib/membership';
import { CLARITY_QUESTIONS, XP_REWARDS, type TrackKey } from '@/lib/gamification';

type Question = (typeof CLARITY_QUESTIONS)[number];

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so yeah', 'i mean', 'sort of', 'kind of'];
const HEDGE_WORDS = ['maybe', 'probably', 'i think', 'i guess', 'perhaps', 'possibly', 'hopefully', 'sort of', 'kind of'];
const SIGNPOSTS = ['first', 'second', 'third', 'finally', 'for example', 'for instance', 'because', 'as a result', 'in conclusion', 'overall', 'therefore', 'for this reason', 'the result'];
const COMMON_WORDS = new Set([
  'that', 'with', 'have', 'this', 'from', 'they', 'been', 'were', 'will', 'your', 'what', 'when', 'which', 'there', 'their',
  'about', 'would', 'could', 'should', 'just', 'also', 'then', 'than', 'them', 'into', 'very', 'more', 'some', 'because', 'being', 'where', 'while',
]);

type LocalScore = {
  wordCount: number;
  fillerWordCount: number;
  fillerWordDetails: Record<string, number>;
  paceWpm: number;
  repeatedWordCount: number;
  repeatedWords: string[];
  hedgeWordCount: number;
};

type Review = {
  score: number;
  structure: string;
  strengths: string[];
  suggestions: string[];
  confidence: 'High' | 'Medium' | 'Low';
  transcript: string;
  durationSeconds: number;
  stats: LocalScore;
  question: Question | null;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function countPhrase(text: string, phrase: string): number {
  const matches = text.match(new RegExp('\\b' + escapeRegex(phrase) + '\\b', 'g'));
  return matches ? matches.length : 0;
}

function computeLocalScore(text: string, durationSeconds: number): LocalScore {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const fillerWordDetails: Record<string, number> = {};
  let fillerWordCount = 0;
  for (const fw of FILLER_WORDS) {
    const n = countPhrase(lowerText, fw);
    if (n > 0) {
      fillerWordDetails[fw] = n;
      fillerWordCount += n;
    }
  }

  const wordFreq: Record<string, number> = {};
  for (const raw of words) {
    const w = raw.replace(/[^a-z']/g, '');
    if (w.length > 3 && !COMMON_WORDS.has(w)) {
      wordFreq[w] = (wordFreq[w] ?? 0) + 1;
    }
  }
  const repeatedWords = Object.entries(wordFreq)
    .filter(([, c]) => c > 3)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  let hedgeWordCount = 0;
  for (const hw of HEDGE_WORDS) hedgeWordCount += countPhrase(lowerText, hw);

  const paceWpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  return { wordCount, fillerWordCount, fillerWordDetails, paceWpm, repeatedWordCount: repeatedWords.length, repeatedWords, hedgeWordCount };
}

function buildReview(stats: LocalScore, transcript: string, durationSeconds: number, question: Question | null): Review {
  const lower = transcript.toLowerCase();
  const per100 = (n: number) => (stats.wordCount > 0 ? (n / stats.wordCount) * 100 : 0);
  const fillerRate = per100(stats.fillerWordCount);
  const hedgeRate = per100(stats.hedgeWordCount);
  const foundSignposts = SIGNPOSTS.filter((s) => countPhrase(lower, s) > 0);

  const strengths: string[] = [];
  const suggestions: string[] = [];
  let penalty = 0;

  // Filler words
  if (fillerRate <= 1) {
    strengths.push('Very few filler words. Your answer sounded clean.');
  } else {
    penalty += fillerRate <= 3 ? 1 : fillerRate <= 6 ? 2 : fillerRate <= 10 ? 3 : 4;
    const top = Object.entries(stats.fillerWordDetails).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const list = top.map(([w, c]) => `"${w}" (${c}x)`).join(' and ');
    suggestions.push(`You used filler words, mostly ${list}. Try a short silent pause instead. It sounds more confident.`);
  }

  // Pace
  if (stats.paceWpm > 0 && stats.paceWpm < 90) {
    penalty += 2;
    suggestions.push(`Your pace was slow (${stats.paceWpm} WPM). Aim for roughly 110 to 160 words per minute.`);
  } else if (stats.paceWpm > 170) {
    penalty += 2;
    suggestions.push(`You spoke fast (${stats.paceWpm} WPM). Slow down and pause between ideas so listeners can keep up.`);
  } else if (stats.paceWpm > 0 && (stats.paceWpm < 110 || stats.paceWpm > 160)) {
    penalty += 1;
    suggestions.push(`Your pace (${stats.paceWpm} WPM) is acceptable but slightly off the 110 to 160 sweet spot.`);
  } else if (stats.paceWpm > 0) {
    strengths.push(`Comfortable pace (${stats.paceWpm} WPM).`);
  }

  // Hedging
  if (hedgeRate <= 1) {
    strengths.push('You sounded decisive, with almost no hedging.');
  } else {
    penalty += hedgeRate <= 3 ? 1 : 2;
    suggestions.push('You hedged a lot ("maybe", "I think", "kind of"). State your points directly, for example "I led the project" instead of "I think I kind of led it".');
  }

  // Repeated words
  if (stats.repeatedWords.length >= 3) {
    penalty += 1;
    suggestions.push(`You repeated some words often: ${stats.repeatedWords.slice(0, 3).join(', ')}. Vary your wording to keep it interesting.`);
  } else if (stats.repeatedWords.length > 0) {
    suggestions.push(`Watch the repeated word "${stats.repeatedWords[0]}". Try a synonym or a different sentence.`);
  }

  // Length
  if (stats.wordCount < 30) {
    penalty += 2;
    suggestions.push('Your answer was very short. Aim for 60 to 200 words, with a point, a reason and an example.');
  } else if (stats.wordCount < 60) {
    penalty += 1;
    suggestions.push('A bit short. Add a concrete example or a result to make the answer memorable.');
  } else if (stats.wordCount <= 260) {
    strengths.push('Good answer length.');
  } else {
    suggestions.push('Your answer was long. Try to get to the point faster and finish in about two minutes.');
  }

  // Structure
  let structure: string;
  if (foundSignposts.length >= 3) {
    structure = `Clear structure. You guided the listener with signposts like "${foundSignposts.slice(0, 3).join('", "')}".`;
    strengths.push('Well structured, with clear signposts.');
  } else if (foundSignposts.length >= 1) {
    structure = `Some structure ("${foundSignposts[0]}"). Add one or two more signposts such as "first", "for example" or "overall" so the listener can follow your logic.`;
  } else {
    penalty += 1;
    structure = 'Little visible structure. Try this shape: main point first, then a reason or example, then a one-line wrap-up.';
    suggestions.push('Open with your main point, back it up with one example, then end with a one-line summary.');
  }

  const score = Math.max(1, Math.min(10, 10 - penalty));
  const confidence: Review['confidence'] = hedgeRate > 3 || fillerRate > 6 ? 'Low' : hedgeRate > 1 || fillerRate > 3 ? 'Medium' : 'High';

  if (suggestions.length === 0) suggestions.push('Great delivery. Keep practicing with harder questions to stay sharp.');

  return { score, structure, strengths, suggestions, confidence, transcript, durationSeconds, stats, question };
}

export function ClarityPage({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const { profile, claritySessions, awardXp, refresh } = dashboard;
  const [selectedQId, setSelectedQId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [localScore, setLocalScore] = useState<LocalScore | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const startTimeRef = useRef<number>(0);
  const modeRef = useRef<'idle' | 'recording' | 'stopping' | 'failed'>('idle');
  const selectedQuestionRef = useRef<Question | null>(null);
  const savedReviewRef = useRef<Review | null>(null);

  const sessions = claritySessions ?? [];
  const scored = sessions.filter((s) => s.clarity_score !== null);
  const avgScore =
    scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + (s.clarity_score ?? 0), 0) / scored.length) : null;

  // Stop the microphone if the person leaves the page
  useEffect(() => {
    return () => {
      modeRef.current = 'failed';
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // Save every finished attempt (local scoring only, no AI) and award XP
  useEffect(() => {
    if (!review || savedReviewRef.current === review) return;
    savedReviewRef.current = review;
    if (!user || !review.question) return;
    const previousAvg = avgScore;

    (async () => {
      setSaveState('saving');
      try {
        const { error: insertError } = await supabase.from('clarity_sessions').insert({
          user_id: user.id,
          question_text: review.question!.prompt,
          question_category: review.question!.category,
          transcript: review.transcript,
          audio_duration_seconds: review.durationSeconds,
          clarity_score: review.score,
          filler_word_count: review.stats.fillerWordCount,
          filler_words: review.stats.fillerWordDetails,
          pace_wpm: review.stats.paceWpm,
          structure_assessment: review.structure,
          corrections: review.suggestions,
          rewritten_example: null,
          confidence_estimate: review.confidence,
        });
        if (insertError) throw insertError;

        await awardXp('complete_clarity_session', 'Completed a voice practice session', XP_REWARDS.complete_clarity_session);
        if (previousAvg !== null && review.score > previousAvg) {
          await awardXp('improve_clarity_score', 'Improved your clarity score!', XP_REWARDS.improve_clarity_score);
        }
        await refresh();
        setSaveState('saved');
      } catch {
        setSaveState('error');
      }
    })();
  }, [review]);

  if (!profile) return null;

  const track = profile.target_track as TrackKey;
  const availableQuestions = CLARITY_QUESTIONS.filter(
    (q) => q.tracks === 'all' || q.tracks.includes(track),
  );
  const selectedQuestion = availableQuestions.find((q) => q.id === selectedQId) ?? null;
  selectedQuestionRef.current = selectedQuestion;
  const recentSessions = sessions.slice(0, 5);
  const speechSupported =
    typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const selectQuestion = (id: string) => {
    if (recording) return;
    setSelectedQId(id);
    setLocalScore(null);
    setReview(null);
    setLiveTranscript('');
    setError(null);
    setSaveState('idle');
  };

  const finishRecording = () => {
    const transcript = finalTranscriptRef.current.trim();
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (!transcript || transcript.length < 10) {
      setError('Recording too short. Please record for at least a few seconds.');
      return;
    }

    const stats = computeLocalScore(transcript, durationSeconds);
    setLocalScore(stats);
    setReview(buildReview(stats, transcript, durationSeconds, selectedQuestionRef.current));
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice transcription is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setError(null);
    setLiveTranscript('');
    setLocalScore(null);
    setReview(null);
    setSaveState('idle');
    finalTranscriptRef.current = '';
    modeRef.current = 'recording';

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) finalTranscriptRef.current += final + ' ';
      setLiveTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        modeRef.current = 'failed';
        setRecording(false);
        setError('Could not access the microphone. Please allow microphone permissions and try again.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      if (modeRef.current === 'stopping') {
        modeRef.current = 'idle';
        finishRecording();
      } else if (modeRef.current === 'recording') {
        // The browser ended the session on its own (e.g. a long pause). Keep listening.
        try { recognition.start(); } catch {}
      }
    };

    startTimeRef.current = Date.now();
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setRecording(true);
    } catch {
      modeRef.current = 'failed';
      setError('Could not start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    modeRef.current = 'stopping';
    setRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { finishRecording(); }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Clarity</h1>
        <p className="mt-1 text-sm text-slatey">Practice speaking and get instant feedback on how you come across.</p>
      </div>

      {/* Paywall banner for free users */}
      {!isStandard && (
        <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/5 via-white to-sky/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-white shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink">Voice practice with feedback is a Standard feature</h2>
              <p className="mt-1.5 text-sm text-slatey leading-relaxed">
                You can preview the practice questions and a sample scorecard below, blurred until you upgrade.
                Standard unlocks clarity scoring, filler word detection, pace analysis, and feedback on your structure.
              </p>
              <Link
                to="/membership"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
              >
                Upgrade to Standard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress summary */}
      {isStandard && sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-mist bg-white p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-widest text-coral">Avg Clarity</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">{avgScore ?? '—'}<span className="text-sm text-slatey">/10</span></div>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-5">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-widest text-coral">Sessions</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">{sessions.length}</div>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-widest text-coral">Best Score</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">
              {scored.length > 0 ? Math.max(...scored.map((s) => s.clarity_score ?? 0)) : '—'}<span className="text-sm text-slatey">/10</span>
            </div>
          </div>
        </div>
      )}

      <div className={!isStandard ? 'relative' : ''}>
        {!isStandard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-2xl border border-coral/30 bg-white/90 backdrop-blur-sm px-8 py-6 text-center shadow-lg">
              <Lock className="h-8 w-8 text-coral mx-auto" />
              <p className="mt-3 text-sm font-medium text-ink">Unlock to practice</p>
              <p className="mt-1 text-xs text-slatey">Upgrade to Standard for voice practice and feedback</p>
              <Link
                to="/membership"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02]"
              >
                Upgrade to Standard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!isStandard ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {/* Question bank */}
          <div className="rounded-2xl border border-mist bg-white p-5 self-start">
            <h2 className="text-base font-semibold text-ink">Practice Questions</h2>
            <p className="mt-1 text-sm text-slatey">Pick a question, record your answer, and get instant feedback.</p>
            <div className="mt-4 space-y-2">
              {availableQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => (isStandard ? selectQuestion(q.id) : null)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    selectedQId === q.id
                      ? 'border-coral bg-gradient-to-br from-coral/5 to-sky/5'
                      : 'border-mist bg-paper hover:border-ink/20'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{q.prompt}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-mist/60 px-2 py-0.5 text-[10px] font-medium text-slatey">{q.category}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700'
                        : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                      }`}>{q.difficulty}</span>
                    </div>
                  </div>
                  {isStandard ? <ArrowRight className="h-4 w-4 text-slatey shrink-0" /> : <Lock className="h-4 w-4 text-slatey shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Recording + scorecard */}
          <div className="space-y-4">
            {selectedQuestion && isStandard ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-mist bg-white p-5">
                  <h2 className="text-base font-semibold text-ink">Record Your Answer</h2>
                  <p className="mt-2 text-sm font-medium text-ink leading-relaxed">{selectedQuestion.prompt}</p>

                  {!speechSupported && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Voice transcription is not supported in this browser. Please use Chrome or Edge.
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mt-5 flex flex-col items-center gap-4">
                    {!recording && (
                      <button
                        onClick={startRecording}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-white shadow-lg transition-all hover:scale-105"
                      >
                        <Mic className="h-7 w-7" />
                      </button>
                    )}
                    {recording && (
                      <button
                        onClick={stopRecording}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 animate-pulse"
                      >
                        <span className="h-6 w-6 rounded-sm bg-white" />
                      </button>
                    )}
                    <p className="text-sm text-slatey">
                      {recording ? 'Recording... click to stop' : localScore ? 'Record again' : 'Click to start recording'}
                    </p>
                  </div>
                </div>

                {/* Live transcript pad */}
                {(recording || liveTranscript) && (
                  <div className="rounded-2xl border border-mist bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 className="h-4 w-4 text-coral" />
                      <h3 className="text-sm font-semibold text-ink">Transcript Pad</h3>
                      {recording && (
                        <span className="ml-auto inline-flex items-center gap-1 text-xs text-coral animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
                          Listening...
                        </span>
                      )}
                    </div>
                    <div className="rounded-xl border border-mist bg-paper p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                      <p className="text-sm text-ink leading-relaxed">
                        {liveTranscript || <span className="text-slatey/50">Your words will appear here as you speak...</span>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Scorecard + review */}
                {localScore && review && (
                  <div className="rounded-2xl border border-mist bg-white p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-coral" />
                      <h3 className="text-sm font-semibold text-ink">Your Scorecard</h3>
                      <span className="ml-auto text-xs text-slatey">
                        {saveState === 'saving' && (
                          <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving...</span>
                        )}
                        {saveState === 'saved' && `Saved · +${XP_REWARDS.complete_clarity_session} XP`}
                        {saveState === 'error' && 'Could not save this session'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <ScoreRow label="Clarity Score" value={`${review.score}/10`} />
                      <ScoreRow label="Word Count" value={String(localScore.wordCount)} />
                      <ScoreRow label="Filler Words" value={
                        localScore.fillerWordCount > 0
                          ? `${localScore.fillerWordCount} (${Object.entries(localScore.fillerWordDetails).map(([w, c]) => `"${w}" x${c}`).join(', ')})`
                          : 'None detected'
                      } />
                      <ScoreRow label="Pace" value={`${localScore.paceWpm} WPM ${
                        localScore.paceWpm > 0 && localScore.paceWpm < 90 ? '(slow)' : localScore.paceWpm > 170 ? '(fast)' : '(good)'
                      }`} />
                      <ScoreRow label="Repeated Words" value={localScore.repeatedWordCount > 0 ? `${localScore.repeatedWords.slice(0, 3).join(', ')} (used 4+ times)` : 'None detected'} />
                      <ScoreRow label="Hedge Words" value={localScore.hedgeWordCount > 0 ? `${localScore.hedgeWordCount} detected` : 'None detected'} />
                      <ScoreRow label="Confidence" value={review.confidence} />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-coral" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-coral">Review</h4>
                      </div>

                      <div className="rounded-xl border border-mist bg-paper p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Structure</p>
                        <p className="text-xs text-slatey leading-relaxed">{review.structure}</p>
                      </div>

                      {review.strengths.length > 0 && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">What went well</p>
                          <ul className="space-y-1">
                            {review.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-green-800 leading-relaxed">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-px" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-xl border border-mist bg-paper p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Suggestions</p>
                        <ul className="space-y-1">
                          {review.suggestions.map((c, i) => (
                            <li key={i} className="text-xs text-slatey leading-relaxed">- {c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sample scorecard (visible to free users) */
              <div className="rounded-2xl border border-mist bg-white p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-coral" />
                  <h2 className="text-base font-semibold text-ink">Sample Scorecard</h2>
                </div>
                <p className="mt-1 text-xs text-slatey">Here's what you'll get with Standard:</p>
                <div className="mt-4 space-y-3">
                  <ScoreRow label="Clarity Score" value="7/10" />
                  <ScoreRow label="Filler Words" value='"um" x4, "like" x3' />
                  <ScoreRow label="Pace" value="145 WPM (good)" />
                  <ScoreRow label="Confidence" value="Medium" />
                  <ScoreRow label="Structure" value="Clear beginning, middle, end" />
                  <div className="rounded-xl border border-mist bg-paper p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Suggestion</p>
                    <p className="text-xs text-slatey leading-relaxed">Start with your main point instead of "um." Aim for 90 seconds.</p>
                  </div>
                </div>
                {!isStandard && (
                  <Link to="/membership" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral hover:text-ink transition-colors">
                    <Lock className="h-3.5 w-3.5" />
                    Unlock voice practice
                  </Link>
                )}
              </div>
            )}

            {/* Recent sessions */}
            {isStandard && recentSessions.length > 0 && (
              <div className="rounded-2xl border border-mist bg-white p-5">
                <h2 className="text-base font-semibold text-ink">Recent Sessions</h2>
                <div className="mt-3 space-y-2">
                  {recentSessions.map((s) => (
                    <div key={s.id} className="rounded-xl border border-mist bg-paper px-4 py-3">
                      <p className="text-xs font-medium text-ink truncate">{s.question_text}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-slatey">
                        {s.clarity_score !== null && <span>Clarity: <span className="font-medium text-ink">{s.clarity_score}/10</span></span>}
                        {s.filler_word_count !== null && <span>Fillers: <span className="font-medium text-ink">{s.filler_word_count}</span></span>}
                        {s.pace_wpm !== null && <span>{s.pace_wpm} WPM</span>}
                        <span className="ml-auto">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-paper px-4 py-2.5">
      <span className="text-xs font-medium text-slatey">{label}</span>
      <span className="text-xs font-medium text-ink text-right">{value}</span>
    </div>
  );
}