
export const fileToGenerativePart = async (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};
