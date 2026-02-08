import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { uploadThesis, Thesis } from '../services/thesesService';

interface UploadThesisFormData {
    thesisType: string;
    file: File | null;
    title: string;
    year: string;
}

interface UploadThesisModalProps {
    isOpen: boolean;
    onClose: (updatedData?: { id: number, thesis_title: string, thesis_document_url: string }) => void;
    thesisContext?: Thesis | null;
}

const UploadThesisModal: React.FC<UploadThesisModalProps> = ({ isOpen, onClose, thesisContext }) => {
    const [formData, setFormData] = useState<UploadThesisFormData>({
        thesisType: '',
        file: null,
        title: '',
        year: '',
    });

    const [errors, setErrors] = useState<{
        thesisType?: string;
        file?: string;
    }>({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            // Validate PDF file type
            if (selectedFile.type !== 'application/pdf') {
                setErrors(prev => ({ ...prev, file: 'Dozvoljeni su samo PDF fajlovi' }));
                setFormData(prev => ({ ...prev, file: null }));
                return;
            }

            setErrors(prev => ({ ...prev, file: undefined }));
            setFormData(prev => ({ ...prev, file: selectedFile }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const newErrors: { thesisType?: string; file?: string } = {};

        if (!formData.thesisType) {
            newErrors.thesisType = 'Tip rada je obavezan';
        }

        if (!formData.file) {
            newErrors.file = 'PDF fajl je obavezan';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!thesisContext?.id) {
            alert("Nedostaje ID studenta");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append('file', formData.file!);
            data.append('title', formData.title);
            data.append('thesisType', formData.thesisType);

            await uploadThesis(thesisContext.id, data);

            // Re-fetch or update state is handled via onClose or in Parent
            alert("Rad je uspešno otpremljen!");

            // Reset form and close modal
            setFormData({
                thesisType: '',
                file: null,
                title: '',
                year: '',
            });
            setErrors({});
            onClose(); // We might want to pass data back to parent
        } catch (err) {
            console.error("Failed to upload thesis:", err);
            alert("Došlo je do greške prilikom otpremanja rada.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form on close
        setFormData({
            thesisType: '',
            file: null,
            title: '',
            year: '',
        });
        setErrors({});
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Otpremi rad</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Zatvori modal"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Context Info (if provided) */}
                {thesisContext && (
                    <div className="px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Student:</span> {thesisContext.first_name} {thesisContext.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Postojeći naslov:</span> {thesisContext.thesis_title}
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Thesis Type - Required */}
                    <div>
                        <label htmlFor="thesisType" className="block text-sm font-semibold text-gray-700 mb-2">
                            Tip rada <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="thesisType"
                            value={formData.thesisType}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, thesisType: e.target.value as any }));
                                setErrors(prev => ({ ...prev, thesisType: undefined }));
                            }}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 text-black focus:ring-[#294a70] ${errors.thesisType ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="" className="text-gray-500">Izaberite tip rada...</option>
                            <option value="Osnovne studije" className="text-black">Osnovne studije</option>
                            <option value="Master studije" className="text-black">Master studije</option>
                            <option value="Specijalističke studije" className="text-black">Specijalističke studije</option>
                        </select>
                        {errors.thesisType && (
                            <p className="mt-1 text-sm text-red-500">{errors.thesisType}</p>
                        )}
                    </div>

                    {/* File Upload - Required */}
                    <div>
                        <label htmlFor="fileUpload" className="block text-sm font-semibold text-gray-700 mb-2">
                            Otpremi PDF <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fileUpload"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#294a70] ${errors.file ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {formData.file && (
                            <p className="mt-1 text-sm text-green-600">
                                Izabrano: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                        {errors.file && (
                            <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                        )}
                    </div>

                    {/* Thesis Title - Optional */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                            Naslov rada <span className="text-gray-400 text-xs">(opciono)</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Unesite naslov rada..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                        />
                    </div>

                    {/* Year - Optional */}
                    <div>
                        <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                            Godina <span className="text-gray-400 text-xs">(opciono)</span>
                        </label>
                        <input
                            id="year"
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                            placeholder="npr. 2024"
                            min="1900"
                            max="2100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-2 bg-[#294a70] text-white rounded-md hover:bg-[#1f3a5a] transition-colors font-medium flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Slanje...</span>
                                </>
                            ) : 'Otpremi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadThesisModal;
