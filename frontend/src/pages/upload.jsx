import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.className = darkMode ? "dark" : "light";
    // Clear localStorage items related to previous upload/mapping/preview
    localStorage.setItem("darkMode", darkMode);
    localStorage.removeItem("uploadedFileName");
    localStorage.removeItem("uploadedFileType");
    localStorage.removeItem("uploadedFileUrl");
    localStorage.removeItem("columns");
    localStorage.removeItem("vcfContent");
    localStorage.removeItem("vcfUrl");
  }, [darkMode]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/preview-columns/", formData);
    // Save file and columns to localStorage or pass via navigation state
    localStorage.setItem("uploadedFileName", file.name);
    localStorage.setItem("uploadedFileType", file.type);
    localStorage.setItem("columns", JSON.stringify(res.data.columns));
    // For simplicity, store the file as a blob url
    const fileUrl = URL.createObjectURL(file);
    localStorage.setItem("uploadedFileUrl", fileUrl);
    navigate("/mapping");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => {
    setDragging(false);
  };

return (
    <>
        <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg)] text-[var(--text)] px-4 w-screen relative">
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition absolute top-6 right-6 z-10 px-4 py-2"
            >
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
            <div className="w-full max-w-2xl card rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-gray-400">
                
                
                
                <h1 className={`text-3xl font-extrabold mb-2 tracking-tight text-center ${darkMode ? "text-cyan-500" : "text-gray-500"}`}>XLS to VCard Converter</h1>
                <p className="text-gray-500 mb-6 text-center">Easily convert your Excel contacts to VCF (VCard) format for seamless import into your devices.</p>
                <div
                    className={`w-full flex flex-col items-center px-4 py-6 ${dragging ? "bg-cyan-100" : "bg-cyan-50"} dark:bg-gray-800 text-cyan-700 dark:text-white rounded-lg shadow-md tracking-wide uppercase border border-cyan-200 cursor-pointer hover:bg-cyan-100 dark:hover:bg-gray-700 transition mb-4`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current && inputRef.current.click()}
                    style={{ userSelect: 'none' }}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                    <span className="mt-2 text-base leading-normal">Drag & drop or click to select XLS/XLSX file</span>
                    {file && (
                        <span className="mt-2 text-green-600 dark:text-green-400 font-semibold break-all">{file.name}</span>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        ref={inputRef}
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </div>
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className={`w-full py-3 rounded-lg font-semibold text-lg transition bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg mb-6 ${!file ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    Upload & Preview
                </button>
                <div className="mt-8 text-xs text-gray-400 text-center">
                    <p>We respect your privacy. Your data is never stored.</p>
                </div>
            </div>
            <footer className="mt-8 text-gray-400 text-xs text-center">
                &copy; {new Date().getFullYear()} XLS to VCard Converter. All rights reserved.
            </footer>
        </div>
    </>
);
}