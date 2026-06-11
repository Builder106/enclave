// Identity pools for synthetic documents. All names, payers, clinics, and
// NPIs are fictional; payers deliberately avoid real insurer names.

export const FIRST_NAMES: readonly string[] = [
  "James", "Mary", "Robert", "Patricia", "Michael", "Linda", "David",
  "Jennifer", "William", "Elizabeth", "Sarah", "Daniel", "Emily", "Joshua",
  "Chinedu", "Ngozi", "Adebayo", "Yetunde", "Emeka", "Folake", "Tunde",
  "Amara", "Ifeoma", "Olusegun", "Chiamaka", "Kelechi", "Temitope",
  "Santiago", "Valentina", "Mateo", "Camila", "Alejandro", "Lucia", "Diego",
  "Mariana", "Carlos", "Sofia", "Javier", "Gabriela", "Andres",
];

export const LAST_NAMES: readonly string[] = [
  "Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson",
  "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Clark", "Lewis",
  "Okafor", "Adeyemi", "Balogun", "Eze", "Nwosu", "Okonkwo", "Adebisi",
  "Chukwu", "Ogunleye", "Afolabi", "Onyeka", "Obi", "Lawal",
  "Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Mendoza",
];

export const PAYER_NAMES: readonly string[] = [
  "Meridian Health Plan",
  "Atlas Mutual",
  "Cascade Benefit Group",
  "Pinnacle Family Health",
  "Harborstone Assurance",
  "Northwind Health Partners",
  "Solstice Care Network",
  "Granite Peak Mutual",
];

export interface ProviderIdentity {
  name: string;
  /** 10-digit NPI; fictional but format-plausible (leading 1 or 2) */
  npi: string;
}

export const PROVIDER_POOL: readonly ProviderIdentity[] = [
  { name: "Olufemi Adesanya, MD", npi: "1740283915" },
  { name: "Rachel Whitfield, MD", npi: "1295637408" },
  { name: "Marcus Delgado, DO", npi: "1487026531" },
  { name: "Adaeze Nwachukwu, MD", npi: "1638572904" },
  { name: "Catherine Boyle, NP", npi: "2057194863" },
  { name: "Hector Villanueva, MD", npi: "1873460259" },
  { name: "Funmilayo Bankole, DO", npi: "1526948370" },
  { name: "Steven Krauss, MD", npi: "1964031827" },
  { name: "Pilar Cifuentes, NP", npi: "2148605793" },
  { name: "Tobias Engel, MD", npi: "1309857246" },
  { name: "Amaka Iwuoha, MD", npi: "1675309482" },
  { name: "Daniela Roca, DO", npi: "2086153749" },
];

/** Letterhead blocks rendered verbatim at the top of a document. */
export const CLINIC_LETTERHEADS: ReadonlyArray<readonly string[]> = [
  [
    "==================================================",
    "          LAKESIDE FAMILY MEDICINE",
    "   412 Harborview Avenue, Suite 200",
    "   Norfolk, VA 23510  |  (757) 555-0142",
    "==================================================",
  ],
  [
    "**************************************************",
    "        CEDAR GROVE MEDICAL ASSOCIATES",
    "   1180 Sycamore Road, Building C",
    "   Akron, OH 44313  |  (330) 555-0177",
    "**************************************************",
  ],
  [
    "BRIGHT HARBOR PRIMARY CARE",
    "27 Quayside Lane, Floor 3",
    "Portland, ME 04101 | (207) 555-0119",
    "--------------------------------------------------",
  ],
  [
    "--------------------------------------------------",
    "      SAGUARO VALLEY HEALTH CLINIC",
    "   5502 Ocotillo Drive",
    "   Tucson, AZ 85712  |  (520) 555-0163",
    "--------------------------------------------------",
  ],
  [
    "==================================================",
    "   WILLOW CREEK COMMUNITY PRACTICE",
    "   934 Mill Pond Way, Suite 12",
    "   Decatur, GA 30030  |  (404) 555-0185",
    "==================================================",
  ],
];
