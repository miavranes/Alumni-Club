import React, { useState } from "react";
import { apiFetch } from "../services/fetchApi";

interface UploadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadCSVModal: React.FC<UploadCSVModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Molimo izaberite CSV fajl.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await apiFetch("/api/theses/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Nepoznata greška" }));
        console.error("Backend greška:", errorData);
        throw new Error(errorData.message || "Upload nije uspio.");
      }

      const result = await response.json();
      alert(`CSV uspješno uploadovan! Dodato ${result.count} radova.`);
      onUploadSuccess();
      onClose();
    } catch (error: any) {
      console.error("Greška pri uploadu:", error);
      alert(`Greška pri uploadu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✖
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold mb-2 text-base">Napomena:</p>
          <p className="mb-3">CSV fajl mora imati sljedeće kolone:</p>

          <div className="bg-gray-50 border border-gray-200 p-4 mt-2 rounded-lg text-sm leading-6 max-h-80 overflow-y-auto">
            <div className="mb-3">
              <div className="font-bold text-[#294a70] text-base mb-2">Obavezne kolone:</div>
              <div className="ml-3 space-y-1">
                <div><span className="font-semibold">first_name</span> – ime studenta</div>
                <div><span className="font-semibold">last_name</span> – prezime studenta</div>
                <div><span className="font-semibold">title</span> – naziv rada</div>
                <div><span className="font-semibold">title_language</span> – jezik naslova (en ili cg)</div>
                <div><span className="font-semibold">type</span> – tip rada: bachelors, masters ili specialist</div>
                <div><span className="font-semibold">year</span> – godina odbrane (broj, npr. 2024)</div>
                <div><span className="font-semibold">mentor</span> – mentor (npr. "Prof. dr Ivan Petrović")</div>
                <div><span className="font-semibold">keywords</span> – ključne riječi, odvojene zarezom</div>
              </div>
            </div>
            
            <div className="mt-4 mb-3">
              <div className="font-bold text-[#294a70] text-base mb-2">Opcione kolone (prevod naslova):</div>
              <div className="ml-3 space-y-1">
                <div><span className="font-semibold">subtitle</span> – podnaslov rada</div>
                <div><span className="font-semibold">additional_title</span> – prevod naslova na drugi jezik</div>
                <div><span className="font-semibold">additional_subtitle</span> – prevod podnaslova</div>
                <div><span className="font-semibold">additional_title_language</span> – jezik prevoda (en ili cg)</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-bold text-[#294a70] text-base mb-2">Opcione kolone (ostalo):</div>
              <div className="ml-3 space-y-1">
                <div><span className="font-semibold">file_url</span> – link na PDF fajl</div>
                <div><span className="font-semibold">zip_file</span> - link na ZIP fajl (dodatna dokumentacija)</div><div><span className="font-semibold">committee_members</span> – članovi komisije, odvojeni zarezom</div>
                <div><span className="font-semibold">grade</span> – ocjena (A, B, C, D, E ili F)</div>
                <div><span className="font-semibold">language</span> – jezik rada (en = English, cg = Crna Gora)</div>
                <div><span className="font-semibold">abstract</span> – sažetak rada</div>
                <div><span className="font-semibold">defense_date</span> – datum i vrijeme odbrane (format: YYYY-MM-DD HH:MM:SS)</div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-500 italic">
              Napomena: user_id se automatski dodijeljuje, ne treba ga unositi u CSV.
            </div>
          </div>

          <div className="mt-4 bg-[#eef5ff] border border-[#b8d4ff] rounded-lg p-4 max-w-3xl mx-auto">
            <p className="font-semibold text-[#2a3c60] mb-2">Primjer CSV formata:</p>
            <div className="mt-2 bg-white border border-[#8ba8d1] rounded-md p-3 overflow-x-auto">
              <pre className="text-[11px] leading-5 text-[#1f2a44]" style={{whiteSpace: 'pre'}}>
{`first_name,last_name,title,subtitle,title_language,additional_title,additional_subtitle,additional_title_language,type,year,file_url,zip_file,mentor,committee_members,grade,keywords,language,abstract,defense_date
Marko,Marković,Primena mašinskog učenja u analizi podataka,,cg,Application of Machine Learning in Data Analysis,,en,bachelors,2024,https://example.com/rad1.pdf,,Prof. dr Ivan Petrović,"Prof. dr Ivan Petrović, Doc. dr Ana Jovanović, Prof. dr Marija Nikolić",A,"AI, Machine Learning, Neural Networks",cg,"Ovaj rad istražuje primenu mašinskog učenja u analizi velikih skupova podataka.",2024-06-15 10:00:00
Ana,Jovanović,Deep Learning for Image Recognition,A Comprehensive Study,en,Duboko učenje za prepoznavanje slika,Sveobuhvatna studija,cg,masters,2024,https://example.com/rad2.pdf,,Prof. dr Marija Nikolić,"Prof. dr Stefan Đorđević, Doc. dr Jelena Marković",A,"Deep Learning, Computer Vision, AI",en,"This thesis explores deep learning techniques for image recognition.",2024-08-05 15:00:00`}
              </pre>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Izaberite CSV fajl
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="border rounded-md w-full p-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Otkaži
          </button>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-[#355070] text-white rounded-md hover:bg-[#2b4058]"
          >
            {loading ? "Upload..." : "Upload CSV"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadCSVModal;


