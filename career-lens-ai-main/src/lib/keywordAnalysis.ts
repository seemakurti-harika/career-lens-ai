import { ENGLISH_STOPWORDS, type AnalysisResult, type KeywordHit } from "./types";

const STOP_PATTERNS = /^[^a-z0-9+#.]+|[^a-z0-9+#.]+$/g;
const MIN_WORD_LEN = 2;

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const raw = lower.match(/[a-z][a-z0-9+#.-]*[a-z0-9]|[a-z]/g) ?? [];
  return raw
    .map((w) => w.replace(STOP_PATTERNS, ""))
    .filter((w) => w.length >= MIN_WORD_LEN && !ENGLISH_STOPWORDS.has(w) && !/^\d+$/.test(w));
}

export function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return freq;
}

interface KeywordExtractionOptions {
  maxTerms?: number;
  minDocs?: number;
}

function extractJobKeywords(jobText: string, opts: KeywordExtractionOptions = {}): Map<string, number> {
  const maxTerms = opts.maxTerms ?? 60;
  const tokens = tokenize(jobText);
  const freq = termFrequency(tokens);
  const bigrams = extractNgrams(jobText, 2);
  const trigrams = extractNgrams(jobText, 3);

  const scored = new Map<string, number>();

  const docLen = tokens.length || 1;
  for (const [word, count] of freq) {
    const density = count / docLen;
    scored.set(word, density * 1.0);
  }
  for (const [phrase, count] of bigrams) {
    const density = count / docLen;
    scored.set(phrase, density * 1.6);
  }
  for (const [phrase, count] of trigrams) {
    const density = count / docLen;
    scored.set(phrase, density * 2.0);
  }

  // Boost known technical / domain signal words so generic verbs don't dominate.
  for (const term of TECHNICAL_BOOST) {
    if (freq.has(term)) scored.set(term, (scored.get(term) ?? 0) + 0.08);
  }

  const sorted = [...scored.entries()].sort((a, b) => b[1] - a[1]);
  const top = new Map<string, number>();
  for (const [term, score] of sorted) {
    if (top.size >= maxTerms) break;
    // Skip a unigram if it is already part of an accepted bigram/trigram as a subword,
    // to reduce redundancy — but only if the phrase scored higher.
    let dominated = false;
    for (const accepted of top.keys()) {
      if (accepted.includes(" ") && accepted.split(" ").includes(term)) {
        dominated = true;
        break;
      }
    }
    if (dominated) continue;
    top.set(term, score);
  }
  return top;
}

function extractNgrams(text: string, n: number): Map<string, number> {
  const tokens = tokenize(text);
  const grams = new Map<string, number>();
  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    if (slice.some((t) => ENGLISH_STOPWORDS.has(t))) continue;
    const phrase = slice.join(" ");
    grams.set(phrase, (grams.get(phrase) ?? 0) + 1);
  }
  return grams;
}

const TECHNICAL_BOOST = new Set<string>([
  "javascript","typescript","python","java","c++","c#","react","node","node.js","vue","angular",
  "sql","nosql","mongodb","postgres","postgresql","mysql","redis","graphql","rest","api","apis",
  "aws","azure","gcp","docker","kubernetes","ci","cd","git","github","gitlab","jenkins",
  "html","css","sass","tailwind","webpack","vite","next","next.js","nuxt","svelte",
  "machine","learning","ai","ml","data","analytics","tableau","powerbi","excel","etl",
  "agile","scrum","kanban","jira","confluence","product","roadmap","stakeholder","kpi","okr",
  "marketing","seo","sem","content","social","email","campaign","crm","salesforce","hubspot",
  "finance","accounting","audit","tax","payroll","revenue","forecast","budget","p&l","gaap",
  "design","figma","sketch","adobe","photoshop","illustrator","ux","ui","prototype","wireframe",
  "sales","quota","pipeline","lead","leads","prospecting","closing","negotiation","account",
  "hr","recruiting","onboarding","benefits","compliance","safety","training","development",
  "project","program","pmo","risk","procurement","vendor","contract","sla","milestone",
  "healthcare","clinical","patient","hipaa","ehr","emr","nursing","pharmacy","lab","imaging",
  "legal","contract","litigation","compliance","privacy","gdpr","ccpa","trademark","patent",
  "logistics","supply","chain","warehouse","shipping","freight","inventory","fulfillment",
  "customer","success","onboarding","retention","churn","support","helpdesk","ticketing",
  "leadership","mentorship","coaching","strategy","vision","executive","presentation","communication",
  "figma","lottie","framer","testing","jest","cypress","playwright","selenium","unit","e2e",
]);

