import type { CodeEntry } from "@/lib/contract";

// 60 real, common outpatient ICD-10-CM codes. Descriptions follow the official
// short-description style; synonyms are superbill phrasings a clinician writes.
export const ICD10_CODES: CodeEntry[] = [
  {
    code: "J06.9",
    description: "Acute upper respiratory infection, unspecified",
    synonyms: ["URI", "acute URI", "upper respiratory infection", "common cold"],
  },
  {
    code: "J02.9",
    description: "Acute pharyngitis, unspecified",
    synonyms: ["sore throat", "pharyngitis", "acute pharyngitis"],
  },
  {
    code: "J02.0",
    description: "Streptococcal pharyngitis",
    synonyms: ["strep throat", "strep pharyngitis", "group A strep throat"],
  },
  {
    code: "J01.90",
    description: "Acute sinusitis, unspecified",
    synonyms: ["sinusitis", "sinus infection", "acute sinus infection"],
  },
  {
    code: "J20.9",
    description: "Acute bronchitis, unspecified",
    synonyms: ["bronchitis", "acute bronchitis", "chest cold"],
  },
  {
    code: "J30.9",
    description: "Allergic rhinitis, unspecified",
    synonyms: ["allergic rhinitis", "hay fever", "seasonal allergies"],
  },
  {
    code: "J45.909",
    description: "Unspecified asthma, uncomplicated",
    synonyms: ["asthma", "asthma uncomplicated", "mild asthma"],
  },
  {
    code: "J44.9",
    description: "Chronic obstructive pulmonary disease, unspecified",
    synonyms: ["COPD", "chronic obstructive pulmonary disease", "emphysema"],
  },
  {
    code: "H66.90",
    description: "Otitis media, unspecified, unspecified ear",
    synonyms: ["ear infection", "otitis media", "OM"],
  },
  {
    code: "H10.9",
    description: "Unspecified conjunctivitis",
    synonyms: ["pink eye", "conjunctivitis", "eye infection"],
  },
  {
    code: "U07.1",
    description: "COVID-19",
    synonyms: ["COVID", "COVID-19 infection", "SARS-CoV-2 infection"],
  },
  {
    code: "Z23",
    description: "Encounter for immunization",
    synonyms: ["immunization visit", "vaccination", "vaccine encounter"],
  },
  {
    code: "R05.9",
    description: "Cough, unspecified",
    synonyms: ["cough", "persistent cough"],
  },
  {
    code: "R06.02",
    description: "Shortness of breath",
    synonyms: ["SOB", "shortness of breath", "dyspnea"],
  },
  {
    code: "R50.9",
    description: "Fever, unspecified",
    synonyms: ["fever", "febrile", "pyrexia"],
  },
  {
    code: "I10",
    description: "Essential (primary) hypertension",
    synonyms: ["HTN", "hypertension", "high blood pressure", "essential HTN"],
  },
  {
    code: "I48.91",
    description: "Unspecified atrial fibrillation",
    synonyms: ["afib", "atrial fibrillation", "AF"],
  },
  {
    code: "I25.10",
    description:
      "Atherosclerotic heart disease of native coronary artery without angina pectoris",
    synonyms: ["CAD", "coronary artery disease", "atherosclerotic heart disease"],
  },
  {
    code: "I50.9",
    description: "Heart failure, unspecified",
    synonyms: ["CHF", "heart failure", "congestive heart failure"],
  },
  {
    code: "R07.9",
    description: "Chest pain, unspecified",
    synonyms: ["chest pain", "CP", "atypical chest pain"],
  },
  {
    code: "E11.9",
    description: "Type 2 diabetes mellitus without complications",
    synonyms: ["T2DM", "type 2 diabetes", "diabetes mellitus type II", "DM2"],
  },
  {
    code: "E11.65",
    description: "Type 2 diabetes mellitus with hyperglycemia",
    synonyms: ["T2DM with hyperglycemia", "uncontrolled type 2 diabetes", "DM2 w/ hyperglycemia"],
  },
  {
    code: "E78.5",
    description: "Hyperlipidemia, unspecified",
    synonyms: ["HLD", "hyperlipidemia", "high cholesterol"],
  },
  {
    code: "E03.9",
    description: "Hypothyroidism, unspecified",
    synonyms: ["hypothyroid", "hypothyroidism", "low thyroid"],
  },
  {
    code: "E66.9",
    description: "Obesity, unspecified",
    synonyms: ["obesity", "obese"],
  },
  {
    code: "E66.01",
    description: "Morbid (severe) obesity due to excess calories",
    synonyms: ["morbid obesity", "severe obesity", "class III obesity"],
  },
  {
    code: "E55.9",
    description: "Vitamin D deficiency, unspecified",
    synonyms: ["vitamin D deficiency", "low vitamin D", "vit D deficiency"],
  },
  {
    code: "R73.03",
    description: "Prediabetes",
    synonyms: ["prediabetes", "impaired glucose tolerance", "borderline diabetes"],
  },
  {
    code: "D64.9",
    description: "Anemia, unspecified",
    synonyms: ["anemia", "low hemoglobin", "low hgb"],
  },
  {
    code: "K21.9",
    description: "Gastro-esophageal reflux disease without esophagitis",
    synonyms: ["GERD", "acid reflux", "reflux", "gastroesophageal reflux"],
  },
  {
    code: "K59.00",
    description: "Constipation, unspecified",
    synonyms: ["constipation", "chronic constipation"],
  },
  {
    code: "R11.2",
    description: "Nausea with vomiting, unspecified",
    synonyms: ["nausea and vomiting", "N/V", "n&v"],
  },
  {
    code: "R19.7",
    description: "Diarrhea, unspecified",
    synonyms: ["diarrhea", "loose stools"],
  },
  {
    code: "R10.9",
    description: "Unspecified abdominal pain",
    synonyms: ["abdominal pain", "stomach pain", "belly pain", "abd pain"],
  },
  {
    code: "A09",
    description: "Infectious gastroenteritis and colitis, unspecified",
    synonyms: ["gastroenteritis", "stomach flu", "GI bug"],
  },
  {
    code: "N39.0",
    description: "Urinary tract infection, site not specified",
    synonyms: ["UTI", "urinary tract infection", "bladder infection"],
  },
  {
    code: "N18.9",
    description: "Chronic kidney disease, unspecified",
    synonyms: ["CKD", "chronic kidney disease", "chronic renal disease"],
  },
  {
    code: "E86.0",
    description: "Dehydration",
    synonyms: ["dehydration", "volume depletion", "dehydrated"],
  },
  {
    code: "M54.50",
    description: "Low back pain, unspecified",
    synonyms: ["low back pain", "LBP", "lumbago", "lower back pain"],
  },
  {
    code: "M54.2",
    description: "Cervicalgia",
    synonyms: ["neck pain", "cervical pain", "cervicalgia"],
  },
  {
    code: "M25.511",
    description: "Pain in right shoulder",
    synonyms: ["right shoulder pain", "R shoulder pain", "shoulder pain, right"],
  },
  {
    code: "M25.561",
    description: "Pain in right knee",
    synonyms: ["right knee pain", "R knee pain", "knee pain, right"],
  },
  {
    code: "M79.10",
    description: "Myalgia, unspecified site",
    synonyms: ["myalgia", "muscle aches", "muscle pain"],
  },
  {
    code: "M62.830",
    description: "Muscle spasm of back",
    synonyms: ["back spasm", "back muscle spasm", "lumbar spasm"],
  },
  {
    code: "M17.11",
    description: "Unilateral primary osteoarthritis, right knee",
    synonyms: ["right knee OA", "osteoarthritis right knee", "OA right knee"],
  },
  {
    code: "M19.90",
    description: "Unspecified osteoarthritis, unspecified site",
    synonyms: ["osteoarthritis", "OA", "degenerative joint disease", "DJD"],
  },
  {
    code: "M81.0",
    description: "Age-related osteoporosis without current pathological fracture",
    synonyms: ["osteoporosis", "senile osteoporosis", "postmenopausal osteoporosis"],
  },
  {
    code: "F41.1",
    description: "Generalized anxiety disorder",
    synonyms: ["GAD", "generalized anxiety", "anxiety"],
  },
  {
    code: "F32.9",
    description: "Major depressive disorder, single episode, unspecified",
    synonyms: ["depression", "MDD", "major depression"],
  },
  {
    code: "F90.9",
    description: "Attention-deficit hyperactivity disorder, unspecified type",
    synonyms: ["ADHD", "ADD", "attention deficit disorder"],
  },
  {
    code: "F17.210",
    description: "Nicotine dependence, cigarettes, uncomplicated",
    synonyms: ["nicotine dependence", "cigarette smoker", "tobacco use disorder", "smoker"],
  },
  {
    code: "G47.00",
    description: "Insomnia, unspecified",
    synonyms: ["insomnia", "trouble sleeping", "sleeplessness"],
  },
  {
    code: "G47.33",
    description: "Obstructive sleep apnea (adult) (pediatric)",
    synonyms: ["OSA", "sleep apnea", "obstructive sleep apnea"],
  },
  {
    code: "G43.909",
    description: "Migraine, unspecified, not intractable, without status migrainosus",
    synonyms: ["migraine", "migraine headache", "migraines"],
  },
  {
    code: "R51.9",
    description: "Headache, unspecified",
    synonyms: ["headache", "HA", "cephalgia"],
  },
  {
    code: "R53.83",
    description: "Other fatigue",
    synonyms: ["fatigue", "tiredness", "low energy"],
  },
  {
    code: "L30.9",
    description: "Dermatitis, unspecified",
    synonyms: ["dermatitis", "eczema", "skin rash"],
  },
  {
    code: "L70.0",
    description: "Acne vulgaris",
    synonyms: ["acne", "acne vulgaris"],
  },
  {
    code: "Z00.00",
    description:
      "Encounter for general adult medical examination without abnormal findings",
    synonyms: ["annual physical", "wellness exam", "general exam", "annual exam"],
  },
  {
    code: "Z00.129",
    description:
      "Encounter for routine child health examination without abnormal findings",
    synonyms: ["well child visit", "well child check", "routine child exam"],
  },
];
