function normalizeText(value) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeName(value) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDegree(value) {
  if (!value) return "";

  const text = value
    .toString()
    .toLowerCase()
    .replace(/[.,&/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    text.includes("bachelor of technology") ||
    text.includes("b tech") ||
    text.includes("btech")
  ) {
    return "btech";
  }

  if (
    text.includes("bachelor of engineering") ||
    text === "be"
  ) {
    return "be";
  }

  if (
    text.includes("bachelor of science") ||
    text.includes("b sc") ||
    text.includes("bsc")
  ) {
    return "bsc";
  }

  if (
    text.includes("bachelor of computer applications") ||
    text.includes("bca")
  ) {
    return "bca";
  }

  if (
    text.includes("master of technology") ||
    text.includes("m tech") ||
    text.includes("mtech")
  ) {
    return "mtech";
  }

  if (
    text.includes("master of engineering") ||
    text === "me"
  ) {
    return "me";
  }

  if (
    text.includes("master of science") ||
    text.includes("m sc") ||
    text.includes("msc")
  ) {
    return "msc";
  }

  if (
    text.includes("master of computer applications") ||
    text.includes("mca")
  ) {
    return "mca";
  }

  return normalizeText(text);
}

function normalizeInstitution(value) {
  if (!value) return "";

  const text = value
    .toString()
    .toLowerCase()
    .replace(/[.,\-&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliases = {
    "maulana abul kalam azad university of technology":
      "makaut",

    "maulana abul kalam azad university of technology west bengal":
      "makaut",

    "maulana abul kalam azad university of technology kolkata":
      "makaut",

    "west bengal university of technology":
      "makaut",

    "makaut":
      "makaut",
  };

  if (aliases[text]) {
    return aliases[text];
  }

  return normalizeText(text);
}

function compareField(
  documentValue,
  resumeValue,
  normalizer = normalizeText
) {
  if (!documentValue) {
    return {
      status: "not_available",
      matched: null,
      documentValue: null,
      resumeValue: resumeValue ?? null,
    };
  }

  if (!resumeValue) {
    return {
      status: "not_provided",
      matched: null,
      documentValue,
      resumeValue: null,
    };
  }

  const first = normalizer(documentValue);
  const second = normalizer(resumeValue);

  if (!first || !second) {
    return {
      status: "not_available",
      matched: null,
      documentValue,
      resumeValue,
    };
  }

  const matched =
    first === second ||
    first.includes(second) ||
    second.includes(first);

  return {
    status: matched ? "matched" : "mismatch",
    matched,
    documentValue,
    resumeValue,
  };
}

function compareName(documentValue, resumeValue) {
  return compareField(
    documentValue,
    resumeValue,
    normalizeName
  );
}

function compareDegree(documentValue, resumeValue) {
  return compareField(
    documentValue,
    resumeValue,
    normalizeDegree
  );
}

function compareInstitution(
  documentValue,
  resumeValue
) {
  return compareField(
    documentValue,
    resumeValue,
    normalizeInstitution
  );
}

/*
  Extract the final graduation year from a value.

  Examples:

  2027       -> 2027
  2023-2027  -> 2027
  2023 – 2027 -> 2027
  2022-2026  -> 2026
  2026       -> 2026

  This function does NOT blindly convert academic
  session text such as "2025-26" into a graduation year.
*/
function extractGraduationYear(value) {
  if (!value) return null;

  const text = value
    .toString()
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  /*
    Four-digit year range.

    Example:
    2023-2027
    2022 - 2026
  */
  const rangeMatch = text.match(
    /\b(19|20)\d{2}\s*-\s*((19|20)\d{2})\b/
  );

  if (rangeMatch) {
    return rangeMatch[2];
  }

  /*
    Single four-digit year.

    Example:
    2027
    2026
  */
  const singleYearMatch = text.match(
    /\b(19|20)\d{2}\b/
  );

  if (singleYearMatch) {
    return singleYearMatch[0];
  }

  return null;
}

function compareYear(
  documentValue,
  resumeValue
) {
  /*
    If the graduation document does not contain
    a usable graduation year, do not call it a mismatch.
  */
  if (!documentValue) {
    return {
      status: "not_available",
      matched: null,
      documentValue: null,
      resumeValue: resumeValue ?? null,
    };
  }

  /*
    If the resume does not provide a graduation year,
    it is "not provided", not a mismatch.
  */
  if (!resumeValue) {
    return {
      status: "not_provided",
      matched: null,
      documentValue,
      resumeValue: null,
    };
  }

  const documentYear =
    extractGraduationYear(documentValue);

  const resumeYear =
    extractGraduationYear(resumeValue);

  /*
    If either side does not contain a usable year,
    verification is unavailable.
  */
  if (!documentYear || !resumeYear) {
    return {
      status: "not_available",
      matched: null,
      documentValue,
      resumeValue,
    };
  }

  const matched =
    documentYear === resumeYear;

  return {
    status: matched ? "matched" : "mismatch",
    matched,
    documentValue,
    resumeValue,
  };
}

function compareDocuments(
  graduation,
  resume
) {
  const results = {
    name: compareName(
      graduation?.name,
      resume?.name
    ),

    degree: compareDegree(
      graduation?.degree,
      resume?.degree
    ),

    institution: compareInstitution(
      graduation?.institution,
      resume?.institution
    ),

    graduationYear: compareYear(
      graduation?.graduationYear,
      resume?.graduationYear
    ),
  };

  const allResults =
    Object.values(results);

  /*
    A real mismatch means that both sides
    contain information and that information differs.
  */
  const hasMismatch =
    allResults.some(
      (result) =>
        result.status === "mismatch"
    );

  /*
    Information missing from the resume
    should not be treated as a mismatch.
  */
  const hasNotProvided =
    allResults.some(
      (result) =>
        result.status === "not_provided"
    );

  /*
    Information that could not be extracted
    should not be treated as a mismatch.
  */
  const hasNotAvailable =
    allResults.some(
      (result) =>
        result.status === "not_available"
    );

  /*
    All fields are considered fully matched only
    when every field has an actual match.
  */
  const allMatched =
    !hasMismatch &&
    !hasNotProvided &&
    !hasNotAvailable;

  /*
    Candidate can continue even when some
    information is unavailable.
  */
  const canContinue = true;

  return {
    allMatched,

    hasMismatch,

    hasNotProvided,

    hasUnavailable:
      hasNotAvailable,

    canContinue,

    results,
  };
}

export {
  compareDocuments,
};