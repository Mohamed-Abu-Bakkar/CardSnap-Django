import { useEffect, useState } from "react";
import axios from "axios";

export default function PreviewPage() {
  const [previewRows, setPreviewRows] = useState([]);
  const [error, setError] = useState("");
  const [vcfUrl, setVcfUrl] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.documentElement.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const content = localStorage.getItem("vcfContent");
    if (content) {
      const rows = [];
      const cards = content.split(/END:VCARD/i);
      for (let card of cards) {
        if (!card.trim()) continue;
        let name = "";
        let email = "";
        let phones = [];
        let group = "";
        for (let line of card.split(/\r?\n/)) {
          if (/^FN:/i.test(line)) name = line.replace(/^FN:/i, "").trim();
          if (/^EMAIL/i.test(line)) email = line.split(":").pop().trim();
          if (/^TEL;TYPE=/i.test(line)) {
            // TEL;TYPE=LABEL:NUMBER
            const match = line.match(/^TEL;TYPE=([^:]+):(.+)$/i);
            if (match) {
              const label = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
              const number = match[2].trim();
              phones.push(`${label}: ${number}`);
            }
          } else if (/^TEL:/i.test(line)) {
            // fallback for TEL without label
            phones.push(line.split(":").pop().trim());
          }
          if (/^CATEGORIES:/i.test(line)) group = line.replace(/^CATEGORIES:/i, "").trim();
        }
        if (name || email || phones.length > 0 || group) {
          rows.push({ name, email, phones, group });
        }
      }
      setPreviewRows(rows);
      const blob = new Blob([content], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      setVcfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setError("No VCF file found. Please generate a VCF first.");
    }
  }, []);
  const label = localStorage.getItem("contactLabel") || "";

  const handleExportPDF = async () => {
    const contacts = previewRows.map(row => ({
      name: row.name,
      email: row.email,
      phones: row.phones.map(p => {
        const [label, ...rest] = p.split(":");
        return { label: label.trim().toLowerCase(), number: rest.join(":").trim() };
      }),
      group: row.group || label || "Default",
    }));
    const res = await axios.post("/api/export-pdf/", { contacts }, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contacts.pdf");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)] text-[var(--text)] px-4 w-screen">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition absolute top-6 right-6 z-10"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="w-full max-w-2xl card rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-400">
        <h1 className="text-2xl font-bold mb-4">VCF Preview</h1>
        {error ? (
          <div className="text-red-500 mb-6">{error}</div>
        ) : (
          <div className="w-full overflow-x-auto mb-6 max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phones</th>
                  <th className="px-3 py-2">Group</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-400">
                      No contacts found in VCF.
                    </td>
                  </tr>
                ) : (
                  previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-300 dark:border-gray-600">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.phones && row.phones.length > 0 ? row.phones.join(",\n ") : ""}</td>
                      <td className="px-3 py-2">{row.group}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="text-xs text-gray-400 mt-2">
              Showing {previewRows.length} contacts.
            </div>
          </div>
        )}
        {vcfUrl && (
          <div className="w-full mt-6 flex flex-col items-center space-y-4">
            <a
              href={vcfUrl}
              download="contacts.vcf"
              className="bg-emerald-500 hover:bg-emerald-600 text-black py-2 px-4 rounded-xl font-bold transition"
            >
              ⬇️ Download VCF
            </a>
            <button
              onClick={handleExportPDF}
              className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl font-bold transition"
            >
              📄 Export as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