export interface AnalysisInput {
  resumeText: string;
  jobDescription: string;
}

export function analyzeResume(input: AnalysisInput): AnalysisResult {
  const { resumeText, jobDescription } = input;
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobDescription);

  const resumeFreq = termFrequency(resumeTokens);
  const jobKeywords = extractJobKeywords(jobDescription, { maxTerms: 60 });

  const matchedKeywords: KeywordHit[] = [];
  const missingKeywords: KeywordHit[] = [];

  for (const [term, jobScore] of jobKeywords) {
    const hits = term.includes(" ")
      ? countPhraseOccurrences(resumeText.toLowerCase(), term)
      : resumeFreq.get(term) ?? 0;
    if (hits > 0) {
      matchedKeywords.push({ word: term, count: hits });
    } else {
      missingKeywords.push({ word: term, count: Math.round(jobScore * 1000) / 10 });
    }
  }

  matchedKeywords.sort((a, b) => b.count - a.count);
  missingKeywords.sort((a, b) => b.count - a.count);

  const totalKeywords = jobKeywords.size || 1;
  const matchRatio = matchedKeywords.length / totalKeywords;
  const coverageBonus = Math.min(matchedKeywords.length / 12, 1) * 0.1;
  const raw = matchRatio * 0.9 + coverageBonus;
  const score = Math.max(0, Math.min(100, Math.round(raw * 100)));

  const strengths = deriveStrengths(matchedKeywords, resumeText, resumeTokens.length);
  const suggestions = deriveSuggestions(missingKeywords, resumeTokens.length, jobTokens.length);
  const improvedSummary = generateImprovedSummary(matchedKeywords, missingKeywords, jobDescription);

  return {
    score,
    matchedKeywords,
    missingKeywords,
    strengths,
    suggestions,
    improvedSummary,
    resumeText,
    jobDescription,
    resumeWordCount: resumeTokens.length,
    jobWordCount: jobTokens.length,
    totalKeywords: jobKeywords.size,
  };
}

function countPhraseOccurrences(haystack: string, phrase: string): number {
  let count = 0;
  let idx = haystack.indexOf(phrase);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(phrase, idx + phrase.length);
  }
  return count;
}

function deriveStrengths(matched: KeywordHit[], resumeText: string, wordCount: number): string[] {
  const strengths: string[] = [];
  const top = matched.slice(0, 8).map((m) => m.word);
  if (top.length >= 3) {
    strengths.push(`Strong keyword alignment: ${top.slice(0, 5).join(", ")} appear in both the resume and the job description.`);
  }
  if (wordCount > 350) {
    strengths.push(`Substantive resume content (${wordCount} words) gives the keyword matcher enough signal to find overlaps.`);
  } else if (wordCount > 150) {
    strengths.push("Resume has enough detail for a meaningful keyword comparison.");
  }
  if (/\b(manag|lead|direct|supervis|mentor|coach)/i.test(resumeText)) {
    strengths.push("Leadership signals detected (manage / lead / mentor language).");
  }
  if (/\b(built|develop|creat|design|implement|launch|ship|deliver)/i.test(resumeText)) {
    strengths.push("Concrete delivery verbs present (built, developed, delivered, etc.) — keep these, they read well to both humans and keyword matchers.");
  }
  if (/\b\d+%|\$\s?\d|\d+x|\d+\s?(users|customers|clients|requests|hours|days|weeks|months)/i.test(resumeText)) {
    strengths.push("Quantified achievements detected (numbers, percentages, or scale metrics) — these stand out.");
  }
  if (strengths.length === 0 && top.length > 0) {
    strengths.push(`Matched ${top.length} keywords from the job description.`);
  }
  if (strengths.length === 0) {
    strengths.push("Resume was readable and parsed successfully.");
  }
  return strengths;
}

