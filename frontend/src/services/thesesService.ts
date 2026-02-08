import api from "./api";

export interface Thesis {
    id: number;
    first_name: string;
    last_name: string;
    thesis_title: string;
    thesis_document_url: string;
    thesis_type?: string;
}

export const getTheses = async (): Promise<Thesis[]> => {
    const response = await api.get("/theses");
    return response.data;
};

export const deleteThesis = async (id: number): Promise<void> => {
    await api.delete(`/theses/${id}`);
};

export const uploadThesis = async (id: number, formData: FormData): Promise<void> => {
    await api.post(`/theses/upload/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
