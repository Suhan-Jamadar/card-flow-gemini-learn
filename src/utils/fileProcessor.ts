
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractContentFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  console.log('Processing file:', fileName, 'Type:', fileType);

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractPDFContent(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      return await extractDOCXContent(file);
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      throw new Error('DOC files are not supported. Please use DOCX format instead.');
    } else if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
      return await extractTextContent(file);
    } else {
      throw new Error(`File type "${fileType}" is not supported. Please use PDF, DOCX, or TXT files.`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const extractPDFContent = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const numPages = pdf.numPages;
  
  console.log(`Processing PDF with ${numPages} pages`);
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    } catch (pageError) {
      console.warn(`Error processing page ${pageNum}:`, pageError);
      continue;
    }
  }
  
  if (!fullText.trim()) {
    throw new Error('No text content could be extracted from the PDF. The PDF might be image-based or corrupted.');
  }
  
  console.log(`Extracted ${fullText.length} characters from PDF`);
  return fullText.trim();
};

const extractDOCXContent = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  if (!result.value || !result.value.trim()) {
    throw new Error('No text content could be extracted from the DOCX file.');
  }
  
  console.log(`Extracted ${result.value.length} characters from DOCX`);
  return result.value.trim();
};

const extractTextContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim()) {
        console.log(`Extracted ${text.length} characters from text file`);
        resolve(text.trim());
      } else {
        reject(new Error('No text content found in the file.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file, 'UTF-8');
  });
};
