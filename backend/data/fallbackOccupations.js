const fallbackOccupations = [
  // Software & IT
  { title: "Software Engineer", aliases: ["software developer", "programmer", "application developer"] },
  { title: "Software Developer", aliases: ["software engineer", "programmer"] },
  { title: "Frontend Developer", aliases: ["front end developer", "react developer", "web developer"] },
  { title: "Backend Developer", aliases: ["back end developer", "server developer"] },
  { title: "Full Stack Developer", aliases: ["fullstack developer", "web developer"] },
  { title: "Web Developer", aliases: ["website developer"] },
  { title: "Mobile App Developer", aliases: ["mobile developer", "app developer"] },
  { title: "iOS Developer", aliases: ["swift developer", "apple developer"] },
  { title: "Android Developer", aliases: ["kotlin developer", "mobile developer"] },
  { title: "Game Developer", aliases: ["game programmer", "unity developer", "unreal developer"] },
  { title: "Embedded Software Engineer", aliases: ["embedded developer", "firmware engineer"] },
  { title: "Firmware Engineer", aliases: ["embedded engineer"] },
  { title: "DevOps Engineer", aliases: ["devops", "platform engineer"] },
  { title: "Cloud Engineer", aliases: ["cloud developer", "cloud infrastructure engineer"] },
  { title: "Cloud Architect", aliases: ["cloud solutions architect"] },
  { title: "Site Reliability Engineer", aliases: ["sre", "reliability engineer"] },
  { title: "Systems Administrator", aliases: ["system administrator", "sysadmin"] },
  { title: "Network Engineer", aliases: ["network specialist"] },
  { title: "Network Administrator", aliases: ["network admin"] },
  { title: "Database Administrator", aliases: ["dba", "database admin"] },
  { title: "Database Developer", aliases: ["sql developer"] },
  { title: "IT Support Specialist", aliases: ["it support", "technical support", "help desk"] },
  { title: "IT Technician", aliases: ["computer technician"] },
  { title: "IT Manager", aliases: ["technology manager"] },
  { title: "IT Project Manager", aliases: ["technology project manager"] },
  { title: "Solutions Architect", aliases: ["solution architect", "technical architect"] },
  { title: "Enterprise Architect", aliases: ["enterprise technology architect"] },
  { title: "Software Architect", aliases: ["application architect"] },
  { title: "QA Engineer", aliases: ["quality assurance engineer", "software tester"] },
  { title: "Software Tester", aliases: ["qa tester", "quality assurance tester"] },
  { title: "Test Automation Engineer", aliases: ["automation tester", "qa automation"] },
  { title: "Technical Writer", aliases: ["documentation writer"] },

  // Cybersecurity
  { title: "Cybersecurity Analyst", aliases: ["cyber security analyst", "security analyst"] },
  { title: "Cybersecurity Engineer", aliases: ["security engineer"] },
  { title: "Security Consultant", aliases: ["cybersecurity consultant"] },
  { title: "Penetration Tester", aliases: ["ethical hacker", "pentester"] },
  { title: "Security Operations Analyst", aliases: ["soc analyst"] },
  { title: "Information Security Manager", aliases: ["security manager"] },
  { title: "Security Architect", aliases: ["cybersecurity architect"] },
  { title: "Digital Forensics Analyst", aliases: ["forensics analyst"] },

  // Data & AI
  { title: "Data Analyst", aliases: ["analytics analyst"] },
  { title: "Data Scientist", aliases: ["data science specialist"] },
  { title: "Data Engineer", aliases: ["big data engineer"] },
  { title: "Machine Learning Engineer", aliases: ["ml engineer"] },
  { title: "Artificial Intelligence Engineer", aliases: ["ai engineer"] },
  { title: "AI Researcher", aliases: ["artificial intelligence researcher"] },
  { title: "Business Intelligence Analyst", aliases: ["bi analyst", "power bi analyst"] },
  { title: "Business Intelligence Developer", aliases: ["bi developer"] },
  { title: "Data Architect", aliases: ["information architect"] },
  { title: "Statistician", aliases: ["statistics specialist"] },
  { title: "Quantitative Analyst", aliases: ["quant analyst"] },

  // Product & Design
  { title: "Product Manager", aliases: ["digital product manager"] },
  { title: "Product Owner", aliases: ["agile product owner"] },
  { title: "Technical Product Manager", aliases: ["technology product manager"] },
  { title: "UX Designer", aliases: ["user experience designer"] },
  { title: "UI Designer", aliases: ["user interface designer"] },
  { title: "UX/UI Designer", aliases: ["ui ux designer"] },
  { title: "UX Researcher", aliases: ["user researcher"] },
  { title: "Product Designer", aliases: ["digital product designer"] },
  { title: "Graphic Designer", aliases: ["visual designer"] },
  { title: "Web Designer", aliases: ["website designer"] },
  { title: "Interaction Designer", aliases: ["interaction design"] },

  // Business & Management
  { title: "Business Analyst", aliases: ["business systems analyst"] },
  { title: "Systems Analyst", aliases: ["computer systems analyst"] },
  { title: "Management Consultant", aliases: ["business consultant"] },
  { title: "Business Consultant", aliases: ["management consultant"] },
  { title: "Operations Manager", aliases: ["operations supervisor"] },
  { title: "Operations Analyst", aliases: ["business operations analyst"] },
  { title: "General Manager", aliases: ["business manager"] },
  { title: "Office Manager", aliases: ["administration manager"] },
  { title: "Administrative Assistant", aliases: ["admin assistant", "office assistant"] },
  { title: "Executive Assistant", aliases: ["personal assistant", "ea"] },
  { title: "Receptionist", aliases: ["front desk receptionist"] },
  { title: "Customer Service Representative", aliases: ["customer service officer"] },
  { title: "Customer Success Manager", aliases: ["client success manager"] },
  { title: "Account Manager", aliases: ["client account manager"] },
  { title: "Sales Manager", aliases: ["sales team manager"] },
  { title: "Sales Representative", aliases: ["sales consultant", "salesperson"] },
  { title: "Business Development Manager", aliases: ["bdm"] },
  { title: "Procurement Officer", aliases: ["purchasing officer"] },
  { title: "Procurement Manager", aliases: ["purchasing manager"] },
  { title: "Supply Chain Manager", aliases: ["supply chain specialist"] },
  { title: "Project Manager", aliases: ["project lead"] },
  { title: "Program Manager", aliases: ["programme manager"] },
  { title: "Scrum Master", aliases: ["agile scrum master"] },
  { title: "Agile Coach", aliases: ["agile consultant"] },

  // Marketing & Communications
  { title: "Marketing Manager", aliases: ["marketing lead"] },
  { title: "Marketing Specialist", aliases: ["marketing officer"] },
  { title: "Digital Marketing Specialist", aliases: ["digital marketer"] },
  { title: "Social Media Manager", aliases: ["social media specialist"] },
  { title: "Content Creator", aliases: ["digital content creator"] },
  { title: "Content Writer", aliases: ["content specialist"] },
  { title: "Copywriter", aliases: ["advertising writer"] },
  { title: "SEO Specialist", aliases: ["search engine optimisation specialist", "seo"] },
  { title: "SEM Specialist", aliases: ["paid search specialist"] },
  { title: "Communications Officer", aliases: ["communications specialist"] },
  { title: "Public Relations Specialist", aliases: ["pr specialist"] },
  { title: "Brand Manager", aliases: ["brand marketing manager"] },
  { title: "Market Research Analyst", aliases: ["market researcher"] },

  // Finance & Accounting
  { title: "Accountant", aliases: ["general accountant"] },
  { title: "Financial Accountant", aliases: ["finance accountant"] },
  { title: "Management Accountant", aliases: ["cost accountant"] },
  { title: "Tax Accountant", aliases: ["taxation accountant"] },
  { title: "Auditor", aliases: ["financial auditor"] },
  { title: "Bookkeeper", aliases: ["accounts clerk"] },
  { title: "Financial Analyst", aliases: ["finance analyst"] },
  { title: "Investment Analyst", aliases: ["investment research analyst"] },
  { title: "Financial Adviser", aliases: ["financial advisor"] },
  { title: "Financial Planner", aliases: ["financial adviser"] },
  { title: "Banking Consultant", aliases: ["bank consultant"] },
  { title: "Bank Teller", aliases: ["banking teller"] },
  { title: "Credit Analyst", aliases: ["credit officer"] },
  { title: "Risk Analyst", aliases: ["financial risk analyst"] },
  { title: "Insurance Broker", aliases: ["insurance adviser"] },
  { title: "Insurance Underwriter", aliases: ["underwriter"] },
  { title: "Payroll Officer", aliases: ["payroll specialist"] },
  { title: "Accounts Payable Officer", aliases: ["ap officer"] },
  { title: "Accounts Receivable Officer", aliases: ["ar officer"] },
  { title: "Mortgage Broker", aliases: ["home loan broker"] },

  // Human Resources
  { title: "Human Resources Manager", aliases: ["hr manager"] },
  { title: "Human Resources Adviser", aliases: ["hr advisor", "hr adviser"] },
  { title: "Human Resources Coordinator", aliases: ["hr coordinator"] },
  { title: "Recruiter", aliases: ["recruitment consultant"] },
  { title: "Talent Acquisition Specialist", aliases: ["talent acquisition", "recruiter"] },
  { title: "Learning and Development Specialist", aliases: ["training specialist"] },
  { title: "Workplace Relations Adviser", aliases: ["employee relations adviser"] },

  // Engineering
  { title: "Civil Engineer", aliases: ["civil engineering"] },
  { title: "Mechanical Engineer", aliases: ["mechanical engineering"] },
  { title: "Electrical Engineer", aliases: ["electrical engineering"] },
  { title: "Electronics Engineer", aliases: ["electronic engineer"] },
  { title: "Chemical Engineer", aliases: ["chemical engineering"] },
  { title: "Structural Engineer", aliases: ["structural engineering"] },
  { title: "Environmental Engineer", aliases: ["environmental engineering"] },
  { title: "Biomedical Engineer", aliases: ["medical engineer"] },
  { title: "Industrial Engineer", aliases: ["industrial engineering"] },
  { title: "Mining Engineer", aliases: ["mining engineering"] },
  { title: "Petroleum Engineer", aliases: ["oil and gas engineer"] },
  { title: "Aerospace Engineer", aliases: ["aeronautical engineer"] },
  { title: "Mechatronics Engineer", aliases: ["mechatronic engineer"] },
  { title: "Robotics Engineer", aliases: ["robotics specialist"] },
  { title: "Engineering Technician", aliases: ["engineering technologist"] },
  { title: "Project Engineer", aliases: ["engineering project manager"] },

  // Construction & Trades
  { title: "Construction Manager", aliases: ["building manager", "site manager"] },
  { title: "Site Supervisor", aliases: ["construction supervisor"] },
  { title: "Quantity Surveyor", aliases: ["construction cost estimator"] },
  { title: "Building Surveyor", aliases: ["building inspector"] },
  { title: "Architect", aliases: ["building architect"] },
  { title: "Draftsperson", aliases: ["drafter", "cad drafter"] },
  { title: "Electrician", aliases: ["electrical tradesperson"] },
  { title: "Plumber", aliases: ["plumbing tradesperson"] },
  { title: "Carpenter", aliases: ["carpentry tradesperson"] },
  { title: "Welder", aliases: ["welding tradesperson"] },
  { title: "Boilermaker", aliases: ["metal fabricator"] },
  { title: "Fitter and Turner", aliases: ["mechanical fitter"] },
  { title: "Automotive Mechanic", aliases: ["motor mechanic", "car mechanic"] },
  { title: "Diesel Mechanic", aliases: ["diesel technician"] },
  { title: "Painter", aliases: ["house painter"] },
  { title: "Bricklayer", aliases: ["brick mason"] },
  { title: "Tiler", aliases: ["wall and floor tiler"] },
  { title: "Landscaper", aliases: ["landscape gardener"] },

  // Healthcare
  { title: "General Practitioner", aliases: ["gp", "doctor"] },
  { title: "Medical Doctor", aliases: ["doctor", "physician"] },
  { title: "Registered Nurse", aliases: ["nurse", "rn"] },
  { title: "Enrolled Nurse", aliases: ["nurse"] },
  { title: "Midwife", aliases: ["registered midwife"] },
  { title: "Paramedic", aliases: ["ambulance paramedic"] },
  { title: "Pharmacist", aliases: ["community pharmacist"] },
  { title: "Physiotherapist", aliases: ["physical therapist"] },
  { title: "Occupational Therapist", aliases: ["ot"] },
  { title: "Psychologist", aliases: ["clinical psychologist"] },
  { title: "Counsellor", aliases: ["counselor"] },
  { title: "Social Worker", aliases: ["community social worker"] },
  { title: "Dentist", aliases: ["dental practitioner"] },
  { title: "Dental Assistant", aliases: ["dental nurse"] },
  { title: "Dietitian", aliases: ["dietician"] },
  { title: "Nutritionist", aliases: ["nutrition specialist"] },
  { title: "Radiographer", aliases: ["medical imaging technologist"] },
  { title: "Medical Laboratory Scientist", aliases: ["laboratory scientist"] },
  { title: "Speech Pathologist", aliases: ["speech therapist"] },
  { title: "Optometrist", aliases: ["eye care specialist"] },
  { title: "Veterinarian", aliases: ["vet", "veterinary doctor"] },
  { title: "Veterinary Nurse", aliases: ["vet nurse"] },
  { title: "Aged Care Worker", aliases: ["aged care assistant", "personal care worker"] },
  { title: "Disability Support Worker", aliases: ["support worker"] },
  { title: "Mental Health Worker", aliases: ["mental health support worker"] },

  // Education
  { title: "Primary School Teacher", aliases: ["primary teacher", "elementary teacher"] },
  { title: "Secondary School Teacher", aliases: ["high school teacher", "secondary teacher"] },
  { title: "Early Childhood Teacher", aliases: ["kindergarten teacher", "preschool teacher"] },
  { title: "University Lecturer", aliases: ["lecturer", "academic"] },
  { title: "Tutor", aliases: ["private tutor", "academic tutor"] },
  { title: "Teacher Aide", aliases: ["teacher assistant", "education assistant"] },
  { title: "School Principal", aliases: ["principal", "head teacher"] },
  { title: "Instructional Designer", aliases: ["learning designer"] },

  // Legal & Government
  { title: "Lawyer", aliases: ["solicitor", "legal practitioner"] },
  { title: "Solicitor", aliases: ["lawyer"] },
  { title: "Barrister", aliases: ["lawyer", "counsel"] },
  { title: "Paralegal", aliases: ["legal assistant"] },
  { title: "Legal Secretary", aliases: ["legal administrative assistant"] },
  { title: "Compliance Officer", aliases: ["compliance specialist"] },
  { title: "Policy Adviser", aliases: ["policy advisor", "policy analyst"] },
  { title: "Policy Analyst", aliases: ["government policy analyst"] },
  { title: "Government Administration Officer", aliases: ["public servant"] },
  { title: "Police Officer", aliases: ["police constable"] },
  { title: "Firefighter", aliases: ["fire fighter"] },

  // Science
  { title: "Research Scientist", aliases: ["scientist", "researcher"] },
  { title: "Biologist", aliases: ["biological scientist"] },
  { title: "Chemist", aliases: ["chemical scientist"] },
  { title: "Physicist", aliases: ["physics scientist"] },
  { title: "Environmental Scientist", aliases: ["environment scientist"] },
  { title: "Laboratory Technician", aliases: ["lab technician"] },
  { title: "Microbiologist", aliases: ["microbiology scientist"] },
  { title: "Geologist", aliases: ["geoscientist"] },
  { title: "Marine Biologist", aliases: ["marine scientist"] },
  { title: "Food Scientist", aliases: ["food technologist"] },

  // Hospitality & Retail
  { title: "Chef", aliases: ["head chef"] },
  { title: "Cook", aliases: ["kitchen cook"] },
  { title: "Restaurant Manager", aliases: ["hospitality manager"] },
  { title: "Cafe Manager", aliases: ["cafe supervisor"] },
  { title: "Barista", aliases: ["coffee maker"] },
  { title: "Bartender", aliases: ["bar attendant"] },
  { title: "Waiter", aliases: ["waitress", "wait staff"] },
  { title: "Hotel Manager", aliases: ["accommodation manager"] },
  { title: "Hotel Receptionist", aliases: ["front desk agent"] },
  { title: "Retail Manager", aliases: ["store manager"] },
  { title: "Retail Sales Assistant", aliases: ["sales assistant", "shop assistant"] },
  { title: "Cashier", aliases: ["checkout operator"] },
  { title: "Bottle Shop Attendant", aliases: ["liquor store attendant"] },

  // Logistics & Transport
  { title: "Truck Driver", aliases: ["heavy vehicle driver"] },
  { title: "Delivery Driver", aliases: ["courier driver"] },
  { title: "Bus Driver", aliases: ["coach driver"] },
  { title: "Train Driver", aliases: ["locomotive driver"] },
  { title: "Warehouse Worker", aliases: ["warehouse assistant"] },
  { title: "Warehouse Manager", aliases: ["distribution centre manager"] },
  { title: "Forklift Operator", aliases: ["forklift driver"] },
  { title: "Logistics Coordinator", aliases: ["logistics officer"] },
  { title: "Logistics Manager", aliases: ["transport logistics manager"] },
  { title: "Supply Chain Analyst", aliases: ["supply chain specialist"] },
  { title: "Pilot", aliases: ["airline pilot", "aircraft pilot"] },
  { title: "Flight Attendant", aliases: ["cabin crew"] },
  { title: "Courier", aliases: ["delivery courier"] },

  // Creative & Media
  { title: "Photographer", aliases: ["commercial photographer"] },
  { title: "Videographer", aliases: ["video producer"] },
  { title: "Video Editor", aliases: ["film editor"] },
  { title: "Animator", aliases: ["3d animator", "2d animator"] },
  { title: "Journalist", aliases: ["reporter"] },
  { title: "Editor", aliases: ["content editor"] },
  { title: "Film Producer", aliases: ["movie producer"] },
  { title: "Film Director", aliases: ["movie director"] },
  { title: "Sound Engineer", aliases: ["audio engineer"] },
  { title: "Musician", aliases: ["professional musician"] },

  // Property
  { title: "Real Estate Agent", aliases: ["property agent", "real estate salesperson"] },
  { title: "Property Manager", aliases: ["real estate property manager"] },
  { title: "Property Valuer", aliases: ["property appraiser"] },

  // Community & Personal Services
  { title: "Community Services Worker", aliases: ["community worker"] },
  { title: "Youth Worker", aliases: ["youth support worker"] },
  { title: "Childcare Worker", aliases: ["child care worker", "early childhood educator"] },
  { title: "Fitness Trainer", aliases: ["personal trainer", "fitness instructor"] },
  { title: "Personal Trainer", aliases: ["fitness trainer"] },
  { title: "Hairdresser", aliases: ["hair stylist"] },
  { title: "Beauty Therapist", aliases: ["beautician"] },

  // Agriculture & Environment
  { title: "Farmer", aliases: ["farm manager"] },
  { title: "Farm Worker", aliases: ["farm hand"] },
  { title: "Agricultural Scientist", aliases: ["agriculture scientist"] },
  { title: "Agronomist", aliases: ["crop scientist"] },
  { title: "Horticulturist", aliases: ["horticulture specialist"] },
  { title: "Park Ranger", aliases: ["ranger"] }
];

