
declare const mammoth: any;
declare const pdfjsLib: any;
declare const Tesseract: any;

// Text extraction from PDF
export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ');
  }
  return text;
};

// Text extraction from DOCX
export const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
};

// Text extraction from Image (OCR)
export const extractTextFromImage = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
    const worker = await Tesseract.createWorker({
        logger: (m: any) => {
            if (m.status === 'recognizing text') {
                onProgress(Math.round(m.progress * 100));
            }
        },
    });
    await worker.load();
    await worker.loadLanguage('deu');
    await worker.initialize('deu');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
};

// Main processor function
export const processFile = async (file: File, onProgress: (progress: number) => void): Promise<string> => {
  if (file.type === 'application/pdf') {
    return extractTextFromPdf(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(file);
  } else if (file.type.startsWith('image/')) {
    return extractTextFromImage(file, onProgress);
  } else {
    throw new Error('Unsupported file type.');
  }
};
