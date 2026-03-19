# AI-Knowledge Intelligence Platform System 🧠✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.109-009688.svg)](https://fastapi.tiangolo.com/)

> **Unlock the full potential of your documents.** A premium, AI-powered knowledge management system inspired by the next generation of intelligent assistants.

---

## 🌟 Overview

The **AI-Knowledge Intelligence Platform System** is a sophisticated full-stack application designed to transform static documents into dynamic, interactive knowledge bases. By leveraging state-of-the-art **Retrieval-Augmented Generation (RAG)** and **Knowledge Graph** visualizations, it allows users to upload, process, and converse with their data like never before.

---

## ✨ Key Features

- 📑 **Intelligent Document Processing**: Deep extraction and processing of PDF, DOCX, and Text files with structure awareness.
- 💬 **RAG-Powered Chat**: Ask complex questions and receive accurate, cited answers grounded directly in your uploaded source material.
- 🕸️ **Dynamic Knowledge Graph**: Visualize connections between key concepts and entities across your entire document library.
- 📊 **Smart Summarization Dashboard**: Get instant high-level insights and key highlights from lengthy documents.
- 🎨 **Premium Glassmorphic UI**: A stunning, modern interface built with Framer Motion for smooth, fluid interactions.
- ⚡ **Lightning Fast Search**: Semantic search capabilities to find the exact information you need, when you need it.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Graphs**: [D3.js](https://d3js.org/) & `react-force-graph`
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Core**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/) (via `google-genai`)
- **Embeddings**: `sentence-transformers`
- **Vector Database**: [FAISS](https://github.com/facebookresearch/faiss)
- **Processing**: `PyPDF2`, `python-docx`

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file and add your GEMINI API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture

The platform follows a modern **RAG (Retrieval-Augmented Generation)** architecture:
1. **Ingestion**: Documents are uploaded and parsed using specialized processors.
2. **Chunking & Embedding**: Text is split into semantic chunks and converted into high-dimensional vectors.
3. **Vector Storage**: Chunks are stored in a FAISS index for high-performance similarity search.
4. **Retrieval**: User queries trigger a similarity search to find the most relevant context.
5. **Generation**: The retrieved context is passed to Gemini Pro to generate grounded, cited responses.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by Daisy </p>
