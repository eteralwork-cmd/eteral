import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Lock, Sparkles, Loader2, ArrowRight, TrendingUp, Clock, Volume2, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useDashboard } from '@/lib/useDashboard';
import { useMembership } from '@/lib/membership';
import { CLARITY_QUESTIONS, XP_REWARDS, type TrackKey } from '@/lib/gamification';
import type { ClaritySession } from '@/lib/useDashboard';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so yeah', 'i mean', 'sort of', 'kind of'];
const HEDGE_WORDS = ['maybe', 'probably', 'i think', 'i guess', 'perhaps', 'possibly', 'hopefully', 'sort of', 'kind of'];

type LocalScore = {
  wordCount: number;
  fillerWordCount: number;
  fillerWordDetails: Record<string, number>;
  paceWpm: number;
  repeatedWordCount: number;
  hedgeWordCount: number;
};

export function ClarityPage({ dashboard }: { dashboard: ReturnType<typeof useDashboard> }) {
  const { isStandard } = useMembership();
  const { user } = useAuth();
  const { profile, claritySessions, awardXp, refresh } = dashboard;
  const [selectedQId, setSelectedQId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [localScore, setLocalScore] = useState<LocalScore | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Partial<ClaritySession> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  if (!profile) return null;

  const track = profile.target_track as TrackKey;
  const availableQuestions = CLARITY_QUESTIONS.filter(
    (q) => q.tracks === 'all' || q.tracks.includes(track),
  );

  const selectedQuestion = availableQuestions.find((q) => q.id === selectedQId);
  const recentSessions = claritySessions.slice(0, 5);
  const avgScore =
    claritySessions.length > 0 && claritySessions.some((s) => s.clarity_score !== null)
      ? Math.round(claritySessions.filter((s) => s.clarity_score !== null).reduce((sum, s) => sum + (s.clarity_score ?? 0), 0) / claritySessions.filter((s) => s.clarity_score !== null).length)
      : null;

  const computeLocalScore = (text: string, durationSeconds: number): LocalScore => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const fillerWordDetails: Record<string, number> = {};
    let fillerWordCount = 0;
    for (const fw of FILLER_WORDS) {
      const escaped = fw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('\\b' + escaped + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        fillerWordDetails[fw] = matches.length;
        fillerWordCount += matches.length;
      }
    }

    const wordFreq: Record<string, number> = {};
    for (const w of words) {
      if (w.length > 3) {
        wordFreq[w] = (wordFreq[w] ?? 0) + 1;
      }
    }
    const repeatedWordCount = Object.values(wordFreq).filter((c) => c > 3).length;

    let hedgeWordCount = 0;
    for (const hw of HEDGE_WORDS) {
      const escaped = hw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('\\b' + escaped + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) hedgeWordCount += matches.length;
    }

    const paceWpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

    return { wordCount, fillerWordCount, fillerWordDetails, paceWpm, repeatedWordCount, hedgeWordCount };
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setLiveTranscript('');
    setFinalTranscript('');
    setLocalScore(null);
    setAiResult(null);
    finalTranscriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        handleStop();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setRecording(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
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
          if (final) {
            finalTranscriptRef.current += final + ' ';
            setFinalTranscript(finalTranscriptRef.current);
          }
          setLiveTranscript(finalTranscriptRef.current + interim);
        };
        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.warn('Speech recognition error:', event.error);
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      setError('Could not access microphone. Please allow microphone permissions and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const handleStop = () => {
    const transcript = finalTranscriptRef.current.trim();
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (!transcript || transcript.length < 10) {
      setError('Recording too short. Please record for at least a few seconds.');
      return;
    }

    const score = computeLocalScore(transcript, durationSeconds);
    setLocalScore(score);
  };

  const handleAiAnalysis = async () => {
    if (!user || !selectedQuestion || !finalTranscript) return;
    setAiLoading(true);
    setError(null);

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const session = await supabase.functions.invoke('clarity-analyze', {
        body: {
          questionText: selectedQuestion.prompt,
          questionCategory: selectedQuestion.category,
          audio: Array.from(new Uint8Array(await audioBlob.arrayBuffer())),
          audioMimeType: audioBlob.type,
          durationSeconds,
          transcript: finalTranscript,
        },
      });

      if (session.error || !session.data) {
        throw new Error(session.error?.message ?? 'AI analysis failed');
      }

      const result = session.data as Partial<ClaritySession>;
      setAiResult(result);

      await supabase.from('clarity_sessions').insert({
        user_id: user.id,
        question_text: selectedQuestion.prompt,
        question_category: selectedQuestion.category,
        transcript: finalTranscript,
        audio_duration_seconds: durationSeconds,
        clarity_score: result.clarity_score ?? null,
        filler_word_count: localScore?.fillerWordCount ?? result.filler_word_count ?? null,
        filler_words: localScore ? localScore.fillerWordDetails : (result.filler_words ?? null),
        pace_wpm: localScore?.paceWpm ?? result.pace_wpm ?? null,
        structure_assessment: result.structure_assessment ?? null,
        corrections: result.corrections ?? null,
        rewritten_example: result.rewritten_example ?? null,
        confidence_estimate: result.confidence_estimate ?? null,
      });

      await awardXp('complete_clarity_session', 'Completed a voice practice session', XP_REWARDS.complete_clarity_session);

      if (avgScore !== null && result.clarity_score !== null && result.clarity_score > avgScore) {
        await awardXp('improve_clarity_score', 'Improved your clarity score!', XP_REWARDS.improve_clarity_score);
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Clarity</h1>
        <p className="mt-1 text-sm text-slatey">Practice speaking and get AI feedback on how you come across.</p>
      </div>

      {/* Paywall banner for free users */}
      {!isStandard && (
        <div className="rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/5 via-white to-sky/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent text-white shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-ink">Voice analysis with AI feedback is a Standard feature</h2>
              <p className="mt-1.5 text-sm text-slatey leading-relaxed">
                You can preview the practice questions and a sample scorecard below, blurred until you upgrade.
                Standard unlocks AI-powered clarity scoring, filler word detection, pace analysis, and rewritten examples.
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
      {isStandard && claritySessions.length > 0 && (
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
            <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">{claritySessions.length}</div>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-coral" />
              <span className="text-xs font-semibold uppercase tracking-widest text-coral">Best Score</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-ink tabular-nums">
              {claritySessions.length > 0 ? Math.max(...claritySessions.map((s) => s.clarity_score ?? 0)) : '—'}<span className="text-sm text-slatey">/10</span>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!isStandard ? 'relative' : ''}`}>
        {!isStandard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-2xl border border-coral/30 bg-white/90 backdrop-blur-sm px-8 py-6 text-center shadow-lg">
              <Lock className="h-8 w-8 text-coral mx-auto" />
              <p className="mt-3 text-sm font-medium text-ink">Unlock to practice</p>
              <p className="mt-1 text-xs text-slatey">Upgrade to Standard for AI voice analysis</p>
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

        <div className={!isStandard ? 'blur-sm pointer-events-none select-none' : ''}>
        {/* Question bank */}
        <div className="rounded-2xl border border-mist bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Practice Questions</h2>
          <p className="mt-1 text-sm text-slatey">Pick a question, record your answer, and get instant feedback.</p>
          <div className="mt-4 space-y-2">
            {availableQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => isStandard ? setSelectedQId(q.id) : null}
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
        <div className="space-y-4 mt-6 lg:mt-0">
          {selectedQuestion && isStandard ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-mist bg-white p-5">
                <h2 className="text-base font-semibold text-ink">Record Your Answer</h2>
                <p className="mt-2 text-sm font-medium text-ink leading-relaxed">{selectedQuestion.prompt}</p>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex flex-col items-center gap-4">
                  {!recording && !localScore && (
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
                  {localScore && !recording && (
                    <button
                      onClick={() => {
                        setLocalScore(null);
                        setAiResult(null);
                        setLiveTranscript('');
                        setFinalTranscript('');
                        finalTranscriptRef.current = '';
                        startRecording();
                      }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-white shadow-lg transition-all hover:scale-105"
                    >
                      <Mic className="h-7 w-7" />
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

              {/* Local instant scorecard */}
              {localScore && (
                <div className="rounded-2xl border border-mist bg-white p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-coral" />
                    <h3 className="text-sm font-semibold text-ink">Instant Scorecard</h3>
                    <span className="ml-auto text-xs text-slatey">No AI used</span>
                  </div>
                  <div className="space-y-3">
                    <ScoreRow label="Word Count" value={String(localScore.wordCount)} />
                    <ScoreRow label="Filler Words" value={
                      localScore.fillerWordCount > 0
                        ? `${localScore.fillerWordCount} (${Object.entries(localScore.fillerWordDetails).map(([w, c]) => `"${w}" x${c}`).join(', ')})`
                        : 'None detected'
                    } />
                    <ScoreRow label="Pace" value={`${localScore.paceWpm} WPM ${
                      localScore.paceWpm > 0 && localScore.paceWpm < 90 ? '(slow)' : localScore.paceWpm > 170 ? '(fast)' : '(good)'
                    }`} />
                    <ScoreRow label="Repeated Words" value={localScore.repeatedWordCount > 0 ? `${localScore.repeatedWordCount} word(s) used 4+ times` : 'None detected'} />
                    <ScoreRow label="Hedge Words" value={localScore.hedgeWordCount > 0 ? `${localScore.hedgeWordCount} detected` : 'None detected'} />
                  </div>

                  {/* Optional AI analysis button */}
                  {!aiResult && (
                    <button
                      onClick={handleAiAnalysis}
                      disabled={aiLoading}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-accent px-5 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                      {aiLoading ? 'Analyzing with AI...' : 'Ask AI for Suggestions'}
                    </button>
                  )}

                  {/* AI results */}
                  {aiResult && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-coral" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-coral">AI Analysis</h4>
                      </div>
                      {aiResult.clarity_score !== null && (
                        <ScoreRow label="Clarity Score" value={`${aiResult.clarity_score}/10`} />
                      )}
                      {aiResult.structure_assessment && (
                        <div className="rounded-xl border border-mist bg-paper p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Structure</p>
                          <p className="text-xs text-slatey leading-relaxed">{aiResult.structure_assessment}</p>
                        </div>
                      )}
                      {aiResult.corrections && aiResult.corrections.length > 0 && (
                        <div className="rounded-xl border border-mist bg-paper p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Suggestions</p>
                          <ul className="space-y-1">
                            {aiResult.corrections.map((c, i) => (
                              <li key={i} className="text-xs text-slatey leading-relaxed">- {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiResult.rewritten_example && (
                        <div className="rounded-xl border border-mist bg-paper p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Rewritten Example</p>
                          <p className="text-xs text-slatey leading-relaxed italic">"{aiResult.rewritten_example}"</p>
                        </div>
                      )}
                      {aiResult.confidence_estimate && (
                        <ScoreRow label="Confidence" value={aiResult.confidence_estimate} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Sample scorecard (visible to free users) */
            <div className="rounded-2xl border border-mist bg-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-coral" />
                <h2 className="text-base font-semibold text-ink">Sample AI Scorecard</h2>
              </div>
              <p className="mt-1 text-xs text-slatey">Here's what you'll get with Pro:</p>
              <div className="mt-4 space-y-3">
                <ScoreRow label="Clarity Score" value="7/10" />
                <ScoreRow label="Filler Words" value='"um" x4, "like" x3' />
                <ScoreRow label="Pace" value="145 WPM (good)" />
                <ScoreRow label="Answer Length" value="1m 12s (ideal)" />
                <ScoreRow label="Structure" value="Clear beginning, middle, end" />
                <div className="rounded-xl border border-mist bg-paper p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">AI Suggestion</p>
                  <p className="text-xs text-slatey leading-relaxed">Start with your main point instead of "um." Aim for 90 seconds.</p>
                </div>
                <div className="rounded-xl border border-mist bg-paper p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-coral mb-1">Rewritten Example</p>
                  <p className="text-xs text-slatey leading-relaxed">"I'm a fullstack developer who loves building tools that simplify complex workflows..."</p>
                </div>
              </div>
              {!isStandard && (
                <Link to="/membership" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral hover:text-ink transition-colors">
                  <Lock className="h-3.5 w-3.5" />
                  Unlock voice analysis
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
      <span className="text-xs font-medium text-ink">{value}</span>
    </div>
  );
}