function deriveSuggestions(missing: KeywordHit[], resumeWordCount: number, jobWordCount: number): string[] {
  const suggestions: string[] = [];
  const topMissing = missing.slice(0, 6).map((m) => m.word);
  if (topMissing.length > 0) {
    suggestions.push(`Consider adding these keywords where you genuinely have the experience: ${topMissing.join(", ")}. Only include skills you actually have — don't keyword-stuff.`);
  }
  if (resumeWordCount < 200) {
    suggestions.push("The resume text is short. Adding more concrete project detail (tools used, scope, outcomes) gives the keyword matcher more to work with.");
  }
  if (jobWordCount < 80) {
    suggestions.push("The job description is short, so the keyword set is limited. Paste the full posting for a more complete analysis.");
  }
  if (missing.length > matchedLengthThreshold(missing.length)) {
    suggestions.push("More than half the job-description keywords are missing. Tailor the resume to this specific role before applying.");
  }
  suggestions.push("Mirror the job posting's exact phrasing for key skills (e.g. 'React' vs 'ReactJS') — the matcher is literal.");
  suggestions.push("Lead each role with a quantified result, then the skill. Example: 'Cut latency 40% by re-architecting the API in Go.'");
  if (suggestions.length === 0) {
    suggestions.push("Tailor the resume to each role and quantify results where possible.");
  }
  return suggestions;
}

function matchedLengthThreshold(missingLen: number): number {
  return Math.max(3, Math.floor(missingLen / 2));
}

function generateImprovedSummary(matched: KeywordHit[], missing: KeywordHit[], jobDescription: string): string {
  const topMatched = matched.slice(0, 5).map((m) => m.word);
  const roleGuess = guessRole(jobDescription);
  const yearsGuess = guessYears(jobDescription);

  const skillPhrase = topMatched.length > 0
    ? ` with proven depth in ${topMatched.join(", ")}`
    : "";

  const yearsPhrase = yearsGuess ? `${yearsGuess}+ years` : "Multi-year";

  const opener = roleGuess
    ? `${roleGuess} professional`
    : "Results-driven professional";

  return `${opener} (${yearsPhrase} of experience)${skillPhrase}, seeking to apply this background to deliver measurable outcomes. Track record of shipping impact through cross-functional collaboration, data-informed decisions, and clear ownership of results. Eager to contribute the skills below and to grow into broader scope.${missing.length > 0 ? ` Targeting growth areas: ${missing.slice(0, 4).map((m) => m.word).join(", ")}.` : ""}`;
}

function guessRole(jobDescription: string): string | null {
  const text = jobDescription.toLowerCase();
  const roleMap: Array<[RegExp, string]> = [
    [/front[- ]?end|react|vue|angular|css/i, "Frontend Engineer"],
    [/back[- ]?end|node|python|java|golang|rust|api/i, "Backend Engineer"],
    [/full[- ]?stack/i, "Full-Stack Engineer"],
    [/data\s?scientist|machine\s?learning|\bml\b|deep\s?learning/i, "Data Scientist"],
    [/data\s?engineer|etl|pipeline|spark|airflow/i, "Data Engineer"],
    [/product\s?manager|roadmap|discovery/i, "Product Manager"],
    [/project\s?manager|pmo|milestone/i, "Project Manager"],
    [/devops|sre|kubernetes|terraform|ci\/cd/i, "DevOps Engineer"],
    [/design|ux|ui|figma/i, "Product Designer"],
    [/marketing|seo|content|campaign/i, "Marketing Manager"],
    [/sales|account executive|quota|pipeline/i, "Sales Professional"],
    [/recruit|talent|hr\b/i, "HR / Recruiting Professional"],
    [/accountant|finance|cpa|audit/i, "Finance Professional"],
    [/nurse|clinical|patient|healthcare/i, "Healthcare Professional"],
  ];
  for (const [re, label] of roleMap) {
    if (re.test(text)) return label;
  }
  return null;
}

function guessYears(jobDescription: string): string | null {
  const m = jobDescription.match(/(\d+)\+?\s*(?:years|yrs)\s*(?:of|experience|exp)?/i);
  if (m) return m[1];
  return null;
}
