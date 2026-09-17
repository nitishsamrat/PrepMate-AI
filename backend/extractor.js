function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/*
  --------------------------------------------------
  NAME
  --------------------------------------------------
*/

function extractGraduationName(text) {
  const cleaned = cleanText(text);

  const match = cleaned.match(
    /(?:^|\n)\s*(?:NAME|STUDENT\s*NAME|CANDIDATE\s*NAME)\s*[:\-]?\s*([A-Za-z][A-Za-z .']*?)(?=\s+(?:ROLL\s*NO|ROLL\s*NUMBER|REGISTRATION|REGISTRATION\s*NO|ENROLLMENT|PROGRAM|COURSE|FATHER|MOTHER)|\n|$)/i
  );

  if (match) {
    return match[1]
      .replace(/\s+/g, " ")
      .trim();
  }

  return null;
}

function extractResumeName(text) {
  const cleaned = cleanText(text);

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ignoredLines = [
    "resume",
    "curriculum vitae",
    "cv",
    "profile",
    "education",
    "skills",
    "projects",
    "experience",
    "contact",
    "summary",
  ];

  for (const line of lines.slice(0, 12)) {
    const lower = line.toLowerCase();

    if (ignoredLines.includes(lower)) {
      continue;
    }

    if (line.includes("@")) {
      continue;
    }

    if (/https?:\/\//i.test(line)) {
      continue;
    }

    if (/\d{7,}/.test(line)) {
      continue;
    }

    if (
      /^[A-Za-z][A-Za-z .']{2,60}$/.test(line)
    ) {
      return line
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return null;
}

/*
  --------------------------------------------------
  DEGREE / COURSE
  --------------------------------------------------
*/

function cleanDegree(value) {
  if (!value) return null;

  return value
    .replace(/\s+/g, " ")
    .replace(
      /\s+(?:COLLEGE\s*\/\s*INSTITUTION|COLLEGE|INSTITUTION)\s*:/i,
      ""
    )
    .trim();
}

function extractGraduationDegree(text) {
  const cleaned = cleanText(text);

  /*
    Primary source:

    PROGRAM: BACHELOR OF TECHNOLOGY IN
    COMPUTER SCIENCE & ENGINEERING

    Stop before the next document field.
  */

  const programMatch = cleaned.match(
    /(?:PROGRAM|COURSE|DEGREE)\s*[:\-]\s*([\s\S]*?)(?=\s+(?:COLLEGE\s*\/\s*INSTITUTION|COLLEGE|INSTITUTION|ROLL\s*NO|REGISTRATION|SEMESTER|EXAMINATION|SGPA|CGPA|TOTAL)|\n\s*(?:COLLEGE\s*\/\s*INSTITUTION|COLLEGE|INSTITUTION|ROLL\s*NO|REGISTRATION|SEMESTER|EXAMINATION|SGPA|CGPA|TOTAL)|$)/i
  );

  if (programMatch) {
    const degree = cleanDegree(
      programMatch[1]
    );

    if (
      degree &&
      /bachelor|master|b\.?\s*tech|m\.?\s*tech|b\.?\s*e|m\.?\s*e/i.test(
        degree
      )
    ) {
      return degree;
    }
  }

  /*
    Fallback:
    Find only the actual degree phrase.
  */

  const degreePatterns = [
    /\bBACHELOR\s+OF\s+TECHNOLOGY(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+ENGINEERING(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+SCIENCE(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+COMPUTER\s+APPLICATIONS\b/i,

    /\bB\.?\s*TECH\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*E\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*SC\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*C\.?\s*A\.?\b/i,

    /\bMASTER\s+OF\s+TECHNOLOGY(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+ENGINEERING(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+SCIENCE(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+COMPUTER\s+APPLICATIONS\b/i,

    /\bM\.?\s*TECH\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,
  ];

  for (const pattern of degreePatterns) {
    const match = cleaned.match(pattern);

    if (match) {
      return cleanDegree(match[0]);
    }
  }

  return null;
}

function extractResumeDegree(text) {
  const cleaned = cleanText(text);

  /*
    Find Education section.
  */

  const educationMatch = cleaned.match(
    /(?:^|\n)\s*EDUCATION\s*(?:\n|$)([\s\S]*?)(?=\n\s*(?:SKILLS|PROJECTS|EXPERIENCE|PROFILE|CERTIFICATIONS|ACHIEVEMENTS|CONTACT|TECHNICAL\s+SKILLS)\s*(?:\n|$)|$)/i
  );

  const educationText =
    educationMatch
      ? educationMatch[1]
      : cleaned;

  const degreePatterns = [
    /\bBACHELOR\s+OF\s+TECHNOLOGY(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+ENGINEERING(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+SCIENCE(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bBACHELOR\s+OF\s+COMPUTER\s+APPLICATIONS\b/i,

    /\bB\.?\s*TECH\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*E\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*SC\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bB\.?\s*C\.?\s*A\.?\b/i,

    /\bMASTER\s+OF\s+TECHNOLOGY(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+ENGINEERING(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+SCIENCE(?:\s+IN\s+[A-Za-z&., ]+)?/i,

    /\bMASTER\s+OF\s+COMPUTER\s+APPLICATIONS\b/i,

    /\bM\.?\s*TECH\.?(?:\s+IN\s+[A-Za-z&., ]+)?/i,
  ];

  for (const pattern of degreePatterns) {
    const match =
      educationText.match(pattern);

    if (match) {
      return cleanDegree(match[0]);
    }
  }

  return null;
}

/*
  --------------------------------------------------
  UNIVERSITY / COLLEGE
  --------------------------------------------------
*/

function extractGraduationInstitution(text) {
  const cleaned = cleanText(text);

  /*
    Specific MAKAUT pattern.
  */

  const makautMatch = cleaned.match(
    /MAULANA\s+ABUL\s+KALAM\s+AZAD\s+UNIVERSITY\s+OF\s+TECHNOLOGY(?:\s*,?\s*WEST\s+BENGAL)?/i
  );

  if (makautMatch) {
    return makautMatch[0]
      .replace(/\s+/g, " ")
      .trim();
  }

  /*
    Otherwise inspect individual lines.
  */

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      /\bUNIVERSITY\b/i.test(line) &&
      !/EXAMINATION|EXAM|RESULT|SEMESTER|GRADE\s*CARD/i.test(
        line
      )
    ) {
      return line
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return null;
}

function extractResumeInstitution(text) {
  const cleaned = cleanText(text);

  /*
    Restrict extraction to Education section.
  */

  const educationMatch = cleaned.match(
    /(?:^|\n)\s*EDUCATION\s*(?:\n|$)([\s\S]*?)(?=\n\s*(?:SKILLS|PROJECTS|EXPERIENCE|PROFILE|CERTIFICATIONS|ACHIEVEMENTS|CONTACT|TECHNICAL\s+SKILLS)\s*(?:\n|$)|$)/i
  );

  const educationText =
    educationMatch
      ? educationMatch[1]
      : cleaned;

  /*
    MAKAUT can appear in different forms.
  */

  const makautMatch =
    educationText.match(
      /MAULANA\s+ABUL\s+KALAM\s+AZAD\s+UNIVERSITY\s+OF\s+TECHNOLOGY(?:\s*,?\s*(?:WEST\s+BENGAL|KOLKATA|INDIA|WEST\s+BENGAL\s*,?\s*KOLKATA\s*,?\s*INDIA)*)?/i
    );

  if (makautMatch) {
    return makautMatch[0]
      .replace(/\s+/g, " ")
      .trim();
  }

  const lines = educationText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      /\bUNIVERSITY\b|\bCOLLEGE\b/i.test(
        line
      )
    ) {
      return line
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  return null;
}

/*
  --------------------------------------------------
  GRADUATION YEAR
  --------------------------------------------------
*/

function extractGraduationYear(text) {
  const cleaned = cleanText(text);

  /*
    IMPORTANT:

    If the document only says:

    THIRD YEAR SECOND SEMESTER
    EXAMINATION OF 2025-26

    this is an academic/examination session,
    NOT necessarily the graduation year.

    Therefore we do not return 2025-26 as the
    graduation year.
  */

  const explicitGraduationYear = cleaned.match(
    /(?:YEAR\s+OF\s+PASSING|PASSING\s+YEAR|GRADUATION\s+YEAR|YEAR\s+OF\s+GRADUATION|YEAR\s+OF\s+COMPLETION)\s*[:\-]?\s*((?:19|20)\d{2})/i
  );

  if (explicitGraduationYear) {
    return explicitGraduationYear[1];
  }

  /*
    Look for a clearly stated completion year.
  */

  const completionYear = cleaned.match(
    /(?:COMPLETED|COMPLETION|GRADUATED|GRADUATION)[\s\S]{0,50}?\b((?:19|20)\d{2})\b/i
  );

  if (completionYear) {
    return completionYear[1];
  }

  /*
    Do NOT use an academic session such as 2025-26
    as graduation year.
  */

  return null;
}

function extractResumeGraduationYear(text) {
  const cleaned = cleanText(text);

  /*
    Find Education section.
  */

  const educationMatch = cleaned.match(
    /(?:^|\n)\s*EDUCATION\s*(?:\n|$)([\s\S]*?)(?=\n\s*(?:SKILLS|PROJECTS|EXPERIENCE|PROFILE|CERTIFICATIONS|ACHIEVEMENTS|CONTACT|TECHNICAL\s+SKILLS)\s*(?:\n|$)|$)/i
  );

  const educationText =
    educationMatch
      ? educationMatch[1]
      : cleaned;

  /*
    Standard resume format:

    2023 - 2027
    2023 – 2027
  */

  const yearRange = educationText.match(
    /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2})\b/
  );

  if (yearRange) {
    return yearRange[2];
  }

  /*
    Also support:

    2023 to 2027
  */

  const toRange = educationText.match(
    /\b((?:19|20)\d{2})\s+to\s+((?:19|20)\d{2})\b/i
  );

  if (toRange) {
    return toRange[2];
  }

  return null;
}

/*
  --------------------------------------------------
  MAIN EXTRACTION
  --------------------------------------------------
*/

function extractInformation(
  text,
  documentType
) {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return {
      name: null,
      degree: null,
      institution: null,
      graduationYear: null,
    };
  }

  if (documentType === "graduation") {
    return {
      name:
        extractGraduationName(cleaned),

      degree:
        extractGraduationDegree(cleaned),

      institution:
        extractGraduationInstitution(cleaned),

      graduationYear:
        extractGraduationYear(cleaned),
    };
  }

  if (documentType === "resume") {
    return {
      name:
        extractResumeName(cleaned),

      degree:
        extractResumeDegree(cleaned),

      institution:
        extractResumeInstitution(cleaned),

      graduationYear:
        extractResumeGraduationYear(
          cleaned
        ),
    };
  }

  return {
    name: null,
    degree: null,
    institution: null,
    graduationYear: null,
  };
}

export {
  extractInformation,
};