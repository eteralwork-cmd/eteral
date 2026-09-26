import { useRef, useState } from 'react';
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  Loader2,
  Save,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { InterviewQuestion, InterviewAnswer } from '@/lib/dashboard-data';

type Props = {
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  isPaid: boolean;
  onRefresh: () => void;
};

export default function InterviewCards({ questions, answers, isPaid, onRefresh }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftAnswer, setDraftAnswer] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const answerMap = new Map(answers.map((a) => [a.question_id, a]));

 const upsertAnswer = async (
  questionId: string,
  fields: Partial<{ answer_text: string; audio_url: string | null }>,
) => {
  const existing = answerMap.get(questionId);
  if (existing) {
    return supabase
      .from('interview_answers')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User is not authenticated');

  return supabase
    .from('interview_answers')
    .insert({ question_id: questionId, user_id: user.id, ...fields });

  };

  const handleSaveAnswer = async (questionId: string) => {
    setSaving(questionId);
    const text = draftAnswer[questionId] ?? '';
    const { error } = await upsertAnswer(questionId, { answer_text: text });
    if (error) console.error(error);
    setSaving(null);
    setDraftAnswer((prev) => ({ ...prev, [questionId]: '' }));
    onRefresh();
  };

  const startRecording = async (questionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleUploadAudio(questionId, blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingId(questionId);
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecordingId(null);
  };

  const handleUploadAudio = async (questionId: string, blob: Blob) => {
    setUploadingId(questionId);
    const path = `${questionId}/${crypto.randomUUID()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from('interview-audio')
      .upload(path, blob, { contentType: 'audio/webm' });

    if (uploadError) {
      console.error(uploadError);
      setUploadingId(null);
      return;
    }

    const { data } = supabase.storage.from('interview-audio').getPublicUrl(path);
    const { error } = await upsertAnswer(questionId, { audio_url: data.publicUrl });
    if (error) console.error(error);

    setUploadingId(null);
    onRefresh();
  };

  const handleDeleteAudio = async (questionId: string) => {
    const { error } = await upsertAnswer(questionId, { audio_url: null as unknown as string });
    if (error) console.error(error);
    onRefresh();
  };

  const togglePlayback = (questionId: string, url: string) => {
    if (playingId === questionId) {
      audioElRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
    const el = new Audio(url);
    el.onended = () => setPlayingId(null);
    audioElRef.current = el;
    el.play();
    setPlayingId(questionId);
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6 shadow-[0_1px_2px_rgba(42,42,46,0.04)]">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">Interview Practice</h3>
      </div>
      <p className="mt-1.5 text-sm text-slatey">
        5 common tech interview questions. Answer in writing or record yourself out loud — build the muscle either way.
      </p>

      <div className="mt-5 space-y-3">
        {questions.map((q, i) => {
          const expanded = expandedId === q.id;
          const answer = answerMap.get(q.id);
          const audioUrl = (answer as (InterviewAnswer & { audio_url?: string | null }) | undefined)?.audio_url;
          const isRecording = recordingId === q.id;
          const isUploading = uploadingId === q.id;
          const isPlaying = playingId === q.id;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-mist bg-paper overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() => setExpandedId(expanded ? null : q.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-ink">{q.prompt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {audioUrl && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-mist/50 px-2 py-0.5 text-[10px] font-medium text-slatey">
                      <Mic className="h-3 w-3" /> recorded
                    </span>
                  )}
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 text-slatey" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slatey" />
                  )}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-mist px-4 pb-4 pt-4 space-y-5">
                  {/* Written answer — open to everyone */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slatey mb-2">
                      Written answer
                    </p>

                    {answer?.answer_text && (
                      <div className="mb-3 rounded-lg border border-mist bg-white p-3">
                        <p className="text-xs font-medium text-slatey uppercase tracking-wide mb-1">
                          Your saved answer
                        </p>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {answer.answer_text}
                        </p>
                      </div>
                    )}

                    <textarea
                      value={draftAnswer[q.id] ?? ''}
                      onChange={(e) => setDraftAnswer((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Write your answer here…"
                      rows={4}
                      className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-ink/30 transition-shadow"
                    />
                    <button
                      onClick={() => handleSaveAnswer(q.id)}
                      disabled={!draftAnswer[q.id]?.trim() || saving === q.id}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {saving === q.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save Answer
                    </button>
                  </div>

                  {/* Audio recording — open to everyone */}
                  <div className="border-t border-mist/70 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slatey mb-2">
                      Audio recording
                    </p>

                    <div className="flex items-center gap-3">
                      {isRecording ? (
                        <button
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02]"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                          </span>
                          <Square className="h-3.5 w-3.5" />
                          Stop recording
                        </button>
                      ) : (
                        <button
                          onClick={() => startRecording(q.id)}
                          disabled={isUploading}
                          className="inline-flex items-center gap-2 rounded-full border border-mist bg-white px-4 py-2 text-xs font-medium text-ink transition-all hover:border-ink/30 disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Mic className="h-3.5 w-3.5" />
                          )}
                          {audioUrl ? 'Re-record' : 'Record answer'}
                        </button>
                      )}

                      {audioUrl && !isRecording && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePlayback(q.id, audioUrl)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-mist bg-white px-3 py-2 text-xs font-medium text-ink hover:border-ink/30"
                          >
                            {isPlaying ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            {isPlaying ? 'Pause' : 'Play'}
                          </button>
                          <button
                            onClick={() => handleDeleteAudio(q.id)}
                            className="inline-flex items-center justify-center rounded-full border border-mist bg-white p-2 text-slatey hover:border-red-300 hover:text-red-500"
                            aria-label="Delete recording"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}