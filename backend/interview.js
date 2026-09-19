const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

function fallbackQuestions(extractedResume = {}) {
  const name = extractedResume.name || "the candidate";
  const degree = extractedResume.degree || "your degree";
  const institution =
    extractedResume.institution || "your institution";
  const year =
    extractedResume.graduationYear || "recently";

  return [
    {
      id: "q1",
      text: `Tell me about yourself and your background as ${name}.`,
      topic: "introduction",
    },
    {
      id: "q2",
      text: `You studied ${degree} at ${institution}. What drew you to this field?`,
      topic: "education",
    },
    {
      id: "q3",
      text: `Describe a project or coursework you are most proud of from your ${degree} program.`,
      topic: "projects",
    },
    {
      id: "q4",
      text: `What technical skills from your resume do you use most confidently, and why?`,
      topic: "skills",
    },
    {
      id: "q5",
      text: `Having graduated around ${year}, where do you see yourself growing in the next two years?`,
      topic: "career",
    },
  ];
}

function fallbackAnalysis(answer) {
  const length = (answer || "").trim().split(/\s+/).filter(Boolean).length;
  let score = 5;
  if (length >= 40) score = 8;
  else if (length >= 20) score = 7;
  else if (length >= 8) score = 6;
  else if (length < 5) score = 3;

  return {
    score,
    feedback:
      length < 8
        ? "Try to give a fuller answer with a concrete example from your resume."
        : "Decent answer. Add more specifics (tools, outcomes, or metrics) next time.",
    followUp: null,
  };
}

async function callGemini(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  return JSON.parse(text);
}

function normalizeQuestions(parsed, extractedResume) {
  const list = Array.isArray(parsed?.questions)
    ? parsed.questions
    : Array.isArray(parsed)
      ? parsed
      : null;

  if (!list || list.length === 0) {
    return fallbackQuestions(extractedResume);
  }

  return list.slice(0, 5).map((q, i) => ({
    id: q.id || `q${i + 1}`,
    text: q.text || q.question || String(q),
    topic: q.topic || "general",
  }));
}

export async function generateQuestions({
  resumeText,
  extractedResume,
}) {
  try {
    const prompt = `You are an interview coach. Based on this candidate resume, generate exactly 5 interview questions.
Return ONLY JSON in this shape:
{"questions":[{"id":"q1","text":"...","topic":"skills|projects|experience|education|behavioral"}]}

Prefer questions about concrete skills, projects, and experience mentioned in the resume.
If resume text is thin, use the extracted fields.

Extracted fields:
${JSON.stringify(extractedResume || {}, null, 2)}

Resume text:
${(resumeText || "").slice(0, 6000)}`;

    const parsed = await callGemini(prompt);
    return normalizeQuestions(parsed, extractedResume);
  } catch (error) {
    console.error("generateQuestions fallback:", error.message);
    return fallbackQuestions(extractedResume);
  }
}

export async function analyzeAnswer({
  question,
  answer,
  resumeText,
  history,
}) {
  try {
    const prompt = `You are an interview evaluator. Score the candidate's answer from 0 to 10.
Return ONLY JSON:
{"score":7,"feedback":"short constructive feedback","followUp":null}

Set followUp to a short follow-up question string only if the answer was vague and needs clarification; otherwise null.

Question: ${question}
Answer: ${answer}
Prior Q&A (optional): ${JSON.stringify(history || [])}
Resume excerpt: ${(resumeText || "").slice(0, 3000)}`;

    const parsed = await callGemini(prompt);
    const score = Number(parsed?.score);
    return {
      score: Number.isFinite(score)
        ? Math.max(0, Math.min(10, Math.round(score)))
        : 5,
      feedback:
        typeof parsed?.feedback === "string"
          ? parsed.feedback
          : "No feedback returned.",
      followUp:
        typeof parsed?.followUp === "string" &&
        parsed.followUp.trim()
          ? parsed.followUp.trim()
          : null,
    };
  } catch (error) {
    console.error("analyzeAnswer fallback:", error.message);
    return fallbackAnalysis(answer);
  }
}
