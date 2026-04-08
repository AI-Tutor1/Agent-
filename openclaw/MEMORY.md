# MEMORY.md — Wajeeha Demo-to-Conversion Agent

## Standing Operating Rules

### Data Sources (always use these, never guess)
- **Conducted Demo Sessions**: Google Sheet → `conducted_demo_sessions` SQL table (columns: demo_id, date, month, teacher_name, student_name, level, subject)
- **Demo Feedback Form (2.0)**: Google Sheet → `demo_feedback` SQL table (columns: timestamp, tutor_name, student_name, subject, date, overall_rating_10, topic_explained, participation, confusion_moments, discomfort, positive_environment, suggestions, comments)
- **Demo-to-Conversion Sales**: Google Sheet → `demo_conversion_sales` SQL table (columns: date, teacher_name, student_name, level, subject, conversion_status, sales_comments, sales_agent, parent_contact)
- **Counseling Product Sheet (Wajeeha)**: Google Sheet → `counseling_product` SQL table (tabs: form_responses, pour_flags, demo_to_conversion, sheet30)

### Rating Conversion Rule
Student raw rating is out of 10. Convert to /5 by dividing by 2 and rounding UP to the nearest whole number.
- 10 → 5
- 9 → 5
- 8 → 4
- 7 → 4
- 6 → 3
- 5 → 3
- 4 → 2
- Below 4 → flag immediately as low-rated demo

### POUR Categories (all 7 must be checked for every demo)
1. **Video** — Recording unavailable, camera off, video quality issue
2. **Interaction** — Insufficient student engagement, one-sided session, no questions asked/answered
3. **Technical** — Audio issues, platform problems, connectivity, whiteboard not working
4. **Cancellation** — Demo cancelled, rescheduled, student/tutor no-show
5. **Resources** — Wrong materials used, wrong curriculum level, wrong exam board, no past paper when needed
6. **Time** — Session too short, ran overtime, time wasted on setup, wrong topic covered due to time constraint
7. **No Show** — Student or tutor did not attend

### Accountability Classification Rules (for Not Converted demos)
- **Sales Accountability**: Poor follow-up, wrong closing strategy, decision maker not identified, payment not qualified, intent not assessed, rapport not established before close, paid demo not offered when it should have been
- **Product Accountability**: Wrong teacher allocated, curriculum mismatch, demo not curated to student's actual needs, teacher had known issues (accent, pace, engagement) that should have been anticipated
- **Consumer Accountability**: Parent ghosting, student genuinely not ready, external reasons (face-to-face preference, cost beyond budget, chose different option after good demo)
- **Mixed**: Can be classified as two categories — state both with evidence

### Sheet30 Master Compilation Logic
Export from `demo_to_conversion` sheet columns A,B,C,D,E,F,H,I,J into Sheet30 columns A,B,C,D,E,F,G,H,I
Export from `demo_conversion_sales` sheet columns F,G,H into Sheet30 columns J,K,L
Column M in Sheet30 = Accountability Classification

### Teacher Progress Report
Built from Sheet30 data. For each teacher:
- Total demos conducted
- Converted / Not Converted / Pending count
- Average student rating (converted to /5)
- Average analyst rating (/5)
- POUR frequency breakdown
- Accountability classification frequency (how many times teacher was Product Accountability)
- Qualitative pattern notes (recurring issues from sales comments)

---

## Active Context

### Current Status
Shadow mode — all analyses produced but not actioned live. Dawood Larejani reviews every output.

### Known Teacher Profile Notes (extracted from real data)
- **Inayat Karim**: Strong resource allocation when curated well. Rapport issues when demo not properly monitored. IGCSE Maths specialist.
- **Alishba Shahzad**: Grammatical errors in spoken English noted as recurring issue at Grade 1-8 level. Good conversion rate when persona is matched.
- **Nageena Arif**: English demos problematic (accent/pronunciation). Strong at lower grade Maths/Science when demo is well-curated.
- **Mahnoor Gul**: High conversion when accent match is the key parent requirement.
- **Zehra Saleem**: Consistent performer for English. Good interactivity.
- **Vivek Madan**: Camera must be on during demos — recurring issue. Strong delivery when engaged.
- **Faizan Altaf**: Fluency and rapport issues documented. Recurring low conversion in mismatched demos.
- **Moazzam Malik**: High student satisfaction. Strong for IGCSE/A-Level Maths.
- **Ahrar**: Highly interactive. Strong Biology and Sciences.

### Known POUR Patterns (from sales data analysis)
- Pace issues (too fast) are the single most common student complaint across all subjects
- Camera off by tutor is a recurring negative signal, especially for parents
- Decision maker (parent) absent from demo is a leading indicator of no-conversion
- Paid demo strategy significantly increases commitment and conversion probability
- Demos for Grade 1-8 English with non-native accent tutors have a structural mismatch risk

### Decisions Log
- 2026-04-07: Agent initialised. Shadow mode begins. All outputs to Dawood Agent for review.
- Rating conversion rule confirmed: divide by 2, round up.
- POUR classification scope confirmed: all 7 categories checked per demo.
- Accountability classification scope confirmed: Sales / Product / Consumer / Mixed.

---

## Escalation Rules
1. No recording + no feedback form match → flag to Dawood Agent, mark demo as INCOMPLETE
2. Teacher name not found in teacher profiles database → flag as DATA INTEGRITY issue to CTO
3. Accountability classification is ambiguous after analysis → present to Dawood Agent with both options and evidence
4. Teacher has 3+ consecutive Product Accountability flags → escalate to Dawood Agent for teacher review
5. Sales agent has 5+ consecutive Sales Accountability flags in same month → escalate to CSO Agent
