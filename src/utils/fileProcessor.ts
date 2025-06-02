
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use the built-in worker from the npm package
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

export const extractContentFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  console.log('🔍 Processing file:', fileName, 'Type:', fileType);
  console.log('📁 File size:', file.size, 'bytes');

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
    console.error('❌ File processing error:', error);
    throw new Error(`Failed to process ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const extractPDFContent = async (file: File): Promise<string> => {
  console.log('📄 Starting PDF extraction...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ File converted to ArrayBuffer, size:', arrayBuffer.byteLength, 'bytes');
    
    console.log('🔧 Loading PDF document...');
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0
    }).promise;
    console.log('✅ PDF loaded successfully');
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    console.log(`📖 Processing PDF with ${numPages} pages`);
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        console.log(`📄 Processing page ${pageNum}/${numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        console.log(`📝 Page ${pageNum} extracted ${pageText.length} characters`);
        console.log(`📋 Page ${pageNum} content preview:`, pageText.substring(0, 100) + '...');
        
        if (pageText) {
          fullText += pageText + '\n\n';
        }
      } catch (pageError) {
        console.warn(`⚠️ Error processing page ${pageNum}:`, pageError);
        continue;
      }
    }
    
    if (!fullText.trim()) {
      throw new Error('No text content could be extracted from the PDF. The PDF might be image-based or corrupted.');
    }
    
    console.log(`✅ PDF extraction complete! Total characters: ${fullText.length}`);
    console.log('📋 Full content preview:', fullText.substring(0, 200) + '...');
    
    return fullText.trim();
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    throw error;
  }
};

const extractDOCXContent = async (file: File): Promise<string> => {
  console.log('📄 Starting DOCX extraction...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ DOCX file converted to ArrayBuffer, size:', arrayBuffer.byteLength, 'bytes');
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || !result.value.trim()) {
      throw new Error('No text content could be extracted from the DOCX file.');
    }
    
    console.log(`✅ DOCX extraction complete! Characters: ${result.value.length}`);
    console.log('📋 DOCX content preview:', result.value.substring(0, 200) + '...');
    
    return result.value.trim();
  } catch (error) {
    console.error('❌ DOCX extraction failed:', error);
    throw error;
  }
};

const extractTextContent = async (file: File): Promise<string> => {
  console.log('📄 Starting text file extraction...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim()) {
        console.log(`✅ Text extraction complete! Characters: ${text.length}`);
        console.log('📋 Text content preview:', text.substring(0, 200) + '...');
        resolve(text.trim());
      } else {
        reject(new Error('No text content found in the file.'));
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Text file reading failed');
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};
