function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// NAME

function normalizeName(name) {
  if (!name) return "";

  return name
    .toUpperCase()
    .replace(
      /\b(?:OF|S\/O|D\/O|F\/O|C\/O)\b.*$/i,
      ""
    )
    .replace(/[^A-Z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidName(name) {
  if (!name) return false;

  const words = name.split(" ");

  if (words.length < 2 || words.length > 5) {
    return false;
  }

  if (name.length < 5 || name.length > 60) {
    return false;
  }

  const blockedWords = [
    "RESUME",
    "CURRICULUM",
    "VITAE",
    "PROFILE",
    "EDUCATION",
    "CONTACT",
    "OBJECTIVE",
    "SKILLS",
    "EXPERIENCE",
  ];

  return !words.some((word) =>
    blockedWords.includes(word)
  );
}

function extractName(text, documentType) {
  const cleaned = cleanText(text);

  // MARKSHEET
  

  if (documentType !== "resume") {
    const patterns = [
      /(?:student\s*name|candidate\s*name|name\s*of\s*(?:the\s*)?student)\s*[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i,

      /\bname\s*[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i,
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);

      if (match) {
        const name = normalizeName(match[1]);

        if (isValidName(name)) {
          return name;
        }
      }
    }

    return null;
  }

  // RESUME
  
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 15)) {
    const match = line.match(
      /^(?:name|candidate\s*name|full\s*name)\s*[:\-]?\s*(.+)$/i
    );

    if (match) {
      const name = normalizeName(match[1]);

      if (isValidName(name)) {
        return name;
      }
    }
  }

  for (const line of lines.slice(0, 8)) {
    const name = normalizeName(line);

    if (isValidName(name)) {
      return name;
    }
  }

  return null;
}


// CLASS X / XII PERCENTAGE


function isValidPercentage(value) {
  return (
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}


function extractPercentage(
  text,
  documentType
) {
  const cleaned = cleanText(text);

  // Resume
  

  if (documentType === "resume") {
    return extractResumePercentage(cleaned);
  }

  // 10th / ICSE
 

  if (documentType === "10th") {
    return extractICSEPercentage(cleaned);
  }
  // 12th / ISC

  if (documentType === "12th") {
    return extractISCPercentage(cleaned);
  }

  // Graduation


  if (documentType === "graduation") {
    return extractGraduationPercentage(cleaned);
  }

  return null;
}

// ICSE CLASS X


function extractICSEPercentage(text) {
  const subjectMarks =
    extractICSESubjectMarks(text);

  console.log(
    "ICSE subject marks found:",
    subjectMarks
  );

  if (subjectMarks.length < 5) {
    return null;
  }

  const filteredMarks = subjectMarks.filter(
    (mark) => mark !== 33
  );

  if (filteredMarks.length < 5) {
    return null;
  }

  /* ICSE percentage is calculated using the best five subjects.*/

  const bestFive = [...filteredMarks]
    .sort((a, b) => b - a)
    .slice(0, 5);

  const total = bestFive.reduce(
    (sum, mark) => sum + mark,
    0
  );

  const percentage =
    (total / 500) * 100;

  return Number(
    percentage.toFixed(2)
  );
}


function extractICSESubjectMarks(text) {
  const marks = [];

  const numberWords =
    "(?:ZERO|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE)";

  const pattern = new RegExp(
    "\\b(\\d{2,3})\\s+" +
      numberWords +
      "(?:\\s+" +
      numberWords +
      ")?\\b",
    "gi"
  );

  let match;

  while (
    (match = pattern.exec(text)) !== null
  ) {
    const value = Number(match[1]);

    if (
      value >= 0 &&
      value <= 100 &&
      value !== 33
    ) {
      marks.push(value);
    }
  }

  if (marks.length < 5) {
    const percentageSection =
      text.match(
        /PERCENTAGE\s+MARKS([\s\S]{0,1200})/i
      );

    if (percentageSection) {
      const section =
        percentageSection[1];

      const numbers =
        section.match(
          /\b(?:[4-9]\d|100)\b/g
        ) || [];

      for (const number of numbers) {
        const value = Number(number);

        if (
          value >= 40 &&
          value <= 100 &&
          value !== 33 &&
          !marks.includes(value)
        ) {
          marks.push(value);
        }
      }
    }
  }

  return marks;
}

// ISC CLASS XII


function extractISCPercentage(text) {
  /* ISC percentage uses the best four subjects.*/

  const subjectMarks =
    extractISCSubjectMarks(text);

  if (subjectMarks.length < 4) {
    return null;
  }

  const filtered = subjectMarks.filter(
    (mark) => mark !== 35
  );

  if (filtered.length < 4) {
    return null;
  }

  // Highest four subjects
  const bestFour = [...filtered]
    .sort((a, b) => b - a)
    .slice(0, 4);

  const total = bestFour.reduce(
    (sum, mark) => sum + mark,
    0
  );

  const percentage =
    total / bestFour.length;

  return Number(
    percentage.toFixed(2)
  );
}


function extractISCSubjectMarks(text) {
  const marks = [];

  const pattern =
    /\b(\d{2,3})\s+(?:ZERO|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE)(?:\s+(?:ZERO|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE))?\b/gi;

  let match;

  while (
    (match = pattern.exec(text)) !== null
  ) {
    const value = Number(
      match[1]
    );

    if (
      value >= 0 &&
      value <= 100 &&
      value !== 35
    ) {
      marks.push(value);
    }
  }

  return marks;
}

// RESUME PERCENTAGE


function extractResumePercentage(text) {

  const match = text.match(
    /(?:percentage|percent|aggregate|overall)[^0-9]{0,30}(\d{1,3}(?:\.\d+)?)\s*%/i
  );

  if (match) {
    const value = Number(
      match[1]
    );

    if (isValidPercentage(value)) {
      return value;
    }
  }

  return null;
}

// GRADUATION PERCENTAGE


function extractGraduationPercentage(text) {
  const patterns = [
    /(?:graduation|degree|aggregate|percentage)[^0-9]{0,50}(\d{1,3}(?:\.\d+)?)\s*%/i,

    /(\d{1,3}(?:\.\d+)?)\s*%\s*(?:percentage|aggregate)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const value = Number(
        match[1]
      );

      if (
        isValidPercentage(value)
      ) {
        return value;
      }
    }
  }

  return null;
}


// CGPA


function extractCGPA(text) {
  const cleaned = cleanText(text);

  const patterns = [

    /(?:cgpa|c\.?\s*g\.?\s*p\.?\s*a\.?)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,

    /(\d+(?:\.\d+)?)\s*(?:\/\s*10)?\s*(?:cgpa|c\.?\s*g\.?\s*p\.?\s*a\.?)/i,
  ];

  for (const pattern of patterns) {
    const match =
      cleaned.match(pattern);

    if (match) {
      const value =
        Number(match[1]);


      if (
        value >= 0 &&
        value <= 10
      ) {
        return value;
      }
    }
  }

  return null;
}

// SGPA

function extractSGPA(text) {
  const cleaned = cleanText(text);

  const patterns = [

    /sgpa[\s\S]{0,100}?[:\-]\s*(\d+(?:\.\d+)?)/i,

    /sgpa\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,


    /(\d+(?:\.\d+)?)\s*sgpa\b/i,
  ];

  for (const pattern of patterns) {
    const match =
      cleaned.match(pattern);

    if (match) {
      const value =
        Number(match[1]);

      if (
        value >= 0 &&
        value <= 10
      ) {
        return value;
      }
    }
  }

  return null;
}


// DEGREE


function extractDegree(text) {
  const cleaned =
    cleanText(text).toLowerCase();

  if (
    cleaned.includes(
      "bachelor of technology"
    ) ||
    /\bb\.?\s*tech\b/i.test(
      cleaned
    ) ||
    /\bbtech\b/i.test(
      cleaned
    )
  ) {
    return "Bachelor of Technology";
  }

  if (
    cleaned.includes(
      "bachelor of engineering"
    ) ||
    /\bb\.?\s*e\.?\b/i.test(
      cleaned
    )
  ) {
    return "Bachelor of Engineering";
  }

  if (
    cleaned.includes(
      "bachelor of science"
    ) ||
    /\bb\.?\s*sc\.?\b/i.test(
      cleaned
    )
  ) {
    return "Bachelor of Science";
  }

  if (
    cleaned.includes(
      "bachelor of computer applications"
    ) ||
    /\bbca\b/i.test(
      cleaned
    )
  ) {
    return "Bachelor of Computer Applications";
  }

  return null;
}

// PASSING YEAR


function extractPassingYear(
  text,
  type
) {
  const cleaned = cleanText(text);

  const patterns = [];

  if (type === "10th") {
    patterns.push(
      /(?:class\s*x\b|class\s*10\b|10th|secondary)[\s\S]{0,100}\b(20\d{2})\b/i
    );
  }

  if (type === "12th") {
    patterns.push(
      /(?:class\s*xii\b|class\s*12\b|12th|higher\s*secondary)[\s\S]{0,100}\b(20\d{2})\b/i
    );
  }

  if (type === "graduation") {
    patterns.push(
      /(?:b\.?\s*tech|btech|bachelor|graduation)[\s\S]{0,150}\b(20\d{2})\b/i
    );
  }

  for (const pattern of patterns) {
    const match =
      cleaned.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

// MAIN EXTRACTION

function extractInformation(
  text,
  documentType
) {
  const cleaned = cleanText(text);

  const information = {
    documentType,

    name: extractName(
      cleaned,
      documentType
    ),

    passingYear:
      extractPassingYear(
        cleaned,
        documentType
      ),
  };

  // 10th

  if (
    documentType === "10th"
  ) {
    information.percentage =
      extractPercentage(
        cleaned,
        "10th"
      );
  }

  // 12th
 

  if (
    documentType === "12th"
  ) {
    information.percentage =
      extractPercentage(
        cleaned,
        "12th"
      );
  }

  // Graduation


  if (
    documentType ===
    "graduation"
  ) {
    information.percentage =
      extractPercentage(
        cleaned,
        "graduation"
      );

    information.cgpa =
      extractCGPA(cleaned);

    information.sgpa =
      extractSGPA(cleaned);

    information.degree =
      extractDegree(cleaned);
  }

  // Resume
  

  if (
    documentType === "resume"
  ) {
    information.tenthPercentage =
      extractResumePercentage(
        cleaned
      );

    information.twelfthPercentage =
      extractResumePercentage(
        cleaned
      );

    information.graduationPercentage =
      extractResumePercentage(
        cleaned
      );

    information.graduationCGPA =
      extractCGPA(cleaned);

    information.degree =
      extractDegree(cleaned);
  }

  return information;
}


export {
  extractInformation,
};