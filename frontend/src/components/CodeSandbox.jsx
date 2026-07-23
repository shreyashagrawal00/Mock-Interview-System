import React, { useState } from "react";

export function CodeSandbox({ value, onChange, language = "javascript" }) {
  const [lang, setLang] = useState(language);

  return (
    <div className="code-sandbox-container">
      <div className="code-sandbox-toolbar">
        <span className="code-title">Live Code Sandbox</span>
        <select
          className="code-lang-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="typescript">TypeScript</option>
          <option value="sql">SQL</option>
          <option value="html">HTML/CSS</option>
        </select>
      </div>
      <textarea
        className="code-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`// Write your ${lang} solution here...\nfunction solution() {\n  // Your code\n}`}
        rows={12}
        spellCheck="false"
      />
    </div>
  );
}
