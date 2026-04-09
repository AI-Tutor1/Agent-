// fuzzy-match.ts — Name matching utilities with Levenshtein distance

import { pool } from '../db';
import { TeacherProfile } from '../types/database';
import { flagDataIntegrity } from './sheets-client';

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function normalizeTeacherName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export interface MatchResult {
  teacher: TeacherProfile;
  confidence: 'exact' | 'fuzzy';
}

export function matchTeacherName(
  inputName: string,
  teacherProfiles: TeacherProfile[]
): MatchResult | null {
  const normalized = normalizeTeacherName(inputName);

  // 1. Exact match on normalized name
  for (const teacher of teacherProfiles) {
    if (normalizeTeacherName(teacher.teacher_name) === normalized) {
      return { teacher, confidence: 'exact' };
    }
  }

  // 2. Check name_aliases
  for (const teacher of teacherProfiles) {
    if (teacher.name_aliases) {
      for (const alias of teacher.name_aliases) {
        if (normalizeTeacherName(alias) === normalized) {
          return { teacher, confidence: 'exact' };
        }
      }
    }
  }

  // 3. Levenshtein distance ≤ 3
  let bestMatch: MatchResult | null = null;
  let bestDistance = Infinity;

  for (const teacher of teacherProfiles) {
    const distance = levenshtein(normalized, normalizeTeacherName(teacher.teacher_name));
    if (distance <= 3 && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = { teacher, confidence: 'fuzzy' };
    }

    if (teacher.name_aliases) {
      for (const alias of teacher.name_aliases) {
        const aliasDistance = levenshtein(normalized, normalizeTeacherName(alias));
        if (aliasDistance <= 3 && aliasDistance < bestDistance) {
          bestDistance = aliasDistance;
          bestMatch = { teacher, confidence: 'fuzzy' };
        }
      }
    }
  }

  return bestMatch;
}

export async function matchTeacherNameFromDB(inputName: string): Promise<MatchResult | null> {
  try {
    const result = await pool.query<TeacherProfile>(
      `SELECT * FROM teacher_profiles WHERE status = 'active'`
    );
    const match = matchTeacherName(inputName, result.rows);

    if (!match) {
      await flagDataIntegrity({
        source_table: 'teacher_profiles',
        source_id: inputName,
        flag_type: 'unmatched_record',
        description: `No teacher profile match found for name: "${inputName}"`,
      });
    }

    return match;
  } catch (err) {
    console.error('[fuzzy-match] Failed to query teacher_profiles:', err);
    return null;
  }
}

export interface FeedbackRecord {
  tutor_name: string;
  student_name: string;
  session_date: string;
}

export interface DemoMatchResult {
  demo_id: string;
  match_confidence: 'exact' | 'fuzzy' | 'unmatched';
}

export function matchDemoToFeedback(
  teacherName: string,
  studentName: string,
  demoDate: Date,
  demoSessions: Array<{ demo_id: string; teacher_name: string; student_name: string; demo_date: Date }>
): DemoMatchResult {
  const normalTeacher = normalizeTeacherName(teacherName);
  const normalStudent = normalizeTeacherName(studentName);
  const demoTime = demoDate.getTime();

  // 1. Exact match on all three
  for (const session of demoSessions) {
    const sessionTime = new Date(session.demo_date).getTime();
    if (
      normalizeTeacherName(session.teacher_name) === normalTeacher &&
      normalizeTeacherName(session.student_name) === normalStudent &&
      Math.abs(sessionTime - demoTime) < 86400000 // same day
    ) {
      return { demo_id: session.demo_id, match_confidence: 'exact' };
    }
  }

  // 2. Teacher + student match with date within ±2 days
  for (const session of demoSessions) {
    const sessionTime = new Date(session.demo_date).getTime();
    const daysDiff = Math.abs(sessionTime - demoTime) / 86400000;
    if (
      normalizeTeacherName(session.teacher_name) === normalTeacher &&
      normalizeTeacherName(session.student_name) === normalStudent &&
      daysDiff <= 2
    ) {
      return { demo_id: session.demo_id, match_confidence: 'fuzzy' };
    }
  }

  // 3. Teacher fuzzy match + student + date ±2 days
  for (const session of demoSessions) {
    const sessionTime = new Date(session.demo_date).getTime();
    const daysDiff = Math.abs(sessionTime - demoTime) / 86400000;
    const teacherDist = levenshtein(normalTeacher, normalizeTeacherName(session.teacher_name));
    if (
      teacherDist <= 3 &&
      normalizeTeacherName(session.student_name) === normalStudent &&
      daysDiff <= 2
    ) {
      return { demo_id: session.demo_id, match_confidence: 'fuzzy' };
    }
  }

  return { demo_id: '', match_confidence: 'unmatched' };
}
