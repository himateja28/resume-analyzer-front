import React, { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Please upload a resume file (PDF/DOCX).");
    setLoading(true);
    const fd = new FormData();
    fd.append("resume", file);
    fd.append("jd", jd);

    try {
      const res = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const Tag = ({ children, bg = "#f0f0f0", color = "#333" }) => (
    <span
      style={{
        padding: "6px 10px",
        background: bg,
        borderRadius: 6,
        color,
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "28px auto",
        fontFamily: "system-ui,Segoe UI,Roboto",
        padding: 16,
        color: "#333",
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#8b5cf6" }}>AI Resume Analyzer</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label style={{ fontWeight: "600" }}>Upload Resume (PDF / DOCX)</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragging ? "#8b5cf6" : "#ccc"}`,
            background: dragging ? "#f5f5ff" : "#fafafa",
            padding: "30px",
            textAlign: "center",
            borderRadius: "10px",
            marginTop: "10px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx,.doc"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div style={{ color: "#8b5cf6" }}>{file.name}</div>
          ) : (
            <div style={{ color: "#aaa" }}>
              Drag & drop your file here, or click to browse
            </div>
          )}
        </div>

        <label style={{ fontWeight: "600" }}>Paste Job Description (JD)</label>
        <textarea
          rows={8}
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            background: "#fafafa",
            border: "1px solid #ccc",
            borderRadius: 8,
            color: "#333",
            marginTop: "8px",
            marginBottom: "20px",
            fontSize: 14,
          }}
          placeholder="Paste the job description here..."
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#8b5cf6",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            width: "100%",
          }}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {loading && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            textAlign: "center",
            background: "#f5f5ff",
            borderRadius: 8,
          }}
        >
          <p style={{ color: "#333" }}>Analyzing resume...</p>
          <p style={{ color: "#8b5cf6" }}>Almost done, hang tight 🚀</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, color: "crimson", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ color: "#8b5cf6" }}>AI Results</h2>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: "#666" }}>ATS Score</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color:
                    result.atsScore >= 70
                      ? "#22c55e"
                      : result.atsScore >= 40
                      ? "#facc15"
                      : "#ef4444",
                }}
              >
                {result.atsScore ?? "N/A"}
                <span style={{ fontSize: 14, marginLeft: 8 }}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  background: "#eee",
                  height: 14,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${result.atsScore ?? 0}%`,
                    height: "100%",
                    background: "#8b5cf6",
                  }}
                />
              </div>
            </div>
          </div>

          <h3 style={{ color: "#8b5cf6" }}>Summary</h3>
          <div
            style={{
              background: "#fafafa",
              padding: 12,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              marginBottom: 16,
              border: "1px solid #ccc",
            }}
          >
            {result.summary || result.aiRaw || "No summary available."}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <h4 style={{ color: "#8b5cf6" }}>
                Matched Keywords ({(result.matchedKeywords || []).length})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(result.matchedKeywords || []).map((k, i) => (
                  <Tag key={i} bg="#f0f0ff" color="#22c55e">
                    {k}
                  </Tag>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: "#8b5cf6" }}>
                Missing Keywords ({(result.missingKeywords || []).length})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(result.missingKeywords || []).map((k, i) => (
                  <Tag key={i} bg="#ffe6f0" color="#ef4444">
                    {k}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ color: "#8b5cf6" }}>Strengths</h4>
            <ul>
              {(result.strengths || []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ color: "#8b5cf6" }}>Suggestions</h4>
            <ol>
              {(result.suggestions || []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
