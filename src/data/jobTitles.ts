/**
 * jobTitles.ts
 *
 * A highly comprehensive catalog of 1000+ professional job titles covering
 * multiple industries including Tech, Design, Healthcare, Finance, Management,
 * Education, Legal, Hospitality, Construction, Writing, Operations, and Sales.
 *
 * It combines specific stand-alone titles with programmatically generated
 * career level variations (Junior, Senior, Lead, Principal, Associate) to ensure
 * exhaustive public search coverage.
 */

// 1. Stand-alone specific titles (e.g. Doctor, Chef, Judge - usually don't take "Junior/Senior" prefixes directly)
const STANDALONE_TITLES = [
  "Physician",
  "Pediatrician",
  "Surgeon",
  "Anesthesiologist",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Oncologist",
  "Psychiatrist",
  "Dentist",
  "Dental Hygienist",
  "Dental Assistant",
  "Pharmacist",
  "Pharmacy Technician",
  "Optometrist",
  "Veterinarian",
  "Veterinary Technician",
  "Chiropractor",
  "Nutritionist",
  "Dietitian",
  "Psychologist",
  "Clinical Psychologist",
  "Therapist",
  "Mental Health Counselor",
  "Caregiver",
  "Home Health Aide",
  "Paramedic",
  "EMT (Emergency Medical Technician)",
  "Registered Nurse",
  "Nurse Practitioner",
  "Licensed Practical Nurse",
  "Clinical Nurse Specialist",
  "Medical Assistant",
  "Chief Executive Officer (CEO)",
  "Chief Technology Officer (CTO)",
  "Chief Financial Officer (CFO)",
  "Chief Operating Officer (COO)",
  "Chief Marketing Officer (CMO)",
  "Chief Information Officer (CIO)",
  "Chief Product Officer (CPO)",
  "Chef",
  "Sous Chef",
  "Line Cook",
  "Pastry Chef",
  "Waiter",
  "Waitress",
  "Server",
  "Bartender",
  "Barista",
  "Hotel Manager",
  "Front Desk Agent",
  "Flight Attendant",
  "Pilot",
  "Travel Agent",
  "Tour Guide",
  "Housekeeper",
  "Nanny",
  "Babysitter",
  "Lawyer",
  "Attorney",
  "Paralegal",
  "Legal Counsel",
  "Judge",
  "Police Officer",
  "Detective",
  "Security Guard",
  "Teacher",
  "Elementary School Teacher",
  "High School Teacher",
  "Special Education Teacher",
  "Preschool Teacher",
  "Professor",
  "Lecturer",
  "Tutor",
  "Librarian",
  "Academic Advisor",
  "School Counselor",
  "Real Estate Agent",
  "Real Estate Broker",
  "Leasing Consultant",
  "Foreman",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mechanic",
  "HVAC Technician",
  "Welder",
  "Painter",
  "Mason",
  "Roofer",
  "Truck Driver",
  "Delivery Driver",
  "Dispatcher",
  "Receptionist",
  "Data Entry Clerk",
  "Virtual Assistant",
  "Personal Trainer",
  "Yoga Instructor",
  "Fitness Coach",
  "Athlete",
  "Sports Coach",
  "Actor",
  "Musician",
  "Singer",
  "Model",
  "Journalist",
  "Editor",
  "Translator",
  "Interpreter",
  "Social Worker",
  "Counselor",
  "Volunteer Coordinator"
];

