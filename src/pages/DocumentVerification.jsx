import { useState } from "react";

function DocumentVerification() {
  const [documents, setDocuments] = useState({
    tenth: null,
    twelfth: null,
    graduation: null,
    resume: null,
  });

  const [verification, setVerification] =
    useState(null);

  const [extractedData, setExtractedData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleFile = (type, file) => {
    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError(
        "Please upload PDF files only."
      );
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [type]: file,
    }));

    setVerification(null);
    setExtractedData(null);
    setError("");
  };

  const removeFile = (type) => {
    setDocuments((prev) => ({
      ...prev,
      [type]: null,
    }));

    setVerification(null);
    setExtractedData(null);
    setError("");
  };

  const allUploaded =
    documents.tenth &&
    documents.twelfth &&
    documents.graduation &&
    documents.resume;

  const handleVerify = async () => {
    if (!allUploaded) {
      setError(
        "Please upload all four documents."
      );
      return;
    }

    setLoading(true);
    setError("");
    setVerification(null);
    setExtractedData(null);

    try {
      const formData = new FormData();

      formData.append(
        "tenth",
        documents.tenth
      );

      formData.append(
        "twelfth",
        documents.twelfth
      );

      formData.append(
        "graduation",
        documents.graduation
      );

      formData.append(
        "resume",
        documents.resume
      );

      const response = await fetch(
        "http://localhost:5000/verify",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Verification failed."
        );
        return;
      }

      setVerification(
        data.verification
      );

      setExtractedData(
        data.extractedData
      );
    } catch (error) {
      console.error(error);

      setError(
        "Could not connect to the verification server."
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadBox = (
    type,
    title
  ) => (
    <div>
      <label className="mb-2 block font-medium text-slate-700">
        {title}
      </label>

      {!documents[type] ? (
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) =>
            handleFile(
              type,
              e.target.files[0]
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white p-3"
        />
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">
              {documents[type].name}
            </p>

            <p className="text-sm text-slate-500">
              {(
                documents[type].size /
                1024
              ).toFixed(1)}{" "}
              KB
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              removeFile(type)
            }
            className="ml-4 rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );

  const resultRow = (
    title,
    result
  ) => {
    if (!result) {
      return null;
    }

    let content;
    let className;

    if (
      result.status ===
      "matched"
    ) {
      content = "✓ Matched";
      className =
        "font-semibold text-green-600";
    } else if (
      result.status ===
      "mismatch"
    ) {
      content = "✗ Mismatch";
      className =
        "font-semibold text-red-600";
    } else if (
      result.status ===
      "not_provided"
    ) {
      content = "⚠ Not provided";
      className =
        "font-semibold text-yellow-600";
    } else {
      content = "⚠ Not available";
      className =
        "font-semibold text-yellow-600";
    }

    return (
      <div className="flex items-center justify-between border-b border-slate-200 py-4 last:border-b-0">
        <span className="font-medium text-slate-700">
          {title}
        </span>

        <span className={className}>
          {content}
        </span>
      </div>
    );
  };

  const extractedRow = (
    title,
    marksheetValue,
    resumeValue
  ) => (
    <div className="border-b border-slate-200 py-4 last:border-b-0">
      <p className="mb-2 font-semibold text-slate-700">
        {title}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <span className="font-medium">
            Marksheet:
          </span>{" "}
          {marksheetValue ??
            "Not found"}
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <span className="font-medium">
            Resume:
          </span>{" "}
          {resumeValue ??
            "Not provided"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">

      <h1 className="mb-2 text-3xl font-bold text-slate-900">
        Document Verification
      </h1>

      <p className="mb-8 text-slate-500">
        Upload your academic marksheets
        and resume for verification.
      </p>

     
      {/* DOCUMENT UPLOAD SECTION */}
      

      {!verification && (
        <>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

            {uploadBox(
              "tenth",
              "10th Marksheet"
            )}

            {uploadBox(
              "twelfth",
              "12th Marksheet"
            )}

            {uploadBox(
              "graduation",
              "Graduation Marksheet"
            )}

            {uploadBox(
              "resume",
              "Resume"
            )}

          </div>

          <button
            type="button"
            disabled={
              !allUploaded ||
              loading
            }
            onClick={handleVerify}
            className={`mt-8 rounded-lg px-6 py-3 font-semibold text-white ${
              allUploaded &&
              !loading
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-400"
            }`}
          >
            {loading
              ? "Verifying..."
              : "Verify Documents"}
          </button>
        </>
      )}

     
      {/* ERROR */}
     

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* VERIFICATION RESULT */}
     

      {verification && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Verification Result
          </h2>

          {verification.hasMismatch ? (
            <div className="mb-6 rounded-lg bg-red-50 p-4 font-semibold text-red-700">
              ✗ Some available information
              does not match.
            </div>
          ) : verification.hasUnavailable ||
            verification.hasNotProvided ? (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 font-semibold text-yellow-700">
              ⚠ Some information could
              not be automatically
              verified.
            </div>
          ) : (
            <div className="mb-6 rounded-lg bg-green-50 p-4 font-semibold text-green-700">
              ✓ All available information
              matched successfully.
            </div>
          )}

          <div>

            {resultRow(
              "Name",
              verification.results.name
            )}

            {resultRow(
              "10th Percentage",
              verification.results
                .tenthPercentage
            )}

            {resultRow(
              "12th Percentage",
              verification.results
                .twelfthPercentage
            )}

            {resultRow(
              "Graduation Percentage",
              verification.results
                .graduationPercentage
            )}

            {resultRow(
              "Graduation CGPA",
              verification.results
                .graduationCGPA
            )}

            {resultRow(
              "Degree",
              verification.results
                .degree
            )}

          </div>

          <button
            type="button"
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Continue to Interview
          </button>

        </div>
      )}

      {/* EXTRACTED INFORMATION */}

      {extractedData && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">

          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Extracted Information
          </h2>

          <div>

            {extractedRow(
              "Name",
              extractedData.tenth
                ?.name,
              extractedData.resume
                ?.name
            )}

            {extractedRow(
              "10th Percentage",
              extractedData.tenth
                ?.percentage,
              extractedData.resume
                ?.tenthPercentage
            )}

            {extractedRow(
              "12th Percentage",
              extractedData.twelfth
                ?.percentage,
              extractedData.resume
                ?.twelfthPercentage
            )}

            {extractedRow(
              "Graduation Percentage",
              extractedData.graduation
                ?.percentage,
              extractedData.resume
                ?.graduationPercentage
            )}

            {extractedRow(
              "Graduation CGPA",
              extractedData.graduation
                ?.cgpa,
              extractedData.resume
                ?.graduationCGPA
            )}

            {extractedRow(
              "Graduation SGPA",
              extractedData.graduation
                ?.sgpa,
              null
            )}

            {extractedRow(
              "Degree",
              extractedData.graduation
                ?.degree,
              extractedData.resume
                ?.degree
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default DocumentVerification;