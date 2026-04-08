export interface RatingResult {
  student_rating_raw: number | null
  student_rating_converted: number | null
  analyst_rating: number | null
}

// Student rating conversion rule:
// Divide raw /10 rating by 2, round UP to nearest whole number (Math.ceil)
// 10→5, 9→5, 8→4, 7→4, 6→3, 5→3, 4→2, below 4 → flag as low-rated
export function convertStudentRating(rawRating: number | null): number | null {
  if (rawRating === null || rawRating === undefined) return null

  // Clamp to valid range
  const clamped = Math.max(1, Math.min(10, rawRating))
  return Math.ceil(clamped / 2)
}

export function isLowRatedDemo(rawRating: number | null): boolean {
  if (rawRating === null) return false
  return rawRating < 4
}

export function standardiseRatings(
  feedbackRaw: number | null,
  analystRatingFromClaude: number | null
): RatingResult {
  const converted = convertStudentRating(feedbackRaw)

  // Clamp analyst rating to 1-5
  let analystRating: number | null = null
  if (analystRatingFromClaude !== null && analystRatingFromClaude !== undefined) {
    analystRating = Math.max(1, Math.min(5, Math.round(analystRatingFromClaude)))
  }

  return {
    student_rating_raw: feedbackRaw,
    student_rating_converted: converted,
    analyst_rating: analystRating
  }
}
