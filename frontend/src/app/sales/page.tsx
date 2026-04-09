'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronUp, Loader2, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { FormTextarea, FormInput, FormSelect } from '@/components/forms/FormField';
import { MultiSelectChips } from '@/components/forms/MultiSelectChips';
import { StarRating } from '@/components/forms/StarRating';
import { api, type PendingDemo } from '@/lib/api';

type ConversionStatus = 'Converted' | 'Not Converted' | 'Pending' | '';

interface CompletedItem {
  teacher: string;
  student: string;
  status: ConversionStatus;
}

export default function SalesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'counselor') { router.push('/counselor'); return; }
    if (user.role === 'manager') { router.push('/manager'); return; }
  }, [user, router]);

  const [pendingDemos, setPendingDemos] = useState<PendingDemo[]>([]);
  const [lostReasonOptions, setLostReasonOptions] = useState<string[]>([]);
  const [followUpOptions, setFollowUpOptions] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<CompletedItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  useEffect(() => {
    api.demos.getPending()
      .then(setPendingDemos)
      .catch(() => setPendingDemos([]))
      .finally(() => setPendingLoading(false));
    api.demos.getLostReasons().then(setLostReasonOptions).catch(() => {});
    api.demos.getFollowUpOptions().then(setFollowUpOptions).catch(() => {});
  }, []);

  // Form state
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>('');
  const [studentRating, setStudentRating] = useState(0);
  const [studentFeedback, setStudentFeedback] = useState('');
  const [salesComments, setSalesComments] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [lostReasons, setLostReasons] = useState<string[]>([]);
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const resetForm = () => {
    setConversionStatus('');
    setStudentRating(0);
    setStudentFeedback('');
    setSalesComments('');
    setParentContact('');
    setLostReasons([]);
    setFollowUpPlan('');
    setErrors({});
    setSubmitState('idle');
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      resetForm();
    } else {
      setExpandedId(id);
      resetForm();
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!conversionStatus) e.conversionStatus = 'Required';
    if (studentRating < 1) e.studentRating = 'Required';
    if (studentFeedback.length < 10) e.studentFeedback = 'Min 10 characters';
    if (salesComments.length < 20) e.salesComments = 'Min 20 characters';
    if (conversionStatus === 'Not Converted') {
      if (lostReasons.length === 0) e.lostReasons = 'At least one reason required';
      if (!followUpPlan) e.followUpPlan = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (demo: PendingDemo) => {
    if (!validate()) return;
    setSubmitState('loading');

    try {
      await api.demos.submitSalesOutcome(demo.id, {
        conversion_status: conversionStatus,
        student_rating: studentRating,
        student_feedback: studentFeedback,
        sales_comments: salesComments,
        parent_contact: parentContact || undefined,
        lost_reasons: conversionStatus === 'Not Converted' ? lostReasons : undefined,
        follow_up_plan: conversionStatus === 'Not Converted' ? followUpPlan : undefined,
      });

      setSubmitState('success');
      setTimeout(() => {
        setCompleted((prev) => [
          { teacher: demo.teacher, student: demo.student, status: conversionStatus },
          ...prev,
        ]);
        setPendingDemos((prev) => prev.filter((d) => d.id !== demo.id));
        setExpandedId(null);
        resetForm();
      }, 600);
    } catch {
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 3000);
    }
  };

  const statusButtons: { label: string; value: ConversionStatus; icon: React.ReactNode; color: string }[] = [
    { label: 'Converted', value: 'Converted', icon: <Check size={20} />, color: 'var(--converted)' },
    { label: 'Not Converted', value: 'Not Converted', icon: <X size={20} />, color: 'var(--not-converted)' },
    { label: 'Pending', value: 'Pending', icon: <div className="w-4 h-4 rounded-full border-2 border-current" />, color: 'var(--pending-conv)' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-canvas)]">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <span className="text-[var(--gold-400)] text-lg">◆</span>
          <span className="font-['Syne'] font-bold text-[var(--text-primary)]">Tuitional</span>
        </button>
        <span className="text-sm font-['DM_Sans'] text-[var(--text-secondary)]">{user.name}</span>
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-['Syne'] font-bold text-2xl text-[var(--text-primary)]">Log Demo Outcome</h1>
          <p className="text-sm font-['DM_Sans'] text-[var(--text-secondary)] mt-1">
            Fill once after the demo call. The agent handles the rest.
          </p>
        </div>

        {/* Pending Queue */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)]">Awaiting Your Input</h2>
            <span className="bg-[var(--gold-dim)] text-[var(--gold-400)] text-xs font-['JetBrains_Mono'] px-2 py-0.5 rounded-full">
              {pendingLoading ? '…' : pendingDemos.length}
            </span>
          </div>

          {pendingLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-lg" />
              ))}
            </div>
          ) : pendingDemos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-[var(--text-muted)]">
              <CheckCircle2 size={24} />
              <p className="font-['DM_Sans'] text-sm">All caught up — no demos waiting for your input</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {pendingDemos.map((demo) => (
                  <motion.div
                    key={demo.id}
                    layout
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-lg overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-['Syne'] font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                          {demo.teacher} <ChevronRight size={14} className="text-[var(--text-muted)]" /> {demo.student}
                        </div>
                        <div className="text-[13px] font-['DM_Sans'] text-[var(--text-secondary)] mt-0.5">
                          {demo.level} · {demo.subject} · Logged{' '}
                          <span className="font-['JetBrains_Mono'] text-[var(--text-muted)]">{demo.loggedAgo}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(demo.id)}
                        className="text-sm font-['Syne'] font-medium text-[var(--gold-400)] hover:underline flex items-center gap-1"
                      >
                        {expandedId === demo.id ? (
                          <><ChevronUp size={14} /> Collapse</>
                        ) : (
                          <>Fill Outcome <ChevronRight size={14} /></>
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedId === demo.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[var(--border-subtle)] px-4 py-5 space-y-5">
                            <div className="text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
                              Teacher: {demo.teacher} · Student: {demo.student} · {demo.level} · {demo.subject}
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[13px] font-['DM_Sans'] text-[var(--text-secondary)]">
                                Conversion Status<span className="text-[var(--form-error)] ml-0.5">*</span>
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {statusButtons.map((btn) => (
                                  <motion.button
                                    key={btn.value}
                                    type="button"
                                    onClick={() => { setConversionStatus(btn.value); setErrors((e) => { const n = { ...e }; delete n.conversionStatus; return n; }); }}
                                    animate={{ scale: conversionStatus === btn.value ? 1.02 : 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="min-h-[64px] rounded-lg font-['Syne'] font-semibold text-sm border-2 transition-all duration-150 flex flex-col items-center justify-center gap-1"
                                    style={{
                                      backgroundColor: conversionStatus === btn.value ? `color-mix(in srgb, ${btn.color} 15%, transparent)` : 'var(--bg-surface-2)',
                                      borderColor: conversionStatus === btn.value ? btn.color : 'var(--border-default)',
                                      color: conversionStatus === btn.value ? btn.color : 'var(--text-secondary)',
                                    }}
                                  >
                                    {btn.icon}
                                    {btn.label}
                                  </motion.button>
                                ))}
                              </div>
                              {errors.conversionStatus && (
                                <p className="text-[12px] font-['DM_Sans'] text-[var(--form-error)]">{errors.conversionStatus}</p>
                              )}
                            </div>

                            <StarRating
                              label="Student Rating (1-10) *"
                              required
                              value={studentRating}
                              onChange={(v) => { setStudentRating(v); setErrors((e) => { const n = { ...e }; delete n.studentRating; return n; }); }}
                              error={errors.studentRating}
                            />

                            <FormTextarea
                              label="Student Feedback"
                              required
                              placeholder="What did the student or parent say after the demo? Their exact words if possible."
                              value={studentFeedback}
                              onChange={(e) => setStudentFeedback(e.target.value)}
                              onBlur={() => studentFeedback.length > 0 && studentFeedback.length < 10 && setErrors((e) => ({ ...e, studentFeedback: 'Min 10 characters' }))}
                              rows={3}
                              error={errors.studentFeedback}
                            />

                            <FormTextarea
                              label="Sales Comments"
                              required
                              placeholder="Why did it convert or not convert? Resource allocation, parent persona, closing strategy..."
                              value={salesComments}
                              onChange={(e) => setSalesComments(e.target.value)}
                              onBlur={() => salesComments.length > 0 && salesComments.length < 20 && setErrors((e) => ({ ...e, salesComments: 'Min 20 characters' }))}
                              rows={4}
                              error={errors.salesComments}
                              helperText="Tip: The agent uses this directly for accountability classification. The more specific, the more accurate."
                            />

                            <FormInput
                              label="Parent Contact"
                              type="tel"
                              placeholder="+971"
                              value={parentContact}
                              onChange={(e) => setParentContact(e.target.value)}
                            />

                            <AnimatePresence>
                              {conversionStatus === 'Not Converted' && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-5 overflow-hidden"
                                >
                                  <MultiSelectChips
                                    label="Why did it not convert?"
                                    required
                                    options={lostReasonOptions}
                                    selected={lostReasons}
                                    onChange={(v) => { setLostReasons(v); setErrors((e) => { const n = { ...e }; delete n.lostReasons; return n; }); }}
                                    error={errors.lostReasons}
                                  />
                                  <FormSelect
                                    label="Follow-up Plan"
                                    required
                                    options={followUpOptions}
                                    value={followUpPlan}
                                    onChange={(v) => { setFollowUpPlan(v); setErrors((e) => { const n = { ...e }; delete n.followUpPlan; return n; }); }}
                                    placeholder="Select plan..."
                                    error={errors.followUpPlan}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <button
                              type="button"
                              onClick={() => handleSubmit(demo)}
                              disabled={submitState === 'loading' || submitState === 'success'}
                              className={`w-full min-h-[48px] rounded-lg font-['Syne'] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                                ${submitState === 'success'
                                  ? 'bg-[var(--status-active)] text-white'
                                  : submitState === 'error'
                                    ? 'bg-[var(--status-error)] text-white'
                                    : 'bg-[var(--gold-400)] text-[#080810] hover:brightness-110'
                                }
                                disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                              {submitState === 'loading' && <><Loader2 size={16} className="animate-spin" /> Saving...</>}
                              {submitState === 'success' && <><Check size={16} /> Submitted</>}
                              {submitState === 'error' && <><X size={16} /> Something went wrong</>}
                              {submitState === 'idle' && 'Submit Outcome'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Completed Section */}
        {completed.length > 0 && (
          <div>
            <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Completed Today</h2>
            <div className="space-y-2">
              {completed.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg px-4 py-3"
                >
                  <span className="font-['DM_Sans'] text-sm text-[var(--text-primary)]">
                    {item.teacher} → {item.student}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-['DM_Sans']"
                    style={{
                      color: item.status === 'Converted' ? 'var(--converted)' : item.status === 'Not Converted' ? 'var(--not-converted)' : 'var(--pending-conv)',
                      borderColor: item.status === 'Converted' ? 'var(--converted)' : item.status === 'Not Converted' ? 'var(--not-converted)' : 'var(--pending-conv)',
                      backgroundColor: `color-mix(in srgb, ${item.status === 'Converted' ? 'var(--converted)' : item.status === 'Not Converted' ? 'var(--not-converted)' : 'var(--pending-conv)'} 10%, transparent)`,
                    }}
                  >
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
