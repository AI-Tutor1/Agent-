'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { FormInput, FormTextarea, FormSelect } from '@/components/forms/FormField';
import { SegmentedSelector } from '@/components/forms/SegmentedSelector';
import { SearchableDropdown } from '@/components/forms/SearchableDropdown';
import { MultiSelectChips } from '@/components/forms/MultiSelectChips';
import { api, type RecentSubmission } from '@/lib/api';

type SubmissionStatus = 'Processing' | 'Awaiting Sales' | 'Pending Review' | 'Reviewed' | 'Escalated';

const statusColors: Record<SubmissionStatus, string> = {
  'Processing': 'var(--status-active)',
  'Awaiting Sales': 'var(--status-pending)',
  'Pending Review': 'var(--status-shadow)',
  'Reviewed': 'var(--status-approved)',
  'Escalated': 'var(--status-error)',
};

export default function CounselorPage() {
  const router = useRouter();
  const { user, viewMode, setViewMode } = useAuthStore();

  const [teachers, setTeachers] = useState<{ name: string; subjects: string[] }[]>([]);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [academicLevels, setAcademicLevels] = useState<string[]>([]);
  const [curriculumBoards, setCurriculumBoardsList] = useState<string[]>([]);
  const [rateTiers, setRateTiers] = useState<string[]>([]);
  const [curriculumHintsMap, setCurriculumHintsMap] = useState<Record<string, Record<string, string>>>({});
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role === 'sales') { router.push('/sales'); return; }
    if (user.role === 'manager') { router.push('/manager'); return; }
  }, [user, router]);

  useEffect(() => {
    api.teachers.getAll().then(setTeachers).catch(() => {});
    api.teachers.getSubjects().then(setAllSubjects).catch(() => {});
    api.teachers.getAcademicLevels().then(setAcademicLevels).catch(() => {});
    api.teachers.getCurriculumBoards().then(setCurriculumBoardsList).catch(() => {});
    api.teachers.getRateTiers().then(setRateTiers).catch(() => {});
    api.teachers.getCurriculumHints().then(setCurriculumHintsMap).catch(() => {});
    api.demos.getSubmissions()
      .then(setRecentSubmissions)
      .catch(() => setRecentSubmissions([]))
      .finally(() => setSubmissionsLoading(false));
  }, []);

  const [demoDate, setDemoDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherName, setTeacherName] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [studentName, setStudentName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [curriculumBoard, setCurriculumBoard] = useState('');
  const [curriculumCode, setCurriculumCode] = useState('');
  const [rateTier, setRateTier] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const teacherOptions = teachers.map((t) => ({
    label: t.name,
    sublabel: t.subjects.join(', '),
  }));

  const handleTeacherSelect = (name: string) => {
    setTeacherName(name);
    const teacher = teachers.find((t) => t.name === name);
    if (teacher) setSubjects(teacher.subjects);
  };

  const curriculumHint = (() => {
    const sub = subjects[0];
    if (sub && curriculumBoard && curriculumHintsMap[sub]?.[curriculumBoard]) {
      return curriculumHintsMap[sub][curriculumBoard];
    }
    return undefined;
  })();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!demoDate) e.demoDate = 'Required';
    if (!teacherName) e.teacherName = 'Required';
    if (!academicLevel) e.academicLevel = 'Required';
    if (!studentName || studentName.length < 2) e.studentName = 'Min 2 characters';
    if (subjects.length === 0) e.subjects = 'At least one subject required';
    if (!rateTier) e.rateTier = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setDemoDate(new Date().toISOString().split('T')[0]);
    setTeacherName('');
    setAcademicLevel('');
    setStudentName('');
    setSubjects([]);
    setCurriculumBoard('');
    setCurriculumCode('');
    setRateTier('');
    setPainPoints('');
    setSessionNotes('');
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitState('loading');

    try {
      await api.demos.submit({
        demo_date: demoDate,
        teacher_name: teacherName,
        academic_level: academicLevel,
        student_name: studentName,
        subjects,
        curriculum_board: curriculumBoard || undefined,
        curriculum_code: curriculumCode || undefined,
        rate_tier: rateTier,
        pain_points: painPoints || undefined,
        session_notes: sessionNotes || undefined,
        logged_by: user?.name,
      });

      setSubmitState('success');

      // Refresh submissions from API
      api.demos.getSubmissions()
        .then(setRecentSubmissions)
        .catch(() => {});

      setTimeout(() => {
        resetForm();
        setSubmitState('idle');
      }, 2000);
    } catch {
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-canvas)]">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <span className="text-[var(--gold-400)] text-lg">◆</span>
          <span className="font-['Syne'] font-bold text-[var(--text-primary)]">Tuitional</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-['DM_Sans'] text-[var(--text-secondary)]">{user.name}</span>
          {user.role === 'dual' && (
            <button
              onClick={() => { setViewMode('manager'); router.push('/manager'); }}
              className="text-xs font-['Syne'] font-medium text-[var(--gold-400)] hover:underline"
            >
              Switch to Manager →
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-6 py-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-['Syne'] font-bold text-2xl text-[var(--text-primary)]">Log Demo Session</h1>
          <p className="text-sm font-['DM_Sans'] text-[var(--text-secondary)] mt-1">
            Fill once. The agent handles the rest.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-xl p-8 space-y-6">
          {/* Section 1: Session Details */}
          <div className="space-y-4">
            <FormInput
              label="Demo Date"
              required
              type="date"
              value={demoDate}
              onChange={(e) => setDemoDate(e.target.value)}
              error={errors.demoDate}
            />
            <SearchableDropdown
              label="Teacher"
              required
              options={teacherOptions}
              value={teacherName}
              onChange={handleTeacherSelect}
              placeholder="Search teacher..."
              error={errors.teacherName}
            />
            <SegmentedSelector
              label="Academic Level"
              required
              options={academicLevels}
              value={academicLevel}
              onChange={setAcademicLevel}
              error={errors.academicLevel}
            />
          </div>

          <div className="border-t border-[var(--border-subtle)]" />

          {/* Section 2: Student & Curriculum */}
          <div className="space-y-4">
            <FormInput
              label="Student / Parent Name"
              required
              placeholder="Student name (Parent: parent name)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onBlur={() => studentName.length > 0 && studentName.length < 2 && setErrors((e) => ({ ...e, studentName: 'Min 2 characters' }))}
              error={errors.studentName}
            />
            <MultiSelectChips
              label="Subject(s)"
              required
              options={allSubjects}
              selected={subjects}
              onChange={setSubjects}
              error={errors.subjects}
            />
            <FormSelect
              label="Curriculum Board"
              options={curriculumBoards}
              value={curriculumBoard}
              onChange={setCurriculumBoard}
              placeholder="Select board..."
            />
            <FormInput
              label="Curriculum Code"
              placeholder="e.g. 4EA1, 0522, 9709"
              value={curriculumCode}
              onChange={(e) => setCurriculumCode(e.target.value)}
              helperText={curriculumHint || 'Find this on your exam board website'}
            />
          </div>

          <div className="border-t border-[var(--border-subtle)]" />

          {/* Section 3: Context */}
          <div className="space-y-4">
            <SegmentedSelector
              label="Rate Tier"
              required
              options={rateTiers}
              value={rateTier}
              onChange={setRateTier}
              error={errors.rateTier}
            />
            <FormTextarea
              label="Student Pain Points"
              placeholder="What is the student struggling with? Specific topics, exam requirements, parent expectations..."
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <FormTextarea
              label="Session Notes"
              placeholder="Any additional context for the agent..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
              maxLength={300}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitState === 'loading' || submitState === 'success'}
          className={`w-full mt-6 min-h-[48px] rounded-lg font-['Syne'] font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
            ${submitState === 'success'
              ? 'bg-[var(--status-active)] text-white'
              : submitState === 'error'
                ? 'bg-[var(--status-error)] text-white'
                : 'bg-[var(--gold-400)] text-[#080810] hover:brightness-110'
            }
            disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {submitState === 'loading' && <><Loader2 size={16} className="animate-spin" /> Saving...</>}
          {submitState === 'success' && <><Check size={16} /> Logged Successfully</>}
          {submitState === 'error' && <><X size={16} /> Something went wrong — try again</>}
          {submitState === 'idle' && 'Log Demo Session'}
        </button>

        {/* Recent Submissions */}
        <div className="mt-10">
          <h2 className="font-['Syne'] font-semibold text-lg text-[var(--text-primary)] mb-4">Recent Submissions</h2>

          {submissionsLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg" />
              ))}
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="font-['Syne'] text-sm font-semibold text-[var(--text-primary)] mb-1">No submissions yet</p>
              <p className="text-[var(--text-muted)] text-xs font-['DM_Sans']">Your logged demos will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-['JetBrains_Mono'] text-[var(--text-muted)] w-12 flex-shrink-0">{sub.date}</span>
                    <span className="text-sm font-['DM_Sans'] text-[var(--text-primary)] truncate">
                      {sub.teacher} <ChevronRight size={12} className="inline text-[var(--text-muted)]" /> {sub.student}
                    </span>
                    <span className="text-xs font-['DM_Sans'] text-[var(--text-muted)] flex-shrink-0">
                      {sub.level} · {sub.subject}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-['DM_Sans'] flex-shrink-0"
                    style={{
                      color: statusColors[sub.status as SubmissionStatus] ?? 'var(--text-muted)',
                      borderColor: statusColors[sub.status as SubmissionStatus] ?? 'var(--text-muted)',
                      backgroundColor: `color-mix(in srgb, ${statusColors[sub.status as SubmissionStatus] ?? 'var(--text-muted)'} 10%, transparent)`,
                    }}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
