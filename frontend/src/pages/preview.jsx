import { useEffect, useState } from "react";

export default function PreviewPage() {
  const [previewRows, setPreviewRows] = useState([]);
  const [error, setError] = useState("");
  const [vcfUrl, setVcfUrl] = useState("");
const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
useEffect(() => {
  document.documentElement.className = darkMode ? "dark" : "light";
  localStorage.setItem("darkMode", darkMode);
  // Clear localStorage items related to previous upload/mapping/preview
}, [darkMode]);

  useEffect(() => {
    const content = localStorage.getItem("vcfContent");
    if (content) {
      // Parse VCF and extract first+last name, email, phone for preview
      const rows = [];
      const cards = content.split(/END:VCARD/i);
      for (let card of cards) {
        if (!card.trim()) continue;
        let firstName = "";
        let lastName = "";
        let name = "";
        let email = "";
        let phone = "";
        for (let line of card.split(/\r?\n/)) {
          if (/^N:/i.test(line)) {
            // N:Last;First;Middle;Prefix;Suffix
            const nParts = line.replace(/^N:/i, "").split(";");
            lastName = nParts[0]?.trim() || "";
            firstName = nParts[1]?.trim() || "";
          }
          if (/^FN:/i.test(line)) name = line.replace(/^FN:/i, "").trim();
          if (/^EMAIL/i.test(line)) email = line.split(":").pop().trim();
          if (/^TEL/i.test(line)) phone = line.split(":").pop().trim();
        }
        // Prefer First Last if available, else FN
        let nameParts = [];
        if (firstName) nameParts.push(firstName);
        if (lastName) nameParts.push(lastName);
        let displayName = nameParts.length > 0 ? nameParts.join(" ") : name;
        if (displayName || email || phone) rows.push({ name: displayName, email, phone });
      }
      setPreviewRows(rows); // Show all rows
      // Generate VCF download URL
      const blob = new Blob([content], { type: "text/vcard" });
      const url = URL.createObjectURL(blob);
      setVcfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setError("No VCF file found. Please generate a VCF first.");
      setVcfUrl("");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)] text-[var(--text)] px-4 w-screen">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition absolute top-6 right-6 z-10 px-4 py-2"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="w-full max-w-2xl card rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-400">
        <div className="w-full flex justify-end mb-4"></div>
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
                  <th className="px-3 py-2">Phone</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-400">
                      No contacts found in VCF.
                    </td>
                  </tr>
                ) : (
                  previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-300 dark:border-gray-600">
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.phone}</td>
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
          <div className="w-full mt-6 flex flex-col items-center">
            <a
              href={vcfUrl}
              download="contacts.vcf"
              className="bg-emerald-500 hover:bg-emerald-600 text-black py-2 px-4 rounded-xl font-bold transition"
            >
              ⬇️ Download VCF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
