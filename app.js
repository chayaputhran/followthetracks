import React, { useState, useEffect, useCallback, useMemo, useRef } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import { CASES } from "./data.js";
import { gradeAttempt } from "./grading.js";
const h = React.createElement;
const memStore = {};
function persistentStore() {
  try {
    const s = window[["local", "Storage"].join("")];
    const probe = "__nidaan_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch (e) {
    return null;
  }
}
const backing = persistentStore();
const store = {
  get(k) {
    try {
      if (backing) {
        const v = backing.getItem(k);
        return v ? JSON.parse(v) : memStore[k] ?? null;
      }
    } catch (e) {
    }
    return memStore[k] ?? null;
  },
  set(k, v) {
    memStore[k] = v;
    try {
      if (backing) backing.setItem(k, JSON.stringify(v));
    } catch (e) {
    }
  }
};
const ATTEMPTS_KEY = "nidaan.attempts.v1";
function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const on = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const nav = useCallback((to) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, []);
  return [route, nav];
}
function Logo({ className }) {
  return h(
    "svg",
    { className, viewBox: "0 0 40 40", fill: "none", "aria-label": "Follow The Tracks" },
    h("circle", { cx: 17, cy: 17, r: 11, stroke: "currentColor", strokeWidth: 2.4 }),
    h("path", { d: "M25 25 L34 34", stroke: "currentColor", strokeWidth: 2.8, strokeLinecap: "round" }),
    h("path", { d: "M10.5 17 h3.2 l2.1 -5 l3 10 l2.2 -5 h2.6", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" })
  );
}
function IconLock(p) {
  return h(
    "svg",
    { ...p, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    h("rect", { x: 4, y: 11, width: 16, height: 9, rx: 2 }),
    h("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" })
  );
}
function IconCheck(p) {
  return h(
    "svg",
    { ...p, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M20 6 9 17l-5-5" })
  );
}
function IconX(p) {
  return h(
    "svg",
    { ...p, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round" },
    h("path", { d: "M18 6 6 18M6 6l12 12" })
  );
}
function IconArrow(p) {
  return h(
    "svg",
    { ...p, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M5 12h14M13 6l6 6-6 6" })
  );
}
const USER = { name: "Dr. Priya Raghavan", sub: "JIPMER \xB7 2nd yr MD Medicine", initials: "PR" };
function App() {
  const [route, nav] = useHashRoute();
  const [signedIn, setSignedIn] = useState(false);
  const [showSignin, setShowSignin] = useState(false);
  const [attempts, setAttempts] = useState(() => store.get(ATTEMPTS_KEY) || {});
  const saveAttempt = useCallback((caseId, record) => {
    setAttempts((prev) => {
      const next = { ...prev, [caseId]: record };
      store.set(ATTEMPTS_KEY, next);
      return next;
    });
  }, []);
  const enterApp = () => {
    setSignedIn(true);
    setShowSignin(false);
    nav("/cases");
  };
  const isAppRoute = route.startsWith("/cases") || route.startsWith("/case/") || route.startsWith("/report/");
  useEffect(() => {
    if (isAppRoute && !signedIn) setSignedIn(true);
  }, [isAppRoute, signedIn]);
  let view;
  if (route === "/" || route === "") {
    view = h(Landing, { nav, onSignin: () => setShowSignin(true), onTry: enterApp });
  } else if (route === "/cases") {
    view = h(CaseLibrary, { nav, attempts });
  } else if (route.startsWith("/case/")) {
    const id = route.split("/case/")[1];
    view = h(CaseAttempt, { caseId: id, nav, saveAttempt });
  } else if (route.startsWith("/report/")) {
    const id = route.split("/report/")[1];
    view = h(Report, { caseId: id, attempts, nav });
  } else {
    view = h(Landing, { nav, onSignin: () => setShowSignin(true), onTry: enterApp });
  }
  return h(
    React.Fragment,
    null,
    isAppRoute ? h(AppHeader, { nav }) : h(TopBar, { nav, onSignin: () => setShowSignin(true) }),
    h("main", { key: route, className: "fade-in" }, view),
    showSignin && h(SigninModal, { onClose: () => setShowSignin(false), onSubmit: enterApp })
  );
}
function TopBar({ nav, onSignin }) {
  return h(
    "header",
    { className: "topbar" },
    h(
      "div",
      { className: "wrap topbar-inner" },
      h(
        "a",
        { className: "brand", href: "#/", onClick: (e) => {
          e.preventDefault();
          nav("/");
        } },
        h(Logo, { className: "brand-mark" }),
        h("span", { className: "brand-name" }, "Follow The Tracks")
      ),
      h(
        "nav",
        { className: "nav-links" },
        h("button", { className: "nav-link", onClick: () => scrollToId("how") }, "How it works"),
        h("button", { className: "nav-link", onClick: () => scrollToId("scoring") }, "What it measures"),
        h("button", { className: "nav-link", onClick: () => scrollToId("pricing") }, "For institutions"),
        h("button", { className: "btn btn-ghost", onClick: onSignin }, "Sign in")
      )
    )
  );
}
function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}
function AppHeader({ nav }) {
  return h(
    "header",
    { className: "app-header" },
    h(
      "div",
      { className: "wrap app-header-inner" },
      h(
        "a",
        { className: "brand", href: "#/cases", onClick: (e) => {
          e.preventDefault();
          nav("/cases");
        } },
        h(Logo, { className: "brand-mark" }),
        h("span", { className: "brand-name" }, "Follow The Tracks")
      ),
      h(
        "div",
        { className: "user-badge" },
        h(
          "div",
          { className: "user-meta", style: { textAlign: "right" } },
          h("div", { className: "nm" }, USER.name),
          h("div", { className: "sub" }, USER.sub)
        ),
        h("div", { className: "avatar" }, USER.initials)
      )
    )
  );
}
function Landing({ nav, onSignin, onTry }) {
  return h(
    React.Fragment,
    null,
    // hero
    h(
      "section",
      { className: "wrap hero" },
      h(
        "div",
        { className: "hero-grid" },
        h(
          "div",
          null,
          h("span", { className: "eyebrow" }, "Clinical reasoning, examined"),
          h("h1", null, "Recall, not ", h("em", null, "recognition"), "."),
          h(
            "p",
            { className: "hero-sub" },
            "Follow The Tracks retires the multiple-choice crutch. Students work real cases in their own words \u2014 differentials, workup, management \u2014 and are graded on how they reason, not what they can pick from a list."
          ),
          h(
            "div",
            { className: "hero-actions" },
            h("button", { className: "btn btn-primary btn-lg", onClick: onTry }, "Try a case", h(IconArrow, { width: 18, height: 18 })),
            h("button", { className: "btn btn-plain", onClick: () => scrollToId("how") }, "See how it works")
          ),
          h("p", { className: "hero-note" }, "Built for MBBS, PG and residency teaching. No installation \u2014 runs in the browser.")
        ),
        h("div", null, h(HeroSpecimen))
      )
    ),
    // how it works
    h(
      "section",
      { id: "how", className: "section section-alt" },
      h(
        "div",
        { className: "wrap" },
        h(
          "div",
          { className: "section-head" },
          h("span", { className: "eyebrow" }, "The method"),
          h("h2", null, "A case, worked the way a clinician actually works."),
          h("p", null, "Each stage is committed before the next is revealed \u2014 because in a real ward, you decide what to worry about before the reports come back.")
        ),
        h(
          "div",
          { className: "steps" },
          h(Step, { n: "01", t: "Read the case", d: "History and vitals only. No labs yet \u2014 just the patient in front of you." }),
          h(Step, { n: "02", t: "Commit your thinking", d: "Type your differentials in order of priority, then your focused workup. Locked once submitted." }),
          h(Step, { n: "03", t: "Face the results", d: "Labs, ECG and imaging reveal. Revise your diagnosis and set the management plan." }),
          h(Step, { n: "04", t: "Explain it plainly", d: "Teach the case to an intern in ordinary words. Then get a graded, honest report." })
        )
      )
    ),
    // what it measures
    h(
      "section",
      { id: "scoring", className: "section" },
      h(
        "div",
        { className: "wrap" },
        h(
          "div",
          { className: "section-head" },
          h("span", { className: "eyebrow" }, "The report"),
          h("h2", null, "Five dimensions, semantically graded."),
          h("p", null, "A deterministic engine reads free text the way an examiner would \u2014 matching meaning, not spelling. Every student sees exactly how their words were understood.")
        ),
        h(
          "div",
          { className: "dim-grid" },
          h(DimCard, { k: "01", t: "Diagnostic accuracy", d: "Did the working diagnosis land? Partial credit for close, defensible differentials." }),
          h(DimCard, { k: "02", t: "Reasoning path", d: "Were the must-not-miss diagnoses raised early \u2014 before the safe, common answers?" }),
          h(DimCard, { k: "03", t: "Investigation choice", d: "Focused and purposeful, or a scattergun of every test on the form?" }),
          h(DimCard, { k: "04", t: "Management safety", d: "Are the steps that keep the patient alive actually present?" }),
          h(DimCard, { k: "05", t: "Clarity of explanation", d: "Can the reasoning be taught in plain language, cause before effect?" }),
          h(DimCard, { k: "06", t: "Concrete gaps", d: "Named omissions \u2014 the travel history you skipped, the killer you never ruled out." })
        )
      )
    ),
    // pricing
    h(
      "section",
      { id: "pricing", className: "section section-alt" },
      h(
        "div",
        { className: "wrap" },
        h(
          "div",
          { className: "section-head" },
          h("span", { className: "eyebrow" }, "For institutions"),
          h("h2", null, "Priced per student, per year."),
          h("p", null, "One subscription covers the case bank, unlimited attempts, and a departmental analytics view for HODs \u2014 cohort accuracy, common reasoning errors, and progress over the year.")
        ),
        h(
          "div",
          { className: "price-grid" },
          h(PriceCard, {
            name: "Department",
            amt: "\u20B9900",
            unit: "/ student / year",
            desc: "For a single department piloting the platform.",
            feature: false,
            items: ["Full 3-case starter bank", "Unlimited attempts & reports", "Per-student progress", "Email support"],
            cta: "Start a pilot",
            onCta: onTry
          }),
          h(PriceCard, {
            name: "College",
            amt: "\u20B9650",
            unit: "/ student / year",
            desc: "The usual choice \u2014 whole college, all clinical years.",
            feature: true,
            items: ["Everything in Department", "Growing specialty case bank", "Department analytics for HODs", "Cohort benchmarking", "Custom cases on request"],
            cta: "Talk to us",
            onCta: onSignin
          }),
          h(PriceCard, {
            name: "University",
            amt: "Custom",
            unit: "multi-college",
            desc: "For universities and health-science networks.",
            feature: false,
            items: ["Everything in College", "Multi-college dashboards", "SSO & roster integration", "Dedicated academic liaison"],
            cta: "Request a quote",
            onCta: onSignin
          })
        )
      )
    ),
    // footer
    h(
      "footer",
      { className: "footer" },
      h(
        "div",
        { className: "wrap footer-inner" },
        h("div", { className: "brand" }, h(Logo, { className: "brand-mark" }), h("span", { className: "brand-name" }, "Follow The Tracks")),
        h("p", null, "Read the case, follow the tracks. A clinical reasoning simulator for Indian medical colleges."),
        h("p", null, "\xA9 2026 Follow The Tracks. A demonstration build.")
      )
    )
  );
}
function Step({ n, t, d }) {
  return h(
    "div",
    { className: "step" },
    h("div", { className: "step-num" }, n),
    h("h3", null, t),
    h("p", null, d)
  );
}
function DimCard({ k, t, d }) {
  return h(
    "div",
    { className: "dim-card" },
    h("div", { className: "kicker" }, k),
    h("h3", null, t),
    h("p", null, d)
  );
}
function PriceCard({ name, amt, unit, desc, items, feature, cta, onCta }) {
  return h(
    "div",
    { className: "price-card" + (feature ? " feature" : "") },
    h("div", { className: "price-name" }, name),
    h("div", { className: "price-amt" }, amt, " ", h("small", null, unit)),
    h("p", { className: "price-desc" }, desc),
    h("ul", { className: "price-list" }, items.map((it, i) => h("li", { key: i }, it))),
    h("button", { className: "btn " + (feature ? "btn-primary" : "btn-ghost"), onClick: onCta }, cta)
  );
}
function HeroSpecimen() {
  return h(
    "div",
    { className: "specimen" },
    h(
      "div",
      { className: "specimen-head" },
      h("span", { className: "lbl" }, "Sample \xB7 Reasoning report"),
      h("span", { className: "lbl" }, "Case 1")
    ),
    h(
      "div",
      { className: "specimen-body" },
      h("div", { className: "specimen-q" }, "\u201CClot in the lung after the leg cast.\u201D"),
      h("div", { className: "specimen-a" }, "We read this as Pulmonary embolism, considered first \u2014 with ACS, pneumothorax and dissection ruled out before the reports."),
      h(
        "div",
        { className: "chip-row" },
        h("span", { className: "chip ok" }, "PE \u2713"),
        h("span", { className: "chip ok" }, "ACS \u2713"),
        h("span", { className: "chip ok" }, "Pneumothorax \u2713"),
        h("span", { className: "chip miss" }, "Dissection missed")
      )
    )
  );
}
function SigninModal({ onClose, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return h(
    "div",
    { className: "modal-overlay", onClick: onClose },
    h(
      "div",
      { className: "modal fade-in", onClick: (e) => e.stopPropagation() },
      h("h2", null, "Welcome back"),
      h("p", null, "Institutional access. This demonstration signs you in as a sample student account."),
      h(
        "form",
        { onSubmit: (e) => {
          e.preventDefault();
          onSubmit();
        } },
        h(
          "div",
          { className: "field" },
          h("label", null, "College email"),
          h("input", { ref, type: "email", placeholder: "priya.r@jipmer.edu.in", defaultValue: "priya.r@jipmer.edu.in" })
        ),
        h(
          "div",
          { className: "field" },
          h("label", null, "Password"),
          h("input", { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", defaultValue: "demo1234" })
        ),
        h("button", { className: "btn btn-primary", type: "submit", style: { width: "100%" } }, "Sign in"),
        h("p", { className: "hint" }, "Enters as Dr. Priya Raghavan, JIPMER.")
      )
    )
  );
}
function CaseLibrary({ nav, attempts }) {
  const any = Object.keys(attempts).length > 0;
  return h(
    "div",
    { className: "wrap section" },
    h(
      "div",
      { className: "page-title-row" },
      h(
        "div",
        null,
        h("h1", { className: "page-title" }, "Case library"),
        h("p", { className: "page-lede" }, "Three cases to begin. Pick one and work it end to end \u2014 you cannot go back and edit an earlier stage, so weigh each answer before you commit.")
      )
    ),
    !any && h(
      "div",
      { className: "empty", style: { marginBottom: "2rem" } },
      h("p", null, "No attempts yet. Pick a case \u2014 the first differential is always the hardest.")
    ),
    h(
      "div",
      { className: "case-grid" },
      CASES.map((c) => h(CaseCard, { key: c.id, c, attempt: attempts[c.id], nav }))
    )
  );
}
function CaseCard({ c, attempt, nav }) {
  return h(
    "div",
    { className: "case-card" },
    h(
      "div",
      { className: "case-card-top" },
      h(
        "div",
        { className: "case-meta-row" },
        h("span", { className: "tag" }, c.specialty),
        h("span", { className: "dot" }),
        h("span", { className: "badge-diff" }, c.difficulty)
      ),
      h("h3", null, c.title),
      h("p", { className: "desc" }, c.oneLiner)
    ),
    h(
      "div",
      { className: "case-card-foot" },
      h(
        "div",
        { className: "case-stats" },
        h("span", null, "~" + c.minutes + " min"),
        attempt ? h("span", { className: "badge-attempted" }, h(IconCheck, { width: 13, height: 13 }), "Scored " + attempt.result.overall) : h("span", null, "Not attempted")
      ),
      attempt ? h("button", { className: "btn btn-ghost", onClick: () => nav("/report/" + c.id), style: { padding: "0.5em 1em" } }, "View report") : h("button", { className: "btn btn-primary", onClick: () => nav("/case/" + c.id), style: { padding: "0.5em 1em" } }, "Begin", h(IconArrow, { width: 15, height: 15 }))
    )
  );
}
const STAGE_LABELS = ["Vignette", "Workup", "Results", "Management", "Explain"];
function CaseAttempt({ caseId, nav, saveAttempt }) {
  const caseData = useMemo(() => CASES.find((c) => c.id === caseId), [caseId]);
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState({ stage1: "", stage2: "", stage3: "", stage4: "", stage5: "" });
  const [draft, setDraft] = useState("");
  const taRef = useRef(null);
  useEffect(() => {
    taRef.current?.focus();
  }, [stage]);
  if (!caseData) {
    return h(
      "div",
      { className: "wrap section" },
      h("p", null, "Case not found."),
      h("button", { className: "btn btn-ghost", onClick: () => nav("/cases") }, "Back to library")
    );
  }
  const stageKey = "stage" + (stage + 1);
  const prompts = [caseData.stage1Prompt, caseData.stage2Prompt, caseData.stage3Prompt, caseData.stage4Prompt, caseData.stage5Prompt];
  const submitStage = () => {
    const updated = { ...answers, [stageKey]: draft.trim() };
    setAnswers(updated);
    setDraft("");
    if (stage < 4) {
      setStage(stage + 1);
    } else {
      const result = gradeAttempt(caseData, updated);
      saveAttempt(caseData.id, { answers: updated, result });
      nav("/report/" + caseData.id);
    }
  };
  const wc = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const canSubmit = wc >= 3;
  return h(
    "div",
    { className: "wrap section" },
    h(
      "div",
      { className: "attempt-layout" },
      // rail
      h(
        "aside",
        { className: "progress-rail" },
        h("div", { className: "rail-case" }, caseData.specialty),
        h("div", { className: "rail-title" }, caseData.title),
        h(
          "ol",
          { className: "stage-list" },
          STAGE_LABELS.map((lbl, i) => {
            const cls = i < stage ? "done" : i === stage ? "current" : "locked";
            return h(
              "li",
              { key: i, className: "stage-item " + cls },
              h(
                "span",
                { className: "stage-marker" },
                i < stage ? h(IconCheck, { width: 13, height: 13 }) : i + 1
              ),
              h(
                "span",
                { className: "stage-label" },
                lbl,
                cls === "locked" && h(IconLock, { className: "lock-ic" })
              )
            );
          })
        )
      ),
      // panel
      h(
        "section",
        { className: "stage-panel", key: stage },
        h(
          "div",
          { className: "stage-panel-head" },
          h("div", { className: "stage-kicker" }, "Stage " + (stage + 1) + " of 5 \xB7 " + STAGE_LABELS[stage]),
          h("h2", null, stageTitle(stage))
        ),
        h(
          "div",
          { className: "stage-panel-body fade-in" },
          // content by stage
          stage === 0 && h(VignetteView, { v: caseData.vignette }),
          stage === 2 && h(ResultsView, { caseData, answers }),
          (stage === 1 || stage === 3 || stage === 4) && h(PriorRecap, { stage, answers, caseData }),
          // prompt + textarea
          h(
            "div",
            { className: "prompt-box" },
            h("p", { className: "prompt-q" }, prompts[stage]),
            h("textarea", {
              ref: taRef,
              className: "answer",
              value: draft,
              onChange: (e) => setDraft(e.target.value),
              placeholder: placeholderFor(stage)
            }),
            h(
              "div",
              { className: "answer-meta" },
              h("span", { className: "word-count" }, wc + " words"),
              h(
                "span",
                { className: "commit-note" },
                h(IconLock, { width: 12, height: 12 }),
                stage < 4 ? "Once submitted, this stage locks." : "Submitting grades your attempt."
              )
            ),
            h(
              "div",
              { style: { marginTop: "1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" } },
              h(
                "button",
                { className: "btn btn-primary btn-lg", onClick: submitStage, disabled: !canSubmit },
                stage < 4 ? "Commit & continue" : "Submit for grading",
                h(IconArrow, { width: 17, height: 17 })
              )
            )
          )
        )
      )
    )
  );
}
function stageTitle(stage) {
  return ["The patient", "Your workup", "The results", "Management", "Teach it back"][stage];
}
function placeholderFor(stage) {
  return [
    "1. Pulmonary embolism \u2014 recent immobilisation, pleuritic pain, hypoxia...\n2. ...",
    "e.g. ECG (rhythm, strain), D-dimer (rule out), chest X-ray (pneumothorax)...",
    "State your working diagnosis and connect it to the findings...",
    "Oxygen, anticoagulation, monitoring, analgesia...",
    "In plain words: what happened to this patient, and why?"
  ][stage];
}
function VignetteView({ v }) {
  return h(
    "div",
    { className: "vignette" },
    h("h4", null, "History"),
    h("p", null, v.history),
    h("h4", null, "Vitals on arrival"),
    h(
      "div",
      { className: "vitals-grid" },
      v.vitals.map((vt, i) => h(
        "div",
        { className: "vital", key: i },
        h("div", { className: "v-lbl" }, vt.label),
        h("div", { className: "v-val" }, vt.value)
      ))
    ),
    h("h4", null, "Examination"),
    h("p", null, v.exam)
  );
}
function PriorRecap({ stage, answers, caseData }) {
  if (stage === 1) {
    return h(
      "div",
      { className: "locked-recap" },
      h("div", { className: "lr-head" }, h(IconLock, { width: 12, height: 12 }), "Your differentials (committed)"),
      h("p", null, answers.stage1 || "\u2014")
    );
  }
  if (stage === 3) {
    return h(
      "div",
      { className: "locked-recap" },
      h("div", { className: "lr-head" }, h(IconLock, { width: 12, height: 12 }), "Your working diagnosis (committed)"),
      h("p", null, answers.stage3 || "\u2014")
    );
  }
  if (stage === 4) {
    return h(
      React.Fragment,
      null,
      h(
        "div",
        { className: "locked-recap" },
        h("div", { className: "lr-head" }, h(IconLock, { width: 12, height: 12 }), "Working diagnosis"),
        h("p", null, answers.stage3 || "\u2014")
      ),
      h(
        "div",
        { className: "locked-recap" },
        h("div", { className: "lr-head" }, h(IconLock, { width: 12, height: 12 }), "Management plan"),
        h("p", null, answers.stage4 || "\u2014")
      )
    );
  }
  return null;
}
function ResultsView({ caseData, answers }) {
  const r = caseData.results;
  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "locked-recap" },
      h("div", { className: "lr-head" }, h(IconLock, { width: 12, height: 12 }), "Your differentials (committed \u2014 cannot be changed)"),
      h("p", null, answers.stage1 || "\u2014")
    ),
    h("p", { className: "results-narrative" }, caseData.resultsIntro),
    r.tables.map((t, i) => h(
      "div",
      { className: "lab-table-wrap", key: i },
      h("div", { className: "lab-table-title" }, t.title),
      h(
        "table",
        { className: "lab" },
        h("thead", null, h(
          "tr",
          null,
          h("th", null, "Test"),
          h("th", null, "Value"),
          h("th", null, "Reference")
        )),
        h("tbody", null, t.rows.map((row, j) => h(
          "tr",
          { key: j },
          h("td", null, row.test),
          h(
            "td",
            { className: "val" },
            row.value,
            row.flag && h("span", { className: "flag " + row.flag }, row.flag === "high" ? "H" : "L")
          ),
          h("td", { className: "ref" }, row.ref)
        )))
      )
    )),
    h("h4", { style: { fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", margin: "1.5rem 0 0.75rem" } }, "Findings"),
    h("ul", { className: "findings-list" }, r.findings.map((f, i) => h("li", { key: i }, f))),
    h("p", { className: "results-narrative", style: { marginTop: "1rem" } }, r.narrative)
  );
}
function Report({ caseId, attempts, nav }) {
  const caseData = useMemo(() => CASES.find((c) => c.id === caseId), [caseId]);
  const attempt = attempts[caseId];
  if (!caseData || !attempt) {
    return h(
      "div",
      { className: "wrap section" },
      h("p", null, "No report yet."),
      h("button", { className: "btn btn-primary", onClick: () => nav("/case/" + caseId) }, "Attempt this case")
    );
  }
  const { result } = attempt;
  const scoreColor = (s) => s >= 75 ? "var(--green)" : s >= 50 ? "var(--accent)" : s >= 30 ? "var(--amber)" : "var(--danger)";
  return h(
    "div",
    { className: "wrap section" },
    // header
    h(
      "div",
      { className: "report-head" },
      h(
        "div",
        null,
        h("div", { className: "r-case" }, caseData.specialty + " \xB7 " + caseData.title),
        h("h1", null, "Reasoning report"),
        h("p", { className: "r-target" }, "Target diagnosis: ", h("strong", null, caseData.target))
      ),
      h(
        "div",
        { className: "score-ring-wrap" },
        h(ScoreRing, { value: result.overall, color: scoreColor(result.overall) }),
        h("div", { className: "score-label" }, "Overall")
      )
    ),
    // professor feedback (full width)
    h(
      "div",
      { className: "panel full-width", style: { marginBottom: "2rem" } },
      h(
        "div",
        { className: "prof-feedback" },
        h("div", { className: "pf-attr" }, "On the round \u2014 your examiner"),
        result.feedback.map((line, i) => h("p", { key: i }, line))
      )
    ),
    // two-column grid
    h(
      "div",
      { className: "report-grid" },
      // left: dimensions + radar
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2rem" } },
        h(
          "div",
          { className: "panel" },
          h("h2", null, "The five dimensions"),
          result.dimensions.map((d) => h(
            "div",
            { className: "dimbar", key: d.key },
            h(
              "div",
              { className: "dimbar-top" },
              h("span", { className: "dimbar-name" }, d.key),
              h("span", { className: "dimbar-val" }, d.score)
            ),
            h(
              "div",
              { className: "dimbar-track" },
              h("div", { className: "dimbar-fill", style: { width: d.score + "%", background: scoreColor(d.score) } })
            )
          ))
        ),
        h(
          "div",
          { className: "panel radar-wrap" },
          h("h2", { style: { alignSelf: "flex-start" } }, "Profile"),
          h(Radar, { dimensions: result.dimensions })
        )
      ),
      // right: reasoning path + mapping + gaps
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2rem" } },
        h(
          "div",
          { className: "panel" },
          h("h2", null, "Did you catch the killers?"),
          h(
            "div",
            { className: "killers" },
            result.raw.reasoning.caught.map((k, i) => h(
              "div",
              { className: "killer-row", key: "c" + i },
              h("span", { className: "killer-ic caught" }, h(IconCheck, { width: 12, height: 12 })),
              h(
                "span",
                null,
                k.label,
                h("span", { className: "understood" }, "  \xB7 read from \u201C" + k.understoodAs + "\u201D")
              )
            )),
            result.raw.reasoning.missed.map((m, i) => h(
              "div",
              { className: "killer-row", key: "m" + i },
              h("span", { className: "killer-ic missed" }, h(IconX, { width: 12, height: 12 })),
              h("span", null, m, h("span", { className: "understood" }, "  \xB7 not raised at stage 1"))
            ))
          )
        ),
        h(
          "div",
          { className: "panel" },
          h("h2", null, "How we read your words"),
          h(
            "div",
            { className: "mapping" },
            buildMapping(caseData, attempt).map((m, i) => h(
              "div",
              { className: "map-row", key: i },
              h("code", null, "\u201C" + m.phrase + "\u201D"),
              h("span", { className: "arrow" }, "\u2192"),
              h("span", null, m.concept, " \u2713")
            )),
            buildMapping(caseData, attempt).length === 0 && h("p", { style: { fontSize: "var(--text-sm)", color: "var(--ink-faint)" } }, "We could not confidently map your differentials to known concepts.")
          )
        ),
        h(
          "div",
          { className: "panel" },
          h("h2", null, "Knowledge gaps"),
          result.gaps.length ? h("ul", { className: "gaps-list" }, result.gaps.map((g, i) => h("li", { key: i }, g))) : h("p", { style: { fontSize: "var(--text-sm)", color: "var(--green)" } }, "No significant gaps flagged. Clean work.")
        )
      )
    ),
    h(
      "div",
      { className: "report-actions" },
      h("button", { className: "btn btn-ghost", onClick: () => nav("/cases") }, "Back to library"),
      h("button", { className: "btn btn-primary", onClick: () => nav("/case/" + caseId) }, "Re-attempt this case")
    )
  );
}
function buildMapping(caseData, attempt) {
  const raw = ((attempt.answers.stage1 || "") + " " + (attempt.answers.stage3 || "")).toLowerCase();
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const d of caseData.rubric.differentials) {
    for (const syn of d.synonyms) {
      const s = syn.toLowerCase();
      if (raw.includes(s) && s !== d.label.toLowerCase() && !seen.has(d.id)) {
        out.push({ phrase: syn, concept: d.label });
        seen.add(d.id);
        break;
      }
    }
  }
  return out.slice(0, 5);
}
function ScoreRing({ value, color }) {
  const R = 52, C = 2 * Math.PI * R;
  const off = C * (1 - value / 100);
  return h(
    "div",
    { style: { position: "relative", width: 130, height: 130 } },
    h(
      "svg",
      { width: 130, height: 130, viewBox: "0 0 130 130" },
      h("circle", { cx: 65, cy: 65, r: R, fill: "none", stroke: "var(--line)", strokeWidth: 9 }),
      h("circle", {
        cx: 65,
        cy: 65,
        r: R,
        fill: "none",
        stroke: color,
        strokeWidth: 9,
        strokeLinecap: "round",
        strokeDasharray: C,
        strokeDashoffset: off,
        transform: "rotate(-90 65 65)",
        style: { transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }
      })
    ),
    h(
      "div",
      { style: { position: "absolute", inset: 0, display: "grid", placeItems: "center" } },
      h("span", { className: "score-big", style: { fontSize: "2.4rem" } }, value)
    )
  );
}
function Radar({ dimensions }) {
  const size = 260, cx = size / 2, cy = size / 2, R = 96;
  const n = dimensions.length;
  const short = { "Diagnostic accuracy": "Diagnosis", "Reasoning path": "Reasoning", "Investigation choice": "Workup", "Management safety": "Management", "Clarity of explanation": "Clarity" };
  const angle = (i) => Math.PI * 2 * i / n - Math.PI / 2;
  const pt = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const rings = [0.25, 0.5, 0.75, 1];
  const poly = dimensions.map((d, i) => pt(i, R * (d.score / 100)).join(",")).join(" ");
  return h(
    "svg",
    { width: size, height: size + 30, viewBox: `0 0 ${size} ${size + 30}`, style: { overflow: "visible" } },
    rings.map((rr, i) => h("polygon", {
      key: "r" + i,
      fill: "none",
      stroke: "var(--line)",
      strokeWidth: 1,
      points: dimensions.map((_, j) => pt(j, R * rr).join(",")).join(" ")
    })),
    dimensions.map((_, i) => {
      const [x, y] = pt(i, R);
      return h("line", { key: "a" + i, x1: cx, y1: cy, x2: x, y2: y, stroke: "var(--line)", strokeWidth: 1 });
    }),
    h("polygon", { points: poly, fill: "color-mix(in oklab, var(--accent) 22%, transparent)", stroke: "var(--accent)", strokeWidth: 2, strokeLinejoin: "round" }),
    dimensions.map((d, i) => {
      const [x, y] = pt(i, R * (d.score / 100));
      return h("circle", { key: "d" + i, cx: x, cy: y, r: 3, fill: "var(--accent)" });
    }),
    dimensions.map((d, i) => {
      const [x, y] = pt(i, R + 20);
      const anchor = Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end";
      return h("text", {
        key: "t" + i,
        x,
        y,
        textAnchor: anchor,
        dominantBaseline: "middle",
        fontSize: 11,
        fill: "var(--ink-soft)",
        fontFamily: "var(--font-body)"
      }, short[d.key] || d.key);
    })
  );
}
createRoot(document.getElementById("root")).render(h(App));
