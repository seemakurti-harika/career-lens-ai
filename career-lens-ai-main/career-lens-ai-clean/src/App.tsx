import { useCallback, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Wand2,
  ClipboardPaste,
  X,
  Info,
  RotateCcw,
} from "lucide-react";
import { analyzeResume } from "@/lib/keywordAnalysis";
import { extractPdfText } from "@/lib/pdfExtract";
import { buildReport, downloadTextFile } from "@/lib/report";
import { SAMPLE_RESUME, SAMPLE_JOB } from "@/lib/sampleData";
import type { AnalysisResult } from "@/lib/types";
import { ScoreGauge } from "@/components/ScoreGauge";
import { KeywordChips } from "@/components/KeywordChips";

type Status = "idle" | "parsing" | "analyzing" | "done" | "error";

const ACCEPTED_TYPES = ["application/pdf", "text/plain", "text/pdf"];

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editableSummary, setEditableSummary] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError("");
    setResult(null);
    setEditableSummary("");
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !/\.(pdf|txt)$/i.test(file.name)) {
      setError("Unsupported file type. Please upload a PDF or TXT file.");
      setStatus("error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("That file is larger than 8 MB. Please upload a smaller resume.");
      setStatus("error");
      return;
    }
    try {
      setStatus("parsing");
      setError("");
      setFileName(file.name);
      let text: string;
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
        text = await extractPdfText(file);
      } else {
        text = await file.text();
      }
      const cleaned = text.split("\u0000").join("").trim();
      if (cleaned.length < 30) {
        setError("Couldn't read enough text from that file. If it's a scanned PDF, try a text-based PDF or paste the resume text directly.");
        setStatus("error");
        return;
      }
      setResumeText(cleaned);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't parse that file. Try a different PDF, or paste your resume text in the box.");
      setStatus("error");
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const loadDemo = useCallback(() => {
    setResumeText(SAMPLE_RESUME);
    setJobText(SAMPLE_JOB);
    setFileName("sample-resume.txt");
    setResult(null);
    setEditableSummary("");
    setStatus("idle");
    setError("");
  }, []);

  const canAnalyze = resumeText.trim().length >= 30 && jobText.trim().length >= 30 && status !== "parsing" && status !== "analyzing";

  const runAnalysis = useCallback(async () => {
    if (resumeText.trim().length < 30) {
      setError("The resume text looks too short. Add more detail or upload a longer resume.");
      setStatus("error");
      return;
    }
    if (jobText.trim().length < 30) {
      setError("The job description looks too short. Paste the full posting for a meaningful analysis.");
      setStatus("error");
      return;
    }
    try {
      setStatus("analyzing");
      setError("");
      // Small delay so the loading state is perceptible for fast analyses.
      await new Promise((r) => setTimeout(r, 450));
      const res = analyzeResume({ resumeText: resumeText.trim(), jobDescription: jobText.trim() });
      setResult(res);
      setEditableSummary(res.improvedSummary);
      setStatus("done");
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing. Please try again.");
      setStatus("error");
    }
  }, [resumeText, jobText]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const finalResult: AnalysisResult = { ...result, improvedSummary: editableSummary };
    const report = buildReport(finalResult);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`careerlens-analysis-${stamp}.txt`, report);
  }, [result, editableSummary]);

  const wordCount = useMemo(
    () => resumeText.trim().split(/\s+/).filter(Boolean).length,
    [resumeText],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet2-600 text-white shadow-soft">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-lg font-bold text-slate-900">CareerLens AI</h1>
              <p className="text-[11px] font-medium text-slate-500">Resume analyzer</p>
            </div>
          </div>
          <button
            onClick={loadDemo}
            className="btn-soft"
            aria-label="Load sample resume and job description"
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Try Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute -top-10 right-10 h-48 w-48 rounded-full bg-violet2-200/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pt-12 pb-8 text-center sm:px-6 sm:pt-16">
          <span className="pill bg-white text-brand-700 border border-brand-100 shadow-soft">
            <Info className="h-3.5 w-3.5" />
            Keyword heuristic, not a true AI model
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.5rem]">
            See how your resume reads against the job
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Upload your resume and paste a job description. CareerLens scores the keyword overlap,
            highlights what's missing, and suggests a stronger summary — all in your browser, no sign-up needed.
          </p>
        </div>
      </section>

      {/* Input panel */}
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resume input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="resume-input" className="field-label mb-0">
                Your resume
              </label>
              {fileName && (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  <FileText className="h-3 w-3" />
                  {fileName.length > 22 ? fileName.slice(0, 20) + "…" : fileName}
                  <button
                    onClick={() => {
                      setFileName("");
                      setResumeText("");
                    }}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Clear resume text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                isDragging ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/50"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">
                Drop a PDF or TXT, or <span className="text-brand-700 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400">Up to 8 MB · stays in your browser</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={onInputChange}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-100" />
              or paste text
              <span className="h-px flex-1 bg-slate-100" />
            </div>

            <textarea
              id="resume-input"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here…"
              className="input mt-3 min-h-[180px] resize-y font-mono text-[13px] leading-relaxed"
              aria-label="Paste resume text"
            />
            <div className="mt-1.5 flex justify-between text-xs text-slate-400">
              <span>{wordCount} words</span>
              {status === "parsing" && (
                <span className="flex items-center gap-1 text-brand-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Parsing…
                </span>
              )}
            </div>
          </div>

          {/* Job description input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <label htmlFor="job-input" className="field-label">
              Job description
            </label>
            <textarea
              id="job-input"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job posting here…"
              className="input min-h-[260px] resize-y text-[13px] leading-relaxed"
              aria-label="Paste job description"
            />
            <div className="mt-1.5 text-xs text-slate-400">
              {jobText.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard?.readText?.().then((t) => setJobText(t)).catch(() => {})}
                className="btn-ghost"
                aria-label="Paste job description from clipboard"
              >
                <ClipboardPaste className="h-4 w-4" />
                Paste from clipboard
              </button>
              <button
                onClick={() => {
                  setJobText(SAMPLE_JOB);
                }}
                className="btn-ghost"
              >
                <FileText className="h-4 w-4" />
                Use sample job
              </button>
            </div>
          </div>
        </div>

        {/* Analyze bar */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {error && (
            <div className="flex w-full items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!error && (
            <p className="text-sm text-slate-500">
              Everything runs in your browser — no upload to any server.
            </p>
          )}
          <div className="flex w-full gap-2 sm:w-auto">
            {(status === "done" || resumeText || jobText) && (
              <button onClick={reset} className="btn-ghost" aria-label="Reset and start over">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
            <button
              onClick={runAnalysis}
              disabled={!canAnalyze}
              className="btn-primary w-full sm:w-auto"
            >
              {status === "analyzing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <ResultsDashboard
            result={result}
            editableSummary={editableSummary}
            setEditableSummary={setEditableSummary}
            onDownload={handleDownload}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
          CareerLens AI is a keyword-overlap heuristic. It is not a true AI model, not affiliated with any ATS,
          and its score is not a guarantee of interview selection. Always tailor your resume honestly.
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Results dashboard ---------------- */

function ResultsDashboard({
  result,
  editableSummary,
  setEditableSummary,
  onDownload,
}: {
  result: AnalysisResult;
  editableSummary: string;
  setEditableSummary: (v: string) => void;
  onDownload: () => void;
}) {
  return (
    <section id="results" className="mt-8 animate-fade-in space-y-6">
      {/* Score + overview */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <ScoreGauge score={result.score} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Resume words" value={result.resumeWordCount} />
            <Stat label="Job words" value={result.jobWordCount} />
            <Stat label="Matched" value={result.matchedKeywords.length} accent="text-emerald-600" />
            <Stat label="Missing" value={result.missingKeywords.length} accent="text-rose-600" />
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              This score measures how many keywords from the job description appear in your resume — a useful
              starting point, not a verdict. Real hiring decisions weigh experience, impact, and fit far beyond keywords.
            </p>
          </div>
        </div>
      </div>

      {/* Keyword chips */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <KeywordChips matched={result.matchedKeywords} missing={result.missingKeywords} />
      </div>

      {/* Strengths + suggestions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Strengths
          </h3>
          <ul className="space-y-2.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Improvement suggestions
          </h3>
          <ul className="space-y-2.5">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Editable improved summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
            <Wand2 className="h-5 w-5 text-violet2-600" />
            Suggested professional summary
          </h3>
          <span className="text-xs text-slate-400">Editable</span>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          A draft summary based on the job's keywords. Edit it freely, then include it in your downloaded report.
        </p>
        <textarea
          value={editableSummary}
          onChange={(e) => setEditableSummary(e.target.value)}
          className="input min-h-[140px] resize-y text-sm leading-relaxed"
          aria-label="Edit suggested professional summary"
        />
      </div>

      {/* Download */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-violet2-50 p-6 text-center shadow-soft sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Download your analysis</h3>
          <p className="text-sm text-slate-600">Save the full report as a text file, including your edited summary.</p>
        </div>
        <button onClick={onDownload} className="btn-primary">
          <Download className="h-4 w-4" />
          Download report (.txt)
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <div className={`font-display text-2xl font-bold tabular-nums ${accent ?? "text-slate-900"}`}>
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
