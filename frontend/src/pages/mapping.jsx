import { useState, useEffect } from "react";
import axios from "axios";

export default function MappingPage() {
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [file, setFile] = useState(null);
  const [vcfUrl, setVcfUrl] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.documentElement.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", darkMode);
    localStorage.removeItem("vcfContent");
    localStorage.removeItem("vcfUrl");
    
  });

  useEffect(() => {
    // Load columns and file from localStorage (set by upload page)
    const storedColumns = localStorage.getItem("columns");
    const fileUrl = localStorage.getItem("uploadedFileUrl");
    const fileName = localStorage.getItem("uploadedFileName");
    const fileType = localStorage.getItem("uploadedFileType");
    if (storedColumns && fileUrl && fileName && fileType) {
      setColumns(JSON.parse(storedColumns));
      fetch(fileUrl)
        .then((res) => res.blob())
        .then((blob) => setFile(new File([blob], fileName, { type: fileType })));
    }
  }, []);

  const handleMappingChange = (role, column) => {
    setMapping({ ...mapping, [role]: column });
  };

  const handleConvert = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping", JSON.stringify(mapping));
    const res = await axios.post("/api/convert/", formData, {
      responseType: "text",
    });
    localStorage.setItem("vcfContent", res.data);
    window.location.href = "/preview";
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)] text-[var(--text)] px-4 w-screen">
         <button
   onClick={() => setDarkMode(!darkMode)}
   className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition absolute top-6 right-6 z-10 px-4 py-2"
 >
   {darkMode ? "Light Mode" : "Dark Mode"}
 </button>
 
      <div className="w-full max-w-2xl card rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-400">
        <div className="w-full flex justify-end mb-4">
        </div>
        <h1 className="text-2xl font-bold mb-4">Map Fields</h1>
        {columns.length > 0 ? (
          <>
            <div className="w-full space-y-6 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["first_name", "last_name", "email", "phone"].map((role) => (
                  <div key={role} className="flex flex-col">
                    <label className={`block font-medium ${darkMode ? "text-gray-200" : "text-gray-800"} mb-1 capitalize`}>
                      {role.replace("_", " ")}:
                    </label>
                    <select
                      onChange={(e) => handleMappingChange(role, e.target.value)}
                      className="border border-cyan-200 p-2 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:outline-none dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Column</option>
                      {columns.map((col, i) => (
                        <option key={i} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleConvert}
                className="w-full py-3 rounded-lg font-semibold text-lg transition bg-green-600 hover:bg-green-700 text-white shadow-lg mt-4"
                disabled={!Object.values(mapping).every(Boolean)}
              >
                Generate VCF
              </button>
            </div>
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
          </>
        ) : (
          <div className="text-gray-400">No columns to map. Please upload a file first.</div>
        )}
      </div>
    </div>
  );
}