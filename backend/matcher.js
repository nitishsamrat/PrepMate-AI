function normalizeText(value) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeDegree(value) {
  if (!value) return "";

  const text = value
    .toLowerCase()
    .replace(/[.\-,]/g, " ")
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
    text === "be" ||
    text.includes("b e")
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

  return normalizeText(text);
}

function compareNames(
  marksheetValue,
  resumeValue
) {
  if (
    !marksheetValue ||
    !resumeValue
  ) {
    return {
      status: "not_available",
      matched: null,
      marksheetValue:
        marksheetValue ?? null,
      resumeValue:
        resumeValue ?? null,
    };
  }

  const matched =
    normalizeText(marksheetValue) ===
    normalizeText(resumeValue);

  return {
    status: matched
      ? "matched"
      : "mismatch",

    matched,

    marksheetValue,
    resumeValue,
  };
}

function compareValues(
  marksheetValue,
  resumeValue
) {

  if (
    marksheetValue === null ||
    marksheetValue === undefined
  ) {
    return {
      status: "not_available",
      matched: null,
      marksheetValue: null,
      resumeValue:
        resumeValue ?? null,
    };
  }

  if (
    resumeValue === null ||
    resumeValue === undefined
  ) {
    return {
      status: "not_provided",
      matched: null,
      marksheetValue,
      resumeValue: null,
    };
  }

  const matched =
    Number(marksheetValue) ===
    Number(resumeValue);

  return {
    status: matched
      ? "matched"
      : "mismatch",

    matched,

    marksheetValue,
    resumeValue,
  };
}

function compareDegrees(
  marksheetDegree,
  resumeDegree
) {
  if (
    !marksheetDegree ||
    !resumeDegree
  ) {
    return {
      status: "not_available",
      matched: null,
      marksheetValue:
        marksheetDegree ?? null,
      resumeValue:
        resumeDegree ?? null,
    };
  }

  const matched =
    normalizeDegree(
      marksheetDegree
    ) ===
    normalizeDegree(
      resumeDegree
    );

  return {
    status: matched
      ? "matched"
      : "mismatch",

    matched,

    marksheetValue:
      marksheetDegree,

    resumeValue:
      resumeDegree,
  };
}

function compareDocuments(
  tenth,
  twelfth,
  graduation,
  resume
) {
  const results = {
    name: compareNames(
      tenth.name,
      resume.name
    ),

    tenthPercentage:
      compareValues(
        tenth.percentage,
        resume.tenthPercentage
      ),

    twelfthPercentage:
      compareValues(
        twelfth.percentage,
        resume.twelfthPercentage
      ),

    degree: compareDegrees(
      graduation.degree,
      resume.degree
    ),
  };

  // Graduation percentage
  if (
    graduation.percentage !== null ||
    resume.graduationPercentage !== null
  ) {
    results.graduationPercentage =
      compareValues(
        graduation.percentage,
        resume.graduationPercentage
      );
  }

  // Graduation CGPA
  if (
    graduation.cgpa !== null ||
    resume.graduationCGPA !== null
  ) {
    results.graduationCGPA =
      compareValues(
        graduation.cgpa,
        resume.graduationCGPA
      );
  }

  const values =
    Object.values(results);

  const hasMismatch =
    values.some(
      (result) =>
        result.status === "mismatch"
    );

  const hasNotProvided =
    values.some(
      (result) =>
        result.status ===
        "not_provided"
    );

  const hasUnavailable =
    values.some(
      (result) =>
        result.status ===
        "not_available"
    );

  return {
    allMatched:
      !hasMismatch,

    hasMismatch,

    hasNotProvided,

    hasUnavailable,

    canContinue: true,

    results,
  };
}

export {
  compareDocuments,
};