import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UploadPage from "./pages/upload";
import MappingPage from "./pages/mapping";
import PreviewPage from "./pages/preview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/mapping" element={<MappingPage />} />
        <Route path="*" element={<UploadPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
