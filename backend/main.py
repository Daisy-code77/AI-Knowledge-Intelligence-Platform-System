from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import uvicorn
import logging

from config import settings
from document_processor import DocumentProcessor
from vector_store import VectorStore
from ai_engine import AIEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS config to allow local React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Services
vector_store = VectorStore()
ai_engine = AIEngine()

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Knowledge Intelligence Platform API"}

@app.post(f"{settings.API_V1_STR}/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document, extract text, chunk it, and store into the Vector DB."""
    try:
        # Save file
        file_path = await DocumentProcessor.save_upload_file(file)
        
        # Extract Text
        full_text = DocumentProcessor.extract_text(file_path, file.filename)
        
        # Chunk Text
        chunks = DocumentProcessor.chunk_text(full_text, file.filename)
        
        # Format for Vector Store
        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]
        
        # Store Embeddings
        vector_store.add_texts(texts, metadatas)
        
        # Clean up temporary upload file if desired, keeping for now.
        # os.remove(file_path)
        
        return {
            "status": "success", 
            "filename": file.filename, 
            "chunks_processed": len(texts)
        }
    except Exception as e:
        logger.error(f"Failed to process upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{settings.API_V1_STR}/documents")
def get_documents():
    """List all documents currently loaded into the system."""
    docs = vector_store.get_all_document_names()
    return {"documents": docs}

@app.post(f"{settings.API_V1_STR}/chat")
async def chat_with_docs(query: str = Form(...)):
    """Ask a question to the AI using the loaded documents as context."""
    # Retrieve top 5 relevant chunks
    retrieved_docs = vector_store.similarity_search(query, top_k=5)
    
    if not retrieved_docs:
        return {"answer": "No relevant documents found. Please upload some files first.", "citations": []}
        
    # Generate RAG Answer
    response = ai_engine.answer_question(query, retrieved_docs)
    return response

@app.post(f"{settings.API_V1_STR}/summarize")
async def get_summary(filename: str = Form(...)):
    """Attempt to summarize a specific document."""
    # Find all chunks belonging to the file and reconstruct roughly
    all_docs = vector_store.metadata.values()
    file_chunks = [meta for meta in all_docs if meta.get("source") == filename]
    
    if not file_chunks:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    # Sort by chunk index and rebuild text
    file_chunks.sort(key=lambda x: x.get("chunk_index", 0))
    full_text = " ".join([c["text"] for c in file_chunks])
    
    summary = ai_engine.summarize_document(full_text, filename)
    return {"summary": summary}
    
@app.post(f"{settings.API_V1_STR}/generate-study")
async def generate_study_materials(filename: str = Form(...), type: str = Form(...)):
    """Generate study flashcards or quizzes for a document."""
    all_docs = vector_store.metadata.values()
    file_chunks = [meta for meta in all_docs if meta.get("source") == filename]
    
    if not file_chunks:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    # Grab the top few chunks to prevent passing too much context to the generative logic initially
    file_chunks.sort(key=lambda x: x.get("chunk_index", 0))
    # Taking first 5 chunks for study material generation to avoid massive cost/latency
    abridged_text = " ".join([c["text"] for c in file_chunks[:5]])
    
    if type == "flashcards":
        result = ai_engine.generate_flashcards(abridged_text)
    elif type == "quiz":
        result = ai_engine.generate_quiz(abridged_text)
    else:
        raise HTTPException(status_code=400, detail="Invalid study material type.")
        
    return {"result": result}

@app.post(f"{settings.API_V1_STR}/generate-graph")
async def generate_graph_data(filename: str = Form(...)):
    """Generate entity relationship graph data for a document."""
    all_docs = vector_store.metadata.values()
    file_chunks = [meta for meta in all_docs if meta.get("source") == filename]
    
    if not file_chunks:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    file_chunks.sort(key=lambda x: x.get("chunk_index", 0))
    abridged_text = " ".join([c["text"] for c in file_chunks[:5]])
    
    result = ai_engine.generate_graph_data(abridged_text)
    return {"result": result}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
