# CONTEXT.md — Tuitional Business Brain (Company-Level Context)

## Purpose
This file is the company-level context loaded by every agent. It answers:
"What company do I work for? What does it do? Who are the customers? How do we communicate?"
Without this, agents make generic decisions. With this, they make Tuitional decisions.

---

## 1. Company Identity

**Company**: Tuitional Education
**Legal Entity**: Registered at Sharjah Research & Technology Park, UAE (2022)
**CEO**: Husni Mubarak
**Website**: https://tuitionaledu.com/
**Tagline**: Premium online tutoring for Gulf families
**Market Position**: Centralised model — Tuitional mediates every teacher-student interaction. This is a defensible competitive position that creates a permanent role for AI agents as coordination intelligence.

---

## 2. Products

### Product 1: Tuitional Education (TuEd)
- **Type**: B2C online tutoring service
- **Revenue**: Per-session fees from Gulf parents (UAE, Qatar, KSA)
- **Students**: 50,000+ registered, 500+ active tutors
- **Curriculum**: IGCSE, GCSE, A-Levels, IB, Grades 1-8, University
- **Exam Boards**: Pearson Edexcel, Cambridge IGCSE/A Level, AQA, OCR, IB (MYP/DP), CBSE
- **Volume**: ~20 inquiries/day, ~4 trials/day, ~3 conversions/day
- **Pricing**: Standard rate and Premium rate tiers per teacher
- **Process**: Inquiry → Demo session → Teacher matching → Trial → Conversion → Ongoing tutoring

### Product 2: Tuitional AI (TuAI)
- **Type**: B2B/B2B2C SaaS platform for educational institutions
- **Revenue**: Institutional subscriptions + per-student licensing
- **Market**: Schools and institutions globally
- **Status**: Developed — seeking first institutional clients
- **Modules**: Automated Grading Engine, Analytics Engine, Lumi (AI Study Assistant), Notes Creator, Presentation Creator, Flashcard Creator, Study Buddy/Planner
- **Technology**: RAG-based implementation, curriculum-aware grading

### Product 3: Tuitional LMS (Phase 2)
- **Type**: Publicly available LMS SaaS platform
- **Status**: Phase 2 — not in current scope
- **Separate entity, separate build roadmap**

---

## 3. Customer Profile

### Primary Customer: Gulf Parents
- **Location**: UAE, Qatar, KSA (GCC region)
- **Income**: Premium segment — paying for quality education
- **Expectations**: High standards, responsive communication, visible academic improvement
- **Sensitivity**: Accent-aware (English is a core subject), culturally sensitive communication
- **Communication**: WhatsApp-first, expects quick responses
- **Decision factors**: Teacher quality, curriculum alignment, scheduling flexibility, price-to-value ratio
- **Pain points**: Finding qualified tutors for specific exam boards, last-minute exam preparation, progress visibility

### Secondary Customer: Educational Institutions (TuAI)
- **Type**: Schools, tutoring centres, educational organisations
- **Need**: Automated grading, student analytics, AI-assisted learning tools
- **Decision makers**: School principals, academic directors, IT heads
- **Sales cycle**: Longer, requires demos, ROI proof, data security assurance

---

## 4. Communication Style

### With Parents
- Professional but warm. Never robotic.
- Address concerns immediately — Gulf parents expect responsiveness
- Always reference the specific child's progress, never generic updates
- Respect cultural norms — use appropriate titles, be mindful of gender dynamics
- Pricing discussions: present both options (standard + premium) with clear value difference

### With Teachers
- Direct and professional
- Feedback must be constructive — never accusatory
- Reference specific curriculum codes and exam board requirements
- Performance discussions based on data, not opinion

### With Internal Team
- Action-oriented. Ship first, discuss second.
- Every message should have a clear next step
- Escalations must state the blocker explicitly, not just "there's a problem"

---

## 5. Key Business Rules

### Pricing
- Every proposal presents TWO teacher options: standard rate and premium rate
- Rate cards maintained by Finance department — agents never modify rates
- Custom pricing requires CEO approval

### Teacher Matching
- Curriculum code alignment is MANDATORY — never match without verifying exam board
- Teacher must cover the specific syllabus (e.g., Edexcel 4EA1 vs Cambridge 0580)
- Both options must differ in teaching STYLE, not just price
- Teacher availability and capacity checked before proposing

### Quality Standards
- Every demo session is analysed using the POUR framework
- POUR categories: Video, Interaction, Technical, Cancellation, Resources, Time, No Show
- Teachers with 3+ consecutive Product Accountability flags trigger review
- Student feedback ratings: raw /10 converted to /5 for standardisation

### Conversion Process
- Demo → Analysis → Teacher Matching → Proposal → Parent Review → Conversion/Loss
- Non-conversions classified by accountability: Sales / Product / Consumer / Mixed
- Follow-up required within 24 hours if no parent response
- Lost reason must be categorised: price, teacher mismatch, timing, competitor, face-to-face preference

---

## 6. Competitive Landscape
- Direct competitors: MyTutor, Tutorful, Superprof (global); local Gulf tutoring services
- Tuitional's edge: centralised coordination model, curriculum specialisation, Gulf market focus
- Threat: face-to-face tutoring preference in some Gulf families
- Opportunity: AI-powered matching and quality assurance as differentiator

---

## 7. Current Priorities (2026)
1. Build and validate the AI Company OS (Agent One: Wajeeha)
2. Improve demo-to-conversion rate through faster, smarter matching
3. Acquire first TuAI institutional clients
4. Launch Tuitional LMS as public SaaS (Phase 2)
5. Scale agent system to all 8 departments
