# CareerLens AI

AI-powered resume analysis and job matching platform.

CareerLens AI compares your resume against a job description and produces a transparent
keyword-match score (0–100), highlights matched and missing keywords, surfaces strengths,
suggests improvements, and drafts an editable professional summary — all running entirely in
your browser with no backend, account, or API key required.

## Features

- Upload a PDF or TXT resume (parsed in the browser via pdf.js), or paste resume text directly
- Paste a job description (with a one-click clipboard paste helper)
- Transparent keyword-match score from 0–100, color-coded and visualized with an animated gauge
- Matched keywords (with occurrence counts) and missing keywords shown as chips
- Auto-detected strengths and tailored improvement suggestions
- Editable suggested professional summary
- Download the full analysis as a `.txt` report
- "Try Demo" button with sample resume + job data so the app works instantly
- Clearly labeled as a keyword-overlap heuristic, not a true AI model or guaranteed ATS score
- Fully responsive, accessible, with loading and error states

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- pdfjs-dist (in-browser PDF text extraction)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
npm run typecheck
npm run lint
```

## Notes

The keyword-match score is a transparent heuristic: it measures how many keywords from the
job description appear in your resume. It is **not** a true AI model and **not** a guaranteed
ATS (Applicant Tracking System) score. Real hiring decisions weigh experience, impact, and
fit far beyond keywords — always tailor your resume honestly.
