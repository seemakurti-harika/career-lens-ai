import type { AnalysisResult } from "./types";

export function buildReport(result: AnalysisResult): string {
  const lines: string[] = [];
  const divider = "=".repeat(60);
  const sub = "-".repeat(60);

  lines.push(divider);
  lines.push("CareerLens AI — Resume Analysis Report");
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(divider);
  lines.push("");

  lines.push("SCORE");
  lines.push(sub);
  lines.push(`Keyword-match score: ${result.score} / 100`);
  lines.push("Note: This is a transparent keyword-overlap heuristic, NOT a true AI model");
  lines.push("and NOT a guaranteed ATS (Applicant Tracking System) score.");
  lines.push("");

  lines.push("OVERVIEW");
  lines.push(sub);
  lines.push(`Resume words analyzed:   ${result.resumeWordCount}`);
  lines.push(`Job description words:   ${result.jobWordCount}`);
  lines.push(`Job keywords extracted:   ${result.totalKeywords}`);
  lines.push(`Keywords matched:         ${result.matchedKeywords.length}`);
  lines.push(`Keywords missing:         ${result.missingKeywords.length}`);
  lines.push("");

  lines.push("MATCHED KEYWORDS");
  lines.push(sub);
  if (result.matchedKeywords.length === 0) {
    lines.push("(none)");
  } else {
    result.matchedKeywords.forEach((k) => lines.push(`  - ${k.word}  (x${k.count})`));
  }
  lines.push("");

  lines.push("MISSING KEYWORDS");
  lines.push(sub);
  if (result.missingKeywords.length === 0) {
    lines.push("(none — strong alignment!)");
  } else {
    result.missingKeywords.forEach((k) => lines.push(`  - ${k.word}`));
  }
  lines.push("");

  lines.push("STRENGTHS");
  lines.push(sub);
  result.strengths.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");

  lines.push("IMPROVEMENT SUGGESTIONS");
  lines.push(sub);
  result.suggestions.forEach((s) => lines.push(`  - ${s}`));
  lines.push("");

  lines.push("SUGGESTED PROFESSIONAL SUMMARY (editable)");
  lines.push(sub);
  lines.push(result.improvedSummary);
  lines.push("");

  lines.push("RESUME TEXT (as parsed)");
  lines.push(sub);
  lines.push(result.resumeText);
  lines.push("");

  lines.push("JOB DESCRIPTION (as provided)");
  lines.push(sub);
  lines.push(result.jobDescription);
  lines.push("");

  lines.push(divider);
  lines.push("End of report");
  lines.push(divider);

  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