// 2. Base corporate, tech, design, marketing and analyst roles that accept standard prefixes
const PREFIXABLE_TITLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Cloud Architect",
  "Cloud Engineer",
  "Systems Administrator",
  "Network Engineer",
  "Database Administrator",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Machine Learning Engineer",
  "Deep Learning Specialist",
  "AI Engineer",
  "NLP Engineer",
  "Computer Vision Engineer",
  "Cybersecurity Analyst",
  "Cybersecurity Engineer",
  "Information Security Officer",
  "QA Engineer",
  "QA Analyst",
  "Automation Tester",
  "Embedded Systems Engineer",
  "Game Developer",
  "Web Developer",
  "WordPress Developer",
  "Shopify Developer",
  "Salesforce Developer",
  "Blockchain Developer",
  "Solution Architect",
  "Enterprise Architect",
  "IT Support Specialist",
  "Help Desk Technician",
  "Scrum Master",
  "Agile Coach",
  "UI/UX Designer",
  "User Experience Researcher",
  "Product Designer",
  "Interaction Designer",
  "Graphic Designer",
  "Brand Identity Designer",
  "Motion Designer",
  "Illustrator",
  "Concept Artist",
  "3D Artist",
  "3D Modeler",
  "Animator",
  "VFX Artist",
  "Web Designer",
  "Art Director",
  "Creative Director",
  "Fashion Designer",
  "Interior Designer",
  "Architect",
  "Landscape Architect",
  "Industrial Designer",
  "Photographer",
  "Video Editor",
  "Sound Designer",
  "Audio Engineer",
  "Product Manager",
  "Associate Product Manager",
  "Technical Product Manager",
  "Project Manager",
  "Program Manager",
  "Portfolio Manager",
  "Operations Manager",
  "General Manager",
  "Business Analyst",
  "Systems Analyst",
  "Financial Analyst",
  "Investment Banker",
  "Portfolio Analyst",
  "Risk Analyst",
  "Accountant",
  "Auditor",
  "Tax Consultant",
  "Bookkeeper",
  "Office Manager",
  "HR Manager",
  "HR Specialist",
  "Human Resources Generalist",
  "Recruiter",
  "Talent Acquisition Specialist",
  "HR Coordinator",
  "Marketing Manager",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "SEM Specialist",
  "Content Marketing Manager",
  "Social Media Manager",
  "Social Media Specialist",
  "Brand Manager",
  "Public Relations Specialist",
  "Communications Manager",
  "Copywriter",
  "Content Writer",
  "Technical Writer",
  "Sales Representative",
  "Account Executive",
  "Business Development Manager",
  "Sales Manager",
  "Sales Associate",
  "Retail Store Manager",
  "Customer Success Manager",
  "Customer Support Agent",
  "Customer Service Representative",
  "Technical Support Engineer",
  "Event Planner",
  "Event Coordinator",
  "Civil Engineer",
  "Structural Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Chemical Engineer",
  "Biomedical Engineer",
  "Environmental Engineer",
  "Industrial Engineer",
  "Construction Project Manager",
  "Logistics Coordinator",
  "Supply Chain Manager",
  "Warehouse Manager",
  "Inventory Specialist",
  "Executive Assistant",
  "Administrative Assistant",
  "Office Assistant"
];

// 3. Career prefixes to generate professional level job titles
const PREFIXES = ["Junior", "Senior", "Lead", "Principal", "Associate", "Staff", "Director of"];

// 4. Generate the full dynamic list of 1000+ unique job titles
const generateJobTitles = (): string[] => {
  const titlesSet = new Set<string>();

  // Add all standalone titles
  STANDALONE_TITLES.forEach(t => titlesSet.add(t));

  // Add base prefixable titles as they are
  PREFIXABLE_TITLES.forEach(t => titlesSet.add(t));

  // Add prefix variations for the prefixable titles
  PREFIXABLE_TITLES.forEach(title => {
    PREFIXES.forEach(prefix => {
      // e.g. "Senior Software Engineer" or "Director of Engineering" or "Lead UI/UX Designer"
      if (prefix === "Director of") {
        // Adapt format for "Director of" prefixes
        if (title.endsWith("Engineer")) {
          titlesSet.add(`Director of Engineering`);
        } else if (title.endsWith("Designer")) {
          titlesSet.add(`Director of Design`);
        } else if (title.endsWith("Manager")) {
          titlesSet.add(`Director of Product`);
        } else {
          titlesSet.add(`Director of ${title}`);
        }
      } else {
        titlesSet.add(`${prefix} ${title}`);
      }
    });
  });

  // Convert to array, sort alphabetically, and return
  return Array.from(titlesSet).sort();
};

export const SUGGESTED_JOB_TITLES: string[] = generateJobTitles();
