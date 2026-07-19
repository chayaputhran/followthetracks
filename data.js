// Follow The Tracks — clinical case data + grading rubrics
// All content authored for an Indian medical-education context.
// Internal pedagogy note (NOT surfaced in UI): stages enforce observe->hypothesise->test;
// killers must be considered before results reveal; final stage rewards plain-language reasoning.

export const CASES = [
  // ============================================================ CASE 1 =====
  {
    id: "pe-chestpain",
    title: "Breathless after a plaster cast",
    specialty: "Internal Medicine",
    difficulty: "Moderate",
    minutes: 15,
    oneLiner:
      "A 45-year-old autorickshaw driver with sudden pleuritic chest pain and breathlessness, two weeks after an ankle cast.",
    target: "Pulmonary embolism",

    // Stage 1 — vignette (history + vitals only)
    vignette: {
      history:
        "Mr. Ramesh Naik, 45, an autorickshaw driver from Kolhapur, is brought to the medicine casualty at 2 PM with sudden-onset right-sided chest pain and breathlessness for the last three hours. The pain is sharp, worse on deep inspiration and on coughing, and does not radiate. He feels his heart racing. He denies fever, cough or haemoptysis but says he coughed once and it \"felt like something tore\".\n\nTwo weeks ago he fractured his right ankle in a fall and has been in a below-knee plaster cast, mostly resting at home and barely walking. He smokes about 15 bidis a day and has done so for 20 years. No known diabetes or hypertension, not on any regular medication. No prior cardiac or lung disease.",
      vitals: [
        { label: "Temperature", value: "37.1 °C" },
        { label: "Pulse", value: "118 /min, regular" },
        { label: "Blood pressure", value: "108/72 mmHg" },
        { label: "Respiratory rate", value: "28 /min" },
        { label: "SpO₂ (room air)", value: "89%" },
        { label: "GCS", value: "15/15" },
      ],
      exam:
        "Anxious, mildly tachypnoeic, using accessory muscles. Chest clear on auscultation, no crepitations, equal air entry, trachea central. Heart sounds normal, no murmur, loud P2. Right calf is inside a plaster cast; the exposed toes are warm with normal capillary refill. No pedal oedema on the left.",
    },
    stage1Prompt:
      "List your differential diagnoses in order of priority, with one line of reasoning each. Put the diagnoses you cannot afford to miss first.",

    // Stage 2 — workup plan
    stage2Prompt:
      "What focused history, examination findings and first-line investigations do you want, and what would each tell you?",

    // Stage 3 — results reveal
    resultsIntro:
      "You proceed with a focused, safety-first workup. The following results come back.",
    results: {
      narrative:
        "Bedside assessment: the calf could not be examined under the cast, but the patient reports no new leg swelling. A Wells score is calculated at the bedside: clinical features of DVT not assessable but immobilisation present, heart rate >100, recent immobilisation/surgery, haemoptysis absent, malignancy absent, and PE judged the most likely diagnosis — placing him in the high-probability band. Troponin I is sent, D-dimer is sent, ECG and portable chest X-ray are done, and an arterial blood gas is drawn.",
      tables: [
        {
          title: "Arterial blood gas (room air)",
          rows: [
            { test: "pH", value: "7.48", ref: "7.35–7.45", flag: "high" },
            { test: "PaO₂", value: "58 mmHg", ref: "80–100", flag: "low" },
            { test: "PaCO₂", value: "30 mmHg", ref: "35–45", flag: "low" },
            { test: "HCO₃⁻", value: "22 mmol/L", ref: "22–26", flag: "" },
          ],
        },
        {
          title: "Bloods",
          rows: [
            { test: "Troponin I", value: "0.01 ng/mL", ref: "<0.04", flag: "" },
            { test: "D-dimer", value: "4.8 µg/mL FEU", ref: "<0.5", flag: "high" },
            { test: "Haemoglobin", value: "14.2 g/dL", ref: "13–17", flag: "" },
            { test: "TLC", value: "9,800 /µL", ref: "4,000–11,000", flag: "" },
            { test: "Creatinine", value: "0.9 mg/dL", ref: "0.7–1.3", flag: "" },
          ],
        },
      ],
      findings: [
        "ECG: sinus tachycardia at 116/min. S wave in lead I, Q wave and inverted T wave in lead III (S1Q3T3 pattern). Incomplete right bundle branch block. No ST-elevation.",
        "Portable chest X-ray: lungs clear, no pneumothorax, no consolidation, no effusion. Cardiac silhouette normal, mediastinum not widened.",
        "The combination of a high Wells score with a positive D-dimer and hypoxia would, in practice, prompt CT pulmonary angiography — which confirms filling defects in the right lower-lobe segmental pulmonary arteries.",
      ],
    },
    stage3Prompt:
      "Revise your diagnosis in light of these results. What is your working diagnosis and why? Comment on how the ECG, D-dimer, troponin and X-ray fit together.",

    stage4Prompt:
      "Outline your immediate management plan for this patient.",

    stage5Prompt:
      "Explain this case in simple words, as you would to an intern on the round — what happened to this man and why.",

    // ---- Grading rubric ----
    rubric: {
      // Stage 1 differentials. mustNotMiss = "killers".
      differentials: [
        {
          id: "pe",
          label: "Pulmonary embolism",
          isTarget: true,
          mustNotMiss: true,
          synonyms: ["pulmonary embolism", "pulmonary thromboembolism", "pe", "pte", "lung clot", "blood clot in lung", "clot in the lung", "lung blood clot", "clot in lungs", "clot to the lung", "clot travelled to lung", "embolus in lung", "pulmonary embolus", "thromboembolism", "clot pulmonary", "dvt embolised"],
        },
        {
          id: "acs",
          label: "Acute coronary syndrome",
          mustNotMiss: true,
          synonyms: ["acute coronary syndrome", "acs", "myocardial infarction", "heart attack", "cardiac event", "mi", "nstemi", "stemi", "unstable angina", "angina", "ischaemic heart disease", "ischemic heart disease", "cardiac chest pain"],
        },
        {
          id: "pneumothorax",
          label: "Pneumothorax",
          mustNotMiss: true,
          synonyms: ["pneumothorax", "collapsed lung", "lung collapse", "air in the chest", "air in pleura", "ptx", "tension pneumothorax"],
        },
        {
          id: "dissection",
          label: "Aortic dissection",
          mustNotMiss: true,
          synonyms: ["aortic dissection", "dissection", "dissecting aneurysm", "aortic aneurysm dissection", "torn aorta", "aorta tear", "aortic tear"],
        },
        {
          id: "pneumonia",
          label: "Pneumonia / pleurisy",
          mustNotMiss: false,
          synonyms: ["pneumonia", "chest infection", "lung infection", "lower respiratory tract infection", "pleurisy", "pleuritis", "lrti"],
        },
      ],
      // Stage 2 investigations / workup
      investigations: [
        { id: "ecg", label: "ECG", synonyms: ["ecg", "ekg", "electrocardiogram", "electrocardiograph"] },
        { id: "ddimer", label: "D-dimer", synonyms: ["d-dimer", "d dimer", "ddimer"] },
        { id: "trop", label: "Troponin", synonyms: ["troponin", "trop", "cardiac enzymes", "trop i", "trop t"] },
        { id: "cxr", label: "Chest X-ray", synonyms: ["chest x-ray", "chest xray", "cxr", "chest radiograph", "x-ray chest"] },
        { id: "abg", label: "Arterial blood gas", synonyms: ["abg", "arterial blood gas", "blood gas"] },
        { id: "wells", label: "Wells score / pre-test probability", synonyms: ["wells score", "wells", "pre-test probability", "pretest probability", "risk stratification", "geneva score"] },
        { id: "ctpa", label: "CT pulmonary angiography", synonyms: ["ctpa", "ct pulmonary angiography", "ct angiogram", "ct angio", "ct chest", "spiral ct"] },
        { id: "doppler", label: "Lower-limb Doppler / DVT screen", synonyms: ["doppler", "venous doppler", "lower limb doppler", "dvt screen", "leg doppler", "compression ultrasound"] },
        { id: "spo2", label: "Pulse oximetry / oxygenation", synonyms: ["spo2", "pulse oximetry", "oxygen saturation", "saturation"] },
        { id: "echo", label: "Echocardiography", synonyms: ["echo", "echocardiography", "2d echo", "bedside echo"] },
      ],
      // Stage 4 management
      management: [
        { id: "oxygen", label: "Supplemental oxygen", critical: true, synonyms: ["oxygen", "o2", "supplemental oxygen", "high flow oxygen", "oxygen therapy"] },
        { id: "anticoag", label: "Anticoagulation", critical: true, synonyms: ["anticoagulation", "anticoagulant", "heparin", "lmwh", "enoxaparin", "low molecular weight heparin", "warfarin", "doac", "apixaban", "rivaroxaban", "blood thinner", "unfractionated heparin"] },
        { id: "monitor", label: "Continuous monitoring / admit", critical: false, synonyms: ["monitor", "monitoring", "admit", "hdu", "icu", "continuous monitoring", "cardiac monitor", "observation"] },
        { id: "analgesia", label: "Analgesia", critical: false, synonyms: ["analgesia", "analgesic", "pain relief", "painkiller", "paracetamol", "opioid"] },
        { id: "thrombolysis", label: "Assess for thrombolysis if unstable", critical: false, synonyms: ["thrombolysis", "thrombolytic", "clot buster", "alteplase", "streptokinase", "tpa"] },
        { id: "ivaccess", label: "IV access & fluids assessment", critical: false, synonyms: ["iv access", "intravenous access", "iv fluids", "iv line", "cannula"] },
      ],
      // Stage 5 jargon terms (for jargon-density heuristic)
      jargonTerms: ["thromboembolism", "hypoxia", "tachycardia", "d-dimer", "anticoagulation", "s1q3t3", "pleuritic", "segmental", "perfusion", "ventilation"],
    },
  },

  // ============================================================ CASE 2 =====
  {
    id: "dengue-fever",
    title: "Fever in the monsoon",
    specialty: "Infectious Diseases",
    difficulty: "Moderate",
    minutes: 15,
    oneLiner:
      "A 24-year-old Chennai college student with four days of high fever, retro-orbital pain and a falling platelet count.",
    target: "Dengue with warning signs",

    vignette: {
      history:
        "Ms. Divya Karthik, 24, an engineering student in Chennai, presents in late October — peak monsoon — with high-grade fever for four days, up to 40 °C, with chills. She has severe pain behind both eyes, aching muscles and joints (\"my whole body hurts\"), and a bad headache. For the last day she has felt nauseated with a couple of episodes of vomiting and mild pain over the upper abdomen. She noticed some tiny red spots on her forearms this morning.\n\nSeveral classmates in her hostel have had fever this month. There is stagnant water and construction near the hostel. No cough, no burning micturition, no loose stools, no rash elsewhere. Last menstrual period two weeks ago. No recent travel outside the city, no jaundice. Not on any medication except paracetamol she bought over the counter.",
      vitals: [
        { label: "Temperature", value: "39.4 °C" },
        { label: "Pulse", value: "102 /min" },
        { label: "Blood pressure", value: "104/70 mmHg" },
        { label: "Respiratory rate", value: "20 /min" },
        { label: "SpO₂ (room air)", value: "98%" },
        { label: "Capillary refill", value: "<2 s" },
      ],
      exam:
        "Flushed, unwell but alert. Scattered petechiae over both forearms; a faint tourniquet test is positive. No neck stiffness. Mild tenderness in the right hypochondrium/epigastrium; liver just palpable, tender. No splenomegaly. No frank bleeding from gums or nose. Chest clear, no added sounds. Cardiovascular examination normal.",
    },
    stage1Prompt:
      "List your differential diagnoses in order of priority, with one line of reasoning each. Put the diagnoses you cannot afford to miss first.",

    stage2Prompt:
      "What focused history, examination findings and first-line investigations do you want, and what would each tell you?",

    resultsIntro:
      "Bloods, a peripheral smear and dengue serology are sent. Serial haematocrit and platelets are ordered. Results follow.",
    results: {
      narrative:
        "Serial monitoring shows the haematocrit rising from admission and the platelet count falling — the classic combination that signals plasma leakage. Combined with abdominal pain, persistent vomiting and a tender liver, this places her firmly in the 'dengue with warning signs' category, warranting admission and close observation for shock.",
      tables: [
        {
          title: "Complete blood count",
          rows: [
            { test: "Haemoglobin", value: "14.8 g/dL", ref: "12–15", flag: "high" },
            { test: "Haematocrit (on admission)", value: "44%", ref: "36–44", flag: "" },
            { test: "Haematocrit (12 h later)", value: "50%", ref: "36–44", flag: "high" },
            { test: "Platelets", value: "42,000 /µL", ref: "150,000–410,000", flag: "low" },
            { test: "Total leucocyte count", value: "3,100 /µL", ref: "4,000–11,000", flag: "low" },
          ],
        },
        {
          title: "Serology & biochemistry",
          rows: [
            { test: "Dengue NS1 antigen", value: "Positive", ref: "Negative", flag: "high" },
            { test: "Dengue IgM", value: "Positive", ref: "Negative", flag: "high" },
            { test: "Malaria rapid test / smear", value: "Negative", ref: "Negative", flag: "" },
            { test: "SGOT / AST", value: "180 U/L", ref: "<40", flag: "high" },
            { test: "SGPT / ALT", value: "156 U/L", ref: "<40", flag: "high" },
          ],
        },
      ],
      findings: [
        "Peripheral smear: no malarial parasites seen; thrombocytopenia confirmed; reactive lymphocytes present.",
        "Urine output is being charted; she has passed adequate urine so far but is being watched for narrowing pulse pressure.",
        "Rising haematocrit with falling platelets is the hallmark of plasma leakage in dengue.",
      ],
    },
    stage3Prompt:
      "Revise your diagnosis in light of these results. What is your working diagnosis and why? Explain which findings tell you she has warning signs.",

    stage4Prompt:
      "Outline your immediate management plan for this patient.",

    stage5Prompt:
      "Explain this case in simple words, as you would to an intern on the round — what is happening to her and what you are watching for.",

    rubric: {
      differentials: [
        {
          id: "dengue",
          label: "Dengue (with warning signs)",
          isTarget: true,
          mustNotMiss: true,
          synonyms: ["dengue", "dengue fever", "dengue with warning signs", "dhf", "dengue haemorrhagic fever", "dengue hemorrhagic fever", "severe dengue", "dengue shock", "break bone fever", "breakbone fever"],
        },
        {
          id: "malaria",
          label: "Malaria",
          mustNotMiss: true,
          synonyms: ["malaria", "falciparum", "plasmodium", "vivax", "cerebral malaria", "mosquito fever", "malarial fever"],
        },
        {
          id: "lepto",
          label: "Leptospirosis",
          mustNotMiss: true,
          synonyms: ["leptospirosis", "lepto", "weils disease", "weil disease", "weil's disease"],
        },
        {
          id: "sepsis",
          label: "Sepsis / enteric fever",
          mustNotMiss: true,
          synonyms: ["sepsis", "septicaemia", "septicemia", "enteric fever", "typhoid", "typhoid fever", "bacteraemia", "bacteremia", "blood infection", "systemic infection"],
        },
        {
          id: "chik",
          label: "Chikungunya / other arbovirus",
          mustNotMiss: false,
          synonyms: ["chikungunya", "chik", "arbovirus", "viral fever", "arboviral"],
        },
      ],
      investigations: [
        { id: "cbc", label: "Complete blood count", synonyms: ["cbc", "complete blood count", "full blood count", "fbc", "haemogram", "hemogram", "blood count"] },
        { id: "platelet", label: "Platelet count", synonyms: ["platelet", "platelets", "platelet count"] },
        { id: "hct", label: "Serial haematocrit", synonyms: ["haematocrit", "hematocrit", "hct", "pcv", "packed cell volume", "serial hct"] },
        { id: "ns1", label: "Dengue NS1 / serology", synonyms: ["ns1", "dengue serology", "dengue ns1", "dengue igm", "dengue antigen", "dengue test"] },
        { id: "malariatest", label: "Malaria smear / rapid test", synonyms: ["malaria smear", "peripheral smear", "malaria rapid test", "malaria test", "mp smear", "blood smear", "smear"] },
        { id: "lft", label: "Liver function tests", synonyms: ["lft", "liver function", "liver function test", "sgot", "sgpt", "ast", "alt", "transaminases"] },
        { id: "rft", label: "Renal function / electrolytes", synonyms: ["rft", "renal function", "kft", "urea", "creatinine", "electrolytes"] },
        { id: "leptotest", label: "Leptospira serology", synonyms: ["leptospira", "lepto serology", "mat", "leptospira igm"] },
        { id: "widal", label: "Blood culture / Widal", synonyms: ["blood culture", "widal", "culture", "typhidot"] },
        { id: "tourniquet", label: "Tourniquet test", synonyms: ["tourniquet test", "tourniquet", "hess test"] },
        { id: "urine", label: "Urine output monitoring", synonyms: ["urine output", "urine monitoring", "uop", "fluid balance", "input output"] },
      ],
      management: [
        { id: "fluids", label: "Careful crystalloid fluid therapy", critical: true, synonyms: ["iv fluids", "crystalloid", "fluid therapy", "fluid resuscitation", "ringer lactate", "normal saline", "isotonic fluids", "maintenance fluids", "fluids"] },
        { id: "monitor", label: "Admit & monitor vitals/HCT/platelets", critical: true, synonyms: ["admit", "monitoring", "monitor", "serial haematocrit", "watch platelets", "vital monitoring", "hourly monitoring", "observation", "hourly vitals"] },
        { id: "avoidnsaid", label: "Avoid NSAIDs / aspirim; use paracetamol", critical: true, synonyms: ["avoid nsaid", "avoid aspirin", "no nsaid", "paracetamol", "acetaminophen", "avoid ibuprofen", "antipyretic paracetamol"] },
        { id: "shockwatch", label: "Watch for shock / warning signs", critical: false, synonyms: ["watch for shock", "shock", "warning signs", "pulse pressure", "narrowing pulse pressure", "hypotension"] },
        { id: "transfuse", label: "Platelet/blood transfusion only if bleeding", critical: false, synonyms: ["platelet transfusion", "blood transfusion", "transfusion", "transfuse if bleeding"] },
        { id: "noantibiotic", label: "No empirical antibiotics unless indicated", critical: false, synonyms: ["antibiotics if", "avoid antibiotics", "no antibiotics"] },
      ],
      jargonTerms: ["thrombocytopenia", "haematocrit", "plasma leakage", "petechiae", "hypochondrium", "serology", "arbovirus", "hypovolaemia", "capillary permeability"],
    },
  },

  // ============================================================ CASE 3 =====
  {
    id: "hypoglycaemia",
    title: "Drowsy and sweating",
    specialty: "Emergency Medicine",
    difficulty: "Hard",
    minutes: 12,
    oneLiner:
      "A 62-year-old with type 2 diabetes on glibenclamide, brought in drowsy and diaphoretic after skipping meals.",
    target: "Hypoglycaemia",

    vignette: {
      history:
        "Mr. Abdul Rahman, 62, is brought to the emergency department by his son at 11 AM, found drowsy and drenched in sweat at home. He has type 2 diabetes for twelve years and takes glibenclamide (a sulfonylurea) daily. Over the last two days he has been fasting for a family occasion and eating very little, but took his tablets as usual this morning. The son noticed him becoming confused and shaky over the past hour, with slurred speech, before he became difficult to rouse.\n\nNo history of head injury, fever, chest pain or seizure witnessed. Known hypertensive on amlodipine. No prior stroke. He does not drink alcohol.",
      vitals: [
        { label: "Temperature", value: "36.6 °C" },
        { label: "Pulse", value: "104 /min" },
        { label: "Blood pressure", value: "150/90 mmHg" },
        { label: "Respiratory rate", value: "18 /min" },
        { label: "SpO₂ (room air)", value: "97%" },
        { label: "GCS", value: "12/15 (E3 V4 M5)" },
      ],
      exam:
        "Drowsy but rousable to voice, confused, cool clammy skin, profuse sweating. Pupils equal and reactive. No obvious facial asymmetry at rest, moving all four limbs to stimulus, no lateralising weakness clearly demonstrable while agitated. No neck stiffness. No smell of ketones or alcohol. No signs of trauma. Chest clear, abdomen soft.",
    },
    stage1Prompt:
      "List your differential diagnoses in order of priority, with one line of reasoning each. Put the diagnoses you cannot afford to miss first — and state the very first bedside test you would do.",

    stage2Prompt:
      "What focused history, examination findings and first-line investigations do you want, and what would each tell you? Be explicit about sequence.",

    resultsIntro:
      "The bedside team acts on your instructions. Here is what comes back.",
    results: {
      narrative:
        "A capillary blood glucose is checked immediately at the bedside — before any imaging — and reads 34 mg/dL, confirming profound hypoglycaemia. This explains the sweating, drowsiness and confusion in a patient on a sulfonylurea who has not eaten. A venous sample is sent to confirm. IV dextrose is given and, within minutes, he becomes more alert.",
      tables: [
        {
          title: "Point-of-care & bloods",
          rows: [
            { test: "Capillary blood glucose", value: "34 mg/dL", ref: "70–140", flag: "low" },
            { test: "Venous glucose (lab)", value: "38 mg/dL", ref: "70–140", flag: "low" },
            { test: "Serum ketones", value: "Negative", ref: "Negative", flag: "" },
            { test: "Sodium", value: "138 mmol/L", ref: "135–145", flag: "" },
            { test: "Potassium", value: "4.1 mmol/L", ref: "3.5–5.0", flag: "" },
            { test: "Creatinine", value: "1.4 mg/dL", ref: "0.7–1.3", flag: "high" },
          ],
        },
        {
          title: "After IV dextrose",
          rows: [
            { test: "Repeat capillary glucose", value: "126 mg/dL", ref: "70–140", flag: "" },
            { test: "GCS", value: "15/15", ref: "15", flag: "" },
          ],
        },
      ],
      findings: [
        "ECG: sinus tachycardia, no acute ischaemic changes.",
        "With glucose corrected, the drowsiness resolves and no focal neurological deficit remains — arguing against an acute stroke as the primary cause.",
        "Because glibenclamide is long-acting and he has mild renal impairment, hypoglycaemia can recur — he needs admission and a dextrose infusion, not just a single bolus.",
      ],
    },
    stage3Prompt:
      "Revise your diagnosis in light of these results. What is your working diagnosis and why? Why did the glucose need to be checked before any imaging?",

    stage4Prompt:
      "Outline your immediate management plan for this patient, including why a single correction is not enough.",

    stage5Prompt:
      "Explain this case in simple words, as you would to an intern on the round — what happened and the one lesson to take away.",

    rubric: {
      differentials: [
        {
          id: "hypo",
          label: "Hypoglycaemia",
          isTarget: true,
          mustNotMiss: true,
          synonyms: ["hypoglycaemia", "hypoglycemia", "hypo", "low blood sugar", "low sugar", "sugar low", "sugar is low", "low glucose", "blood sugar low", "drop in sugar", "fallen sugar", "sulfonylurea induced hypoglycaemia", "sulphonylurea hypoglycaemia", "sugar dropped"],
        },
        {
          id: "stroke",
          label: "Stroke / CVA",
          mustNotMiss: true,
          synonyms: ["stroke", "cva", "cerebrovascular accident", "brain haemorrhage", "brain hemorrhage", "brain bleed", "bleed in brain", "clot in brain", "brain clot", "ischaemic stroke", "intracranial haemorrhage", "tia", "brain attack"],
        },
        {
          id: "dka",
          label: "DKA / HHS (hyperglycaemic crisis)",
          mustNotMiss: true,
          synonyms: ["dka", "diabetic ketoacidosis", "hhs", "hyperosmolar", "hyperglycaemic", "hyperglycemic", "hyperglycaemia", "hyperglycemia", "high blood sugar", "high sugar", "sugar high", "hhns"],
        },
        {
          id: "sepsis",
          label: "Sepsis / infection",
          mustNotMiss: true,
          synonyms: ["sepsis", "infection", "septicaemia", "septicemia", "encephalopathy from infection", "urosepsis"],
        },
        {
          id: "metabolic",
          label: "Other metabolic / electrolyte / toxic cause",
          mustNotMiss: false,
          synonyms: ["electrolyte", "hyponatraemia", "hyponatremia", "uraemia", "uremia", "metabolic encephalopathy", "drug overdose", "poisoning", "toxic"],
        },
      ],
      investigations: [
        { id: "cbg", label: "Capillary blood glucose FIRST", firstTest: true, synonyms: ["capillary blood glucose", "capillary glucose", "blood sugar", "grbs", "rbs", "glucometer", "bedside glucose", "check sugar", "finger prick glucose", "point of care glucose", "cbg", "random blood sugar", "sugar level", "blood glucose"] },
        { id: "gcs", label: "GCS / neuro assessment", synonyms: ["gcs", "glasgow coma scale", "neurological examination", "neuro exam", "pupils", "focal deficit"] },
        { id: "electrolytes", label: "Serum electrolytes / RFT", synonyms: ["electrolytes", "sodium", "potassium", "rft", "renal function", "urea", "creatinine", "serum electrolytes"] },
        { id: "ketones", label: "Serum/urine ketones", synonyms: ["ketones", "serum ketones", "urine ketones", "ketone bodies"] },
        { id: "abg", label: "Arterial blood gas", synonyms: ["abg", "arterial blood gas", "blood gas", "acidosis"] },
        { id: "ecg", label: "ECG", synonyms: ["ecg", "ekg", "electrocardiogram"] },
        { id: "ctbrain", label: "CT brain (after glucose)", synonyms: ["ct brain", "ct head", "brain imaging", "neuroimaging", "ct scan brain", "imaging brain"] },
        { id: "cbc", label: "CBC / infection screen", synonyms: ["cbc", "complete blood count", "tlc", "white cell count", "infection screen", "cultures"] },
      ],
      management: [
        { id: "dextrose", label: "IV dextrose (25% / 50%) now", critical: true, synonyms: ["iv dextrose", "dextrose", "d25", "d50", "25% dextrose", "50% dextrose", "glucose iv", "iv glucose", "dextrose bolus", "sugar iv"] },
        { id: "airway", label: "Airway / ABC / IV access", critical: true, synonyms: ["airway", "abc", "iv access", "secure airway", "protect airway", "recovery position", "cannula", "intravenous access"] },
        { id: "infusion", label: "Continuous dextrose infusion & admit", critical: true, synonyms: ["dextrose infusion", "10% dextrose infusion", "continuous dextrose", "admit", "d10 infusion", "glucose infusion", "observe for recurrence", "prolonged monitoring"] },
        { id: "stopdrug", label: "Withhold sulfonylurea / review meds", critical: false, synonyms: ["stop glibenclamide", "withhold sulfonylurea", "stop sulphonylurea", "stop tablet", "review medication", "hold diabetes medication", "stop oha"] },
        { id: "recheck", label: "Recheck glucose serially", critical: false, synonyms: ["recheck glucose", "repeat glucose", "serial glucose", "monitor sugar", "hourly glucose", "monitor blood sugar"] },
        { id: "octreotide", label: "Consider octreotide for sulfonylurea overdose", critical: false, synonyms: ["octreotide"] },
        { id: "feed", label: "Oral feed once alert", critical: false, synonyms: ["oral feed", "feed", "complex carbohydrate", "meal", "oral carbohydrate", "food"] },
      ],
      jargonTerms: ["hypoglycaemia", "sulfonylurea", "diaphoresis", "neuroglycopenia", "gcs", "dextrose", "encephalopathy", "renal impairment"],
    },
  },
];