function scoreOccupation(occupation, query) {
  const q = query.toLowerCase().trim();
  const title = occupation.title.toLowerCase();
  const aliases = (occupation.aliases || []).map((alias) =>
    alias.toLowerCase()
  );

  if (title === q || aliases.includes(q)) {
    return 0;
  }

  if (
    title.startsWith(q) ||
    aliases.some((alias) => alias.startsWith(q))
  ) {
    return 1;
  }

  const titleWords = title.split(/\s+/);
  const aliasWords = aliases.flatMap((alias) => alias.split(/\s+/));

  if (
    titleWords.some((word) => word.startsWith(q)) ||
    aliasWords.some((word) => word.startsWith(q))
  ) {
    return 2;
  }

  if (
    title.includes(q) ||
    aliases.some((alias) => alias.includes(q))
  ) {
    return 3;
  }

  return null;
}

function searchFallbackOccupations(query, limit = 8) {
  const q = String(query || "").trim().toLowerCase();

  if (q.length < 2) {
    return [];
  }

  return fallbackOccupations
    .map((occupation) => ({
      occupation,
      score: scoreOccupation(occupation, q),
    }))
    .filter((item) => item.score !== null)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }

      return (
        a.occupation.title.length -
        b.occupation.title.length
      );
    })
    .slice(0, limit)
    .map(({ occupation }) => ({
      title: occupation.title,
      uri: `fallback:${occupation.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      description: "Local fallback occupation",
    }));
}

module.exports = {
  fallbackOccupations,
  searchFallbackOccupations,
};
