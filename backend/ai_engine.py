import os
import time
from typing import List, Dict, Any
import logging
from config import settings

logger = logging.getLogger(__name__)

# Defaulting to standard openai SDK format for generic local/online models if needed
# We can also handle google-genai based on standard practices
try:
    from google import genai
    from google.genai import types
    has_google = True
except ImportError:
    has_google = False

class AIEngine:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        if has_google and self.api_key and self.api_key.strip() != "your_api_key_here":
            self.client = genai.Client(api_key=self.api_key)
            self.model_name = settings.PRIMARY_AI_MODEL
            self.fallback_model_name = settings.SECONDARY_AI_MODEL
        else:
            self.client = None
            logger.warning("No Google GenAI API key found or package missing. AI features will return mock responses.")

    def _generate_content(self, prompt: str, mock_type: str = "chat") -> str:
        """Helper to call the AI model."""
        if not self.client:
            # Robust mock responses so UI features work without an API key
            time.sleep(1) # simulate network delay
            if mock_type == "flashcards":
                return "Q: What is the main topic of this document?\nA: It covers AI Knowledge Platforms.\n---\nQ: How does RAG work?\nA: Retrieval-Augmented Generation connects documents to LLMs.\n---\nQ: What is FAISS?\nA: A library for efficient similarity search.\n---\nQ: What is a Vector Database?\nA: It stores text as numerical embeddings for fast search.\n---\nQ: What is FastAPI?\nA: A modern web framework for Python.\n---"
            elif mock_type == "quiz":
                return "1. What is the primary purpose of this system?\nA) Playing games\nB) Knowledge Management\nC) Video editing\nD) Data mining\nCorrect: B\n\n2. Which technology is used for the frontend?\nA) Angular\nB) Vue\nC) React/Vite\nD) Svelte\nCorrect: C\n\n3. What does RAG stand for?\nA) Random Access Generation\nB) Retrieval-Augmented Generation\nC) React And Go\nD) Rapid API Growth\nCorrect: B"
            elif mock_type == "summary":
                return "### Document Summary (Mock)\n\nThis document appears to detail the implementation of a modern AI Knowledge Intelligence Platform. It outlines the architecture combining a React frontend with a FastAPI backend.\n\n**Key Themes:**\n- **Document Processing:** Extracting and chunking text from PDFs and Word documents.\n- **Semantic Search:** Using local vector stores to retrieve relevant data.\n- **AI Integration:** Using LLMs to generate answers, flashcards, and quizzes."
            elif mock_type == "graph":
                return '{"nodes": [{"id": "AI Platform", "group": 1}, {"id": "FastAPI", "group": 2}, {"id": "React", "group": 2}, {"id": "FAISS", "group": 3}, {"id": "RAG", "group": 3}], "links": [{"source": "AI Platform", "target": "FastAPI", "value": 1}, {"source": "AI Platform", "target": "React", "value": 1}, {"source": "RAG", "target": "FAISS", "value": 2}, {"source": "FastAPI", "target": "RAG", "value": 2}]}'
            else:
                return "This is a Mock AI Response. To receive real dynamic answers based on your documents, please configure the GOOGLE_API_KEY in the backend/.env file."
        
        # 1-2s delay between consecutive calls to avoid general overload
        time.sleep(1.5)

        max_retries = 3
        models_to_try = [self.model_name, self.fallback_model_name]

        last_error = "Unknown"
        for model in models_to_try:
            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            temperature=0.2, # Low temperature for more factual answers
                        )
                    )
                    return response.text
                except Exception as e:
                    last_error = str(e)
                    error_msg = last_error.lower()
                    if "503" in error_msg or "exhausted" in error_msg or "quota" in error_msg or "overloaded" in error_msg or "529" in error_msg:
                        logger.warning(f"Capacity issue with {model} (attempt {attempt + 1}/{max_retries}): {e}. Retrying in 2.5s...")
                        time.sleep(2.5)
                        continue
                    else:
                        logger.error(f"Error calling AI with {model}: {e}")
                        break # Break retry loop on non-capacity errors and try next model
                        
        return f"Error: All models and retries failed due to API issues. Last error: {last_error}"

    def answer_question(self, question: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        RAG workflow: Generate an answer based ONLY on the provided document chunks
        also returns the citations used.
        """
        context_text = ""
        citations = []
        
        for i, chunk in enumerate(retrieved_chunks):
            content = chunk['content']['text']
            source = chunk['content']['source']
            context_text += f"\n--- Document {i+1}: {source} ---\n{content}\n"
            citations.append({
                "source": source,
                "text": content,
                "score": chunk['score']
            })

        prompt = f"""You are a helpful AI assistant for a local Knowledge Management System (similar to NotebookLM).
Your task is to answer the user's question based strictly on the provided context. If the answer is not in the context, say "I don't have enough information in the uploaded documents to answer that."

Context:
{context_text}

User Question: {question}

Answer in markdown format, and be clear and concise. If you quote specific facts, you may optionally mention the document name if helpful."""

        answer = self._generate_content(prompt, mock_type="chat")

        return {
            "answer": answer,
            "citations": citations
        }

    def summarize_document(self, whole_text: str, filename: str) -> str:
        """Generate a concise summary of the document."""
        # Truncate text if it's monstrously huge just to be safe (or rely on gemini's large context)
        safe_text = whole_text[:100000] # roughly 100k chars ~25k tokens
        
        prompt = f"""Please provide a comprehensive but concise markdown summary of the following document named "{filename}".
Include:
- A brief 1-paragraph overview
- Bullet points of key themes or findings

Document Content:
{safe_text}"""

        return self._generate_content(prompt, mock_type="summary")

    def generate_flashcards(self, text: str) -> str:
        """Generate study flashcards from a chunk of text."""
        prompt = f"""Generate 5 study flashcards based on the following text.
Format the output EXACTLY like this for each flashcard:
Q: [Question]
A: [Answer]
---

Text:
{text[:20000]}""" # sending a reasonable chunk
        return self._generate_content(prompt, mock_type="flashcards")

    def generate_quiz(self, text: str) -> str:
        """Generate a multiple choice quiz from a chunk of text."""
        prompt = f"""Generate a 3-question multiple choice quiz based on the following text.
Format the output EXACTLY like this:
1. [Question]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [Letter]

Text:
{text[:20000]}"""
        return self._generate_content(prompt, mock_type="quiz")

    def generate_graph_data(self, text: str) -> str:
        """Extract entities and relationships for a knowledge graph."""
        prompt = f"""Analyze the text and extract 5 key technical entities and their relationships.
Output ONLY valid JSON in this format:
{{"nodes": [{{"id": "Entity1", "group": 1}}], "links": [{{"source": "Entity1", "target": "Entity2", "value": 1}}]}}
Text: {text[:10000]}"""
        return self._generate_content(prompt, mock_type="graph")
