import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Lock, Sparkles, Loader2, Save } from 'lucide-react';
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

  const answerMap = new Map(answers.map((a) => [a.question_id, a]));

  const handleSaveAnswer = async (questionId: string) => {
    setSaving(questionId);
    const text = draftAnswer[questionId] ?? '';
    const existing = answerMap.get(questionId);

    if (existing) {
      const { error } = await supabase
        .from('interview_answers')
        .update({ answer_text: text, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) { console.error(error); }
    } else {
      const { error } = await supabase
        .from('interview_answers')
        .insert({ question_id: questionId, answer_text: text });
      if (error) { console.error(error); }
    }

    setSaving(null);
    setDraftAnswer((prev) => ({ ...prev, [questionId]: '' }));
    onRefresh();
  };

  return (
    <div className="rounded-2xl border border-mist bg-white p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-coral" />
        <h3 className="text-base font-semibold text-ink">Interview Practice</h3>
      </div>
      <p className="mt-1.5 text-sm text-slatey">5 common tech interview questions. Practice your answers to build confidence.</p>

      <div className="mt-5 space-y-3">
        {questions.map((q, i) => {
          const expanded = expandedId === q.id;
          const answer = answerMap.get(q.id);
          return (
            <div key={q.id} className="rounded-xl border border-mist bg-paper overflow-hidden">
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
                {expanded ? <ChevronUp className="h-4 w-4 text-slatey shrink-0" /> : <ChevronDown className="h-4 w-4 text-slatey shrink-0" />}
              </button>

              {expanded && (
                <div className="border-t border-mist px-4 pb-4 pt-3">
                  {isPaid ? (
                    <>
                      {answer && answer.answer_text && (
                        <div className="mb-3 rounded-lg border border-mist bg-white p-3">
                          <p className="text-xs font-medium text-slatey uppercase tracking-wide mb-1">Your saved answer</p>
                          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{answer.answer_text}</p>
                          {answer.ai_feedback && (
                            <div className="mt-3 border-t border-mist pt-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-coral" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-coral">AI Feedback</span>
                              </div>
                              {answer.ai_feedback.confidence && <p className="text-xs text-slatey">Confidence: {answer.ai_feedback.confidence}</p>}
                              {answer.ai_feedback.clarity && <p className="text-xs text-slatey">Clarity: {answer.ai_feedback.clarity}</p>}
                              {answer.ai_feedback.suggestions && (
                                <ul className="mt-1.5 space-y-1">
                                  {answer.ai_feedback.suggestions.map((s, idx) => (
                                    <li key={idx} className="text-xs text-slatey">• {s}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <textarea
                        value={draftAnswer[q.id] ?? ''}
                        onChange={(e) => setDraftAnswer((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Write your answer here…"
                        rows={4}
                        className="w-full rounded-xl border border-mist bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slatey/60 focus:outline-none focus:border-ink/30"
                      />
                      <button
                        onClick={() => handleSaveAnswer(q.id)}
                        disabled={!draftAnswer[q.id]?.trim() || saving === q.id}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-accent px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                      >
                        {saving === q.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Answer
                      </button>
                      <p className="mt-2 text-xs text-slatey">
                        <Sparkles className="inline h-3 w-3 text-coral" /> AI feedback on confidence & clarity appears after you save.
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slatey" />
                        <span className="text-sm text-slatey">Submit answers and get AI analysis</span>
                      </div>
                      <Link to="/membership" className="text-xs font-medium text-coral hover:text-ink transition-colors">
                        Unlock
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
