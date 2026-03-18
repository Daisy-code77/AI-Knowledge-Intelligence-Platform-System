import os
import PyPDF2
import docx
from fastapi import UploadFile, HTTPException
from typing import List, Dict, Any
import logging

from config import settings

logger = logging.getLogger(__name__)

class DocumentProcessor:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        """Save an uploaded file to the local directory."""
        file_location = f"{settings.UPLOAD_DIR}/{upload_file.filename}"
        try:
            with open(file_location, "wb+") as file_object:
                content = await upload_file.read()
                file_object.write(content)
            return file_location
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    @staticmethod
    def extract_text(file_path: str, filename: str) -> str:
        """Extract text based on file extension."""
        ext = filename.split('.')[-1].lower()
        try:
            if ext == 'pdf':
                return DocumentProcessor._extract_from_pdf(file_path)
            elif ext == 'docx':
                return DocumentProcessor._extract_from_docx(file_path)
            elif ext == 'txt':
                return DocumentProcessor._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {ext}")
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            raise HTTPException(status_code=500, detail=f"Text extraction failed: {e}")

    @staticmethod
    def _extract_from_pdf(file_path: str) -> str:
        text = ""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    @staticmethod
    def _extract_from_docx(file_path: str) -> str:
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    @staticmethod
    def _extract_from_txt(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()

    @staticmethod
    def chunk_text(text: str, filename: str) -> List[Dict[str, Any]]:
        """
        Split text into chunks of specified size with overlap.
        Returns a list of dictionaries containing the chunk and metadata.
        """
        # Basic character-based recursive splitting logic
        chunks = []
        start = 0
        text_length = len(text)
        
        chunk_idx = 0
        while start < text_length:
            end = start + settings.CHUNK_SIZE
            
            # Try to snap to the nearest paragraph or sentence boundary if we aren't at the end
            if end < text_length:
                # Look for a newline or period within the last 100 characters of the chunk
                search_area = text[max(start, end-100):end]
                last_newline = search_area.rfind('\n')
                last_period = search_area.rfind('. ')
                
                if last_newline != -1:
                    end = max(start, end - 100) + last_newline + 1
                elif last_period != -1:
                    end = max(start, end - 100) + last_period + 2
            
            chunk_text = text[start:end].strip()
            if chunk_text:  # Avoid empty chunks
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "source": filename,
                        "chunk_index": chunk_idx
                    }
                })
                chunk_idx += 1
                
            start = end - settings.CHUNK_OVERLAP
            
        return chunks
