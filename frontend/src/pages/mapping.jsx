import { useState, useEffect } from "react";
import axios from "axios";

export default function MappingPage() {
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [phones, setPhones] = useState([{ column: "", label: "" }]);
  const [group, setGroup] = useState("");
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    document.documentElement.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
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
    setMapping((prev) => ({ ...prev, [role]: column }));
  };

  const handlePhoneFieldChange = (index, key, value) => {
    const updated = [...phones];
    updated[index][key] = value;
    setPhones(updated);
  };

  const addPhoneField = () => {
    setPhones([...phones, { column: "", label: "" }]);
  };

  const removePhoneField = (index) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping", JSON.stringify(mapping));
    formData.append("phones", JSON.stringify(phones));
    formData.append("group", group);
    formData.append("label", label);

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
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition absolute top-6 right-6 z-10"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <div className="w-full max-w-2xl card rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-400">
        <h1 className="text-2xl font-bold mb-4">Map Fields</h1>

        {columns.length > 0 ? (
          <>
            <div className="w-full space-y-6 mt-2">
              {/* Contact Label */}
              <div className="flex flex-col">
                <label className="block font-medium mb-1">Contact Label (prefix):</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Classmate, Office"
                  className="border p-2 rounded-lg"
                />
              </div>

              {/* Static Mappings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["first_name", "last_name", "email"].map((role) => (
                  <div key={role} className="flex flex-col">
                    <label className="block font-medium mb-1 capitalize">{role.replace("_", " ")}:</label>
                    <select
                      onChange={(e) => handleMappingChange(role, e.target.value)}
                      className="border p-2 rounded-lg"
                    >
                      <option value="">Select Column</option>
                      {columns.map((col, i) => (
                        <option key={i} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Dynamic Phone Fields */}
              <div className="space-y-4">
                {phones.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handlePhoneFieldChange(index, 'label', e.target.value)}
                      placeholder="Label (e.g. mobile, office)"
                      className="border p-2 rounded-lg w-1/3"
                    />
                    <select
                      value={field.column}
                      onChange={(e) => handlePhoneFieldChange(index, 'column', e.target.value)}
                      className="border p-2 rounded-lg w-2/3"
                    >
                      <option value="">Select Phone Column</option>
                      {columns.map((col, i) => (
                        <option key={i} value={col}>{col}</option>
                      ))}
                    </select>
                    <button onClick={() => removePhoneField(index)} className="text-red-600 font-bold">✖</button>
                  </div>
                ))}
                <button onClick={addPhoneField} className="text-sm text-blue-600">➕ Add Phone</button>
              </div>

              {/* Group Column */}
              <div className="mt-4">
                <label className="block font-medium mb-1">Group Column (optional):</label>
                <select
                  onChange={(e) => setGroup(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select Column</option>
                  {columns.map((col, i) => (
                    <option key={i} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleConvert}
                className="w-full py-3 rounded-lg font-semibold text-lg transition bg-green-600 hover:bg-green-700 text-white shadow-lg mt-4"
                disabled={!Object.values(mapping).every(Boolean)}
              >
                Generate VCF
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400">No columns to map. Please upload a file first.</div>
        )}
      </div>
    </div>
  );
}
