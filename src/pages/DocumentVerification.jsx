import { useState } from "react";

function DocumentUpload({
  title,
  description,
  file,
  onFileChange,
  onRemove,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
          <div className="mb-2 text-3xl">
            📄
          </div>

          <p className="font-medium text-slate-700">
            Click to upload PDF
          </p>

          <p className="mt-1 text-xs text-slate-500">
            PDF files only
          </p>

          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="text-2xl">
              📄
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium text-slate-700">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                PDF uploaded
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="ml-4 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function getStatusText(status) {
  switch (status) {
    case "matched":
      return "Matched";

    case "mismatch":
      return "Mismatch";

    case "not_provided":
      return "Not Provided";

    case "not_available":
      return "Not Available";

    default:
      return "Not Available";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "matched":
      return "bg-green-100 text-green-700";

    case "mismatch":
      return "bg-red-100 text-red-700";

    case "not_provided":
      return "bg-yellow-100 text-yellow-700";

    case "not_available":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getFieldLabel(field) {
  switch (field) {
    case "name":
      return "Name";

    case "degree":
      return "Degree / Course";

    case "institution":
      return "University / College";

    case "graduationYear":
      return "Graduation Year";

    default:
      return field;
  }
}

function VerificationRow({
  label,
  result,
}) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="px-4 py-4 font-medium text-slate-700">
        {label}
      </td>

      <td className="px-4 py-4 text-slate-600">
        {result?.documentValue || "Not Available"}
      </td>

      <td className="px-4 py-4 text-slate-600">
        {result?.resumeValue || "Not Provided"}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
            result?.status
          )}`}
        >
          {getStatusText(result?.status)}
        </span>
      </td>
    </tr>
  );
}

function ExtractedDocument({
  title,
  data,
}) {
  if (!data) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">
        {title}
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Name
          </p>

          <p className="mt-1 text-slate-700">
            {data.name || "Not Available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Degree / Course
          </p>

          <p className="mt-1 text-slate-700">
            {data.degree || "Not Available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            University / College
          </p>

          <p className="mt-1 text-slate-700">
            {data.institution || "Not Available"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Graduation Year
          </p>

          <p className="mt-1 text-slate-700">
            {data.graduationYear || "Not Available"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DocumentVerification() {
  const [graduation, setGraduation] =
    useState(null);

  const [resume, setResume] =
    useState(null);

  const [verification, setVerification] =
    useState(null);

  const [extractedData, setExtractedData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleFile(
    event,
    setFile
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !==
        "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Please upload PDF files only."
      );

      event.target.value = "";
      return;
    }

    setError("");

    setFile(selectedFile);
  }

  function removeFile(setFile) {
    setFile(null);
    setVerification(null);
    setExtractedData(null);
    setError("");
  }

  const allUploaded =
    graduation && resume;

  async function handleVerify() {
    if (!allUploaded) {
      setError(
        "Please upload both the graduation document and resume."
      );

      return;
    }

    setLoading(true);
    setError("");
    setVerification(null);
    setExtractedData(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "graduation",
        graduation
      );

      formData.append(
        "resume",
        resume
      );

      const response =
        await fetch(
          "http://localhost:5000/verify",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Verification failed."
        );
      }

      setVerification(
        data.verification
      );

      setExtractedData(
        data.extractedData
      );
    } catch (err) {
      console.error(
        "Verification error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while verifying the documents."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Document Verification
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-slate-500">
            Upload your graduation document and
            resume. We will compare the important
            academic information between them.
          </p>
        </div>

        {/* Upload Section */}

        <div className="grid gap-6 md:grid-cols-2">
          <DocumentUpload
            title="Graduation Document"
            description="Upload your graduation marksheet or grade card in PDF format."
            file={graduation}
            onFileChange={(event) =>
              handleFile(
                event,
                setGraduation
              )
            }
            onRemove={() =>
              removeFile(setGraduation)
            }
          />

          <DocumentUpload
            title="Resume"
            description="Upload your current resume in PDF format."
            file={resume}
            onFileChange={(event) =>
              handleFile(
                event,
                setResume
              )
            }
            onRemove={() =>
              removeFile(setResume)
            }
          />
        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Verify Button */}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleVerify}
            disabled={
              !allUploaded || loading
            }
            className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading
              ? "Verifying..."
              : "Verify Documents"}
          </button>
        </div>

        {/* Verification Result */}

        {verification && (
          <div className="mt-10">
            <div
              className={`rounded-2xl border p-6 ${
                verification.hasMismatch
                  ? "border-red-200 bg-red-50"
                  : verification.allMatched
                  ? "border-green-200 bg-green-50"
                  : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <h2 className="text-xl font-bold text-slate-800">
                Verification Result
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {verification.allMatched
                  ? "All required information matches between the graduation document and resume."
                  : verification.hasMismatch
                  ? "Some information does not match between the graduation document and resume."
                  : "Some information could not be verified."}
              </p>
            </div>

            {/* Comparison Table */}

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Information
                      </th>

                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Graduation Document
                      </th>

                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Resume
                      </th>

                      <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                        Result
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(
                      verification.results || {}
                    ).map(
                      ([
                        field,
                        result,
                      ]) => (
                        <VerificationRow
                          key={field}
                          label={getFieldLabel(
                            field
                          )}
                          result={result}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extracted Information */}

            {extractedData && (
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-slate-800">
                  Extracted Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <ExtractedDocument
                    title="Graduation Document"
                    data={
                      extractedData.graduation
                    }
                  />

                  <ExtractedDocument
                    title="Resume"
                    data={
                      extractedData.resume
                    }
                  />
                </div>
              </div>
            )}

            {/* Continue */}

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Continue to Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}