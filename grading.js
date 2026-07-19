// Nidaan — deterministic client-side grading engine.
// A real rubric/synonym matcher. No randomness anywhere.

// ---- text normalisation ----
export function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[’']/g, "")            // strip apostrophes so "weil's" -> "weils"
    .replace(/[^a-z0-9\s]/g, " ")    // punctuation -> space
    .replace(/\s+/g, " ")
    .trim();
}

// Split raw text into ordered "lines" of thought (Stage 1 priority ordering).
export function splitLines(text) {
  return (text || "")
    .split(/\n|;|\d+[\).]|•|-\s|,\sthen\s/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

// Basic stem so "clot" matches "clots", "monitoring" matches "monitor".
function stem(word) {
  return word.replace(/(ing|ed|es|s)$/i, "");
}

// "Filler" words that don't carry meaning and shouldn't block a multi-word match.
const STOPWORDS = new Set(["a", "an", "the", "of", "in", "on", "to", "his", "her", "their", "my", "is", "and", "with", "into", "at", "from", "for"]);

// Does the normalised haystack contain any of the concept's synonyms?
// - Single-word synonyms: stem-aware word match (+ substring for distinctive tokens).
// - Multi-word synonyms: match if (a) the exact phrase appears, OR (b) all meaningful
//   tokens of the synonym appear (stem-aware) within a short window of each other,
//   in any order. This makes "lung blood clot", "clot in his lung", "blood clot to the
//   lungs" all match the concept whose synonym is "lung clot" / "clot in the lung".
function conceptMatch(normHaystack, synonyms) {
  const words = normHaystack.split(" ").filter(Boolean);
  const stemmedWords = words.map(stem);
  const stemmedSet = new Set(stemmedWords);
  for (const raw of synonyms) {
    const syn = normalize(raw);
    if (!syn) continue;
    if (syn.includes(" ")) {
      // (a) exact phrase
      if (normHaystack.includes(syn)) return syn;
      // (b) token-set / proximity match (order-independent)
      const synTokens = syn.split(" ").filter((t) => t && !STOPWORDS.has(t)).map(stem);
      if (synTokens.length && synTokens.every((t) => stemmedSet.has(t))) {
        // all meaningful tokens are present somewhere; confirm they cluster within a window
        const positions = synTokens.map((t) => {
          const idxs = [];
          for (let i = 0; i < stemmedWords.length; i++) if (stemmedWords[i] === t) idxs.push(i);
          return idxs;
        });
        if (withinWindow(positions, 6)) return syn;
      }
    } else {
      if (words.includes(syn)) return syn;
      if (stemmedSet.has(stem(syn))) return syn;
      // allow substring for distinctive tokens (>=5 chars) e.g. "hypoglyc"
      if (syn.length >= 5 && normHaystack.includes(syn)) return syn;
    }
  }
  return null;
}

// Given a list of position-arrays (one per token), can we pick one position from each
// such that max-min <= window? Greedy check across the smallest spread.
function withinWindow(positions, window) {
  if (positions.some((p) => p.length === 0)) return false;
  // Try every occurrence of the first token as an anchor; see if the rest have a
  // position within [anchor-window, anchor+window].
  for (const anchor of positions[0]) {
    let ok = true;
    for (let k = 1; k < positions.length; k++) {
      if (!positions[k].some((p) => Math.abs(p - anchor) <= window)) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

// Find the earliest character index at which a concept is mentioned (ordering signal).
function firstMentionIndex(normHaystack, synonyms) {
  let best = Infinity;
  for (const raw of synonyms) {
    const syn = normalize(raw);
    if (!syn) continue;
    const idx = normHaystack.indexOf(syn.includes(" ") ? syn : " " + syn);
    const idx2 = normHaystack.startsWith(syn) ? 0 : idx;
    const at = idx2 >= 0 ? idx2 : normHaystack.indexOf(syn);
    if (at >= 0 && at < best) best = at;
  }
  return best === Infinity ? -1 : best;
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function pct(n) { return Math.round(clamp(n, 0, 1) * 100); }

// ---- individual dimension scorers ----

// 1) Diagnostic accuracy: did they reach the target? Partial credit for close differentials.
function scoreDiagnosis(rubric, stage1Text, stage3Text) {
  const s1 = normalize(stage1Text);
  const s3 = normalize(stage3Text);
  const combined = s1 + " " + s3;
  const target = rubric.differentials.find((d) => d.isTarget);
  const targetInS3 = !!conceptMatch(s3, target.synonyms);
  const targetInS1 = !!conceptMatch(s1, target.synonyms);

  // credit for other correct differentials considered
  const others = rubric.differentials.filter((d) => !d.isTarget);
  const othersHit = others.filter((d) => conceptMatch(combined, d.synonyms));

  let score = 0;
  if (targetInS3) score = 1.0;                 // final working dx correct
  else if (targetInS1) score = 0.7;            // considered it but didn't commit at end
  else score = 0.0;
  // partial credit floor if they at least caught close differentials
  if (!targetInS3 && !targetInS1 && othersHit.length) {
    score = clamp(0.2 + 0.1 * othersHit.length, 0, 0.45);
  }
  return {
    score: pct(score),
    targetLabel: target.label,
    targetReachedFinal: targetInS3,
    targetConsideredEarly: targetInS1,
    othersConsidered: othersHit.map((d) => d.label),
  };
}

// 2) Reasoning path: were the must-not-miss (killer) dxs considered EARLY (stage 1),
//    and were dangerous ones placed near the front?
function scoreReasoningPath(rubric, stage1Text) {
  const s1 = normalize(stage1Text);
  const killers = rubric.differentials.filter((d) => d.mustNotMiss);
  const caught = [];
  const missed = [];
  for (const k of killers) {
    const hit = conceptMatch(s1, k.synonyms);
    if (hit) {
      caught.push({ label: k.label, at: firstMentionIndex(s1, k.synonyms), understoodAs: hit });
    } else {
      missed.push(k.label);
    }
  }
  const coverage = killers.length ? caught.length / killers.length : 0;

  // ordering bonus: reward if the target/killers appear early in the list
  caught.sort((a, b) => a.at - b.at);
  const target = rubric.differentials.find((d) => d.isTarget);
  const targetPos = caught.findIndex((c) => c.label === target.label);
  let orderingBonus = 0;
  if (targetPos === 0) orderingBonus = 0.15;
  else if (targetPos === 1) orderingBonus = 0.08;

  const score = clamp(coverage * 0.85 + orderingBonus, 0, 1);
  return {
    score: pct(score),
    caught: caught.map((c) => ({ label: c.label, understoodAs: c.understoodAs })),
    missed,
    totalKillers: killers.length,
  };
}

// 3) Investigation choice: relevant vs scattergun.
function scoreInvestigations(rubric, stage2Text) {
  const s2 = normalize(stage2Text);
  const invs = rubric.investigations;
  const chosen = invs.filter((i) => conceptMatch(s2, i.synonyms));
  const coverage = invs.length ? chosen.length / invs.length : 0;

  // "first test" reward (e.g. capillary glucose before imaging)
  const firstTest = invs.find((i) => i.firstTest);
  let firstTestBonus = 0;
  let firstTestNote = null;
  if (firstTest) {
    const firstIdx = firstMentionIndex(s2, firstTest.synonyms);
    const imaging = invs.find((i) => /ct|imaging/.test(i.id));
    const imgIdx = imaging ? firstMentionIndex(s2, imaging.synonyms) : -1;
    if (firstIdx >= 0 && (imgIdx < 0 || firstIdx < imgIdx)) {
      firstTestBonus = 0.2;
      firstTestNote = firstTest.label + " requested first — correct.";
    } else if (firstIdx >= 0) {
      firstTestNote = firstTest.label + " requested, but not before imaging.";
    } else {
      firstTestNote = "Did not request " + firstTest.label + ".";
    }
  }

  // gentle scattergun penalty: reward focus. Cap coverage contribution.
  const score = clamp(Math.min(coverage, 0.8) * 1.0 + firstTestBonus, 0, 1);
  return {
    score: pct(score),
    chosen: chosen.map((c) => c.label),
    missed: invs.filter((i) => !chosen.includes(i)).map((i) => i.label),
    firstTestNote,
  };
}

// 4) Management safety: key/critical steps present or absent.
function scoreManagement(rubric, stage4Text) {
  const s4 = normalize(stage4Text);
  const steps = rubric.management;
  const present = steps.filter((m) => conceptMatch(s4, m.synonyms));
  const critical = steps.filter((m) => m.critical);
  const criticalPresent = critical.filter((m) => conceptMatch(s4, m.synonyms));
  const criticalCoverage = critical.length ? criticalPresent.length / critical.length : 1;
  const overallCoverage = steps.length ? present.length / steps.length : 0;

  // critical steps weighted heavily
  const score = clamp(criticalCoverage * 0.75 + overallCoverage * 0.25, 0, 1);
  return {
    score: pct(score),
    present: present.map((m) => m.label),
    missedCritical: critical.filter((m) => !criticalPresent.includes(m)).map((m) => m.label),
    missedOther: steps.filter((m) => !m.critical && !present.includes(m)).map((m) => m.label),
  };
}

// 5) Clarity of explanation (Stage 5): sentence length, causal connectors, jargon density.
const CAUSAL = ["because", "so that", " so ", "therefore", "which means", "as a result", "leads to", "led to", "due to", "causes", "caused", "hence", "results in", "that is why", "explains why"];
function scoreClarity(rubric, stage5Text) {
  const raw = (stage5Text || "").trim();
  const words = raw.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = raw.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const avgSentenceLen = sentences.length ? wordCount / sentences.length : wordCount;
  const norm = normalize(raw);

  // causal connectors present?
  const causalHits = CAUSAL.filter((c) => norm.includes(normalize(c).trim())).length;

  // jargon density: fraction of rubric jargon terms used
  const jargonUsed = (rubric.jargonTerms || []).filter((j) => norm.includes(normalize(j))).length;
  const jargonDensity = wordCount ? jargonUsed / Math.max(wordCount / 25, 1) : 0; // per ~25 words

  // scoring
  let s = 0;
  if (wordCount < 12) {
    s = 0.15; // too short to explain anything
  } else {
    // sentence length sweet spot ~ 8-20 words
    const lenScore = avgSentenceLen <= 22 && avgSentenceLen >= 6 ? 1
      : avgSentenceLen < 6 ? 0.6
      : clamp(1 - (avgSentenceLen - 22) / 20, 0.3, 1);
    const causalScore = clamp(causalHits / 2, 0, 1); // 2+ connectors = full
    const jargonScore = clamp(1 - jargonDensity * 0.6, 0.4, 1); // heavy jargon reduces clarity
    s = lenScore * 0.4 + causalScore * 0.35 + jargonScore * 0.25;
  }
  return {
    score: pct(s),
    wordCount,
    sentences: sentences.length,
    avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
    causalConnectors: causalHits,
    jargonTermsUsed: jargonUsed,
  };
}

// ---- prose feedback in the voice of a senior professor (deterministic, rule-based) ----
function buildFeedback(caseData, dims) {
  const lines = [];
  const target = caseData.target;
  const d = dims;

  // Opening — accuracy
  if (d.diagnosis.targetReachedFinal && d.reasoning.missed.length === 0) {
    lines.push(`Good. You landed on ${target.toLowerCase()} and, more importantly, you had the dangerous alternatives on the table from the start. That is exactly the habit to keep.`);
  } else if (d.diagnosis.targetReachedFinal) {
    lines.push(`You reached the right answer — ${target.toLowerCase()} — which matters. But look again at what you left off your first list; getting there by luck is not the same as getting there safely.`);
  } else if (d.diagnosis.targetConsideredEarly) {
    lines.push(`You considered ${target.toLowerCase()} early and then talked yourself out of it. Trust the pattern. When the story and the numbers point one way, commit.`);
  } else {
    lines.push(`This one got away from you. The working diagnosis was ${target.toLowerCase()}, and it was in the history if you read it slowly. Do not be discouraged — read on for where the thread was dropped.`);
  }

  // Reasoning path — killers
  if (d.reasoning.missed.length) {
    lines.push(`You did not raise ${d.reasoning.missed.join(", ").toLowerCase()} at the first stage. Those are the ones that kill quietly; name them out loud even when you think they are unlikely, then rule them out on purpose.`);
  } else {
    lines.push(`Your first-stage list covered every must-not-miss diagnosis. Ruling out the killers before you get comfortable is the whole game.`);
  }

  // Investigations
  if (d.investigations.firstTestNote && /before|first/i.test(d.investigations.firstTestNote) && d.investigations.score >= 60) {
    lines.push(`Your workup was focused, and ${d.investigations.firstTestNote.charAt(0).toLowerCase() + d.investigations.firstTestNote.slice(1)}`);
  } else if (d.investigations.score < 45) {
    lines.push(`The investigations were thin or scattered. Ask for tests that will change what you do next, not a panel to feel safe.`);
  } else {
    lines.push(`A reasonable set of investigations, though a few obvious ones were missing — see the list below.`);
  }

  // Management
  if (d.management.missedCritical.length) {
    lines.push(`On management, you left out something that cannot be left out: ${d.management.missedCritical.join(", ").toLowerCase()}. A tidy diagnosis with unsafe management still harms the patient.`);
  } else {
    lines.push(`Your immediate management covered the critical steps. That is what the patient in front of you actually needs.`);
  }

  // Clarity
  if (d.clarity.score >= 70) {
    lines.push(`Finally, your explanation was plain and followed cause to effect — an intern could have understood it. Keep writing like that.`);
  } else if (d.clarity.wordCount < 12) {
    lines.push(`Your explanation for the round was too brief to teach anyone. Say what happened and why, in ordinary words — that is how you find out whether you truly understand it.`);
  } else {
    lines.push(`Your explanation leaned on jargon or ran long. Say it as you would to a nervous intern at 3 AM: short sentences, cause then effect, no showing off.`);
  }

  return lines;
}

// ---- overall orchestrator ----
export function gradeAttempt(caseData, answers) {
  const rubric = caseData.rubric;
  const diagnosis = scoreDiagnosis(rubric, answers.stage1, answers.stage3);
  const reasoning = scoreReasoningPath(rubric, answers.stage1);
  const investigations = scoreInvestigations(rubric, answers.stage2);
  const management = scoreManagement(rubric, answers.stage4);
  const clarity = scoreClarity(rubric, answers.stage5);

  const dims = { diagnosis, reasoning, investigations, management, clarity };

  const overall = Math.round(
    diagnosis.score * 0.3 +
    reasoning.score * 0.25 +
    investigations.score * 0.15 +
    management.score * 0.2 +
    clarity.score * 0.1
  );

  // concrete knowledge gaps
  const gaps = [];
  if (reasoning.missed.length) {
    gaps.push(`At the first stage you did not raise: ${reasoning.missed.join(", ")}.`);
  }
  if (investigations.missed.length) {
    gaps.push(`Investigations not requested: ${investigations.missed.slice(0, 5).join(", ")}.`);
  }
  if (management.missedCritical.length) {
    gaps.push(`Critical management step missing: ${management.missedCritical.join(", ")}.`);
  }
  if (!diagnosis.targetReachedFinal) {
    gaps.push(`Your final working diagnosis did not clearly state ${diagnosis.targetLabel}.`);
  }
  if (investigations.firstTestNote && !/correct/.test(investigations.firstTestNote)) {
    gaps.push(investigations.firstTestNote);
  }

  const feedback = buildFeedback(caseData, dims);

  return {
    overall,
    dimensions: [
      { key: "Diagnostic accuracy", ...diagnosis },
      { key: "Reasoning path", ...reasoning },
      { key: "Investigation choice", ...investigations },
      { key: "Management safety", ...management },
      { key: "Clarity of explanation", ...clarity },
    ],
    raw: dims,
    gaps,
    feedback,
    gradedAt: new Date().toISOString(),
  };
}
