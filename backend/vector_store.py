import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import logging
from typing import List, Dict, Any, Tuple

from config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.dimension = self.embedding_model.get_sentence_embedding_dimension()
        self.index_file = os.path.join(settings.VECTOR_STORE_DIR, "index.faiss")
        self.metadata_file = os.path.join(settings.VECTOR_STORE_DIR, "metadata.json")
        
        # Load or initialize FAISS index and metadata
        if os.path.exists(self.index_file):
            self.index = faiss.read_index(self.index_file)
            self.metadata = self._load_metadata()
            logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors.")
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = {}  # Store ID -> Metadata dictionary
            logger.info("Initialized new FAISS index.")

    def _load_metadata(self) -> Dict[str, Any]:
        if os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'r', encoding='utf-8') as f:
                # json stores keys as strings, so we ensure int conversion later if needed
                return json.load(f)
        return {}

    def _save_metadata(self):
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=4)

    def _save_index(self):
        faiss.write_index(self.index, self.index_file)
        self._save_metadata()

    def add_texts(self, texts: List[str], metadatas: List[Dict[str, Any]]):
        """Add new document chunks to the index."""
        if not texts:
            return
            
        # Get embeddings
        embeddings = self.embedding_model.encode(texts)
        # Convert to numpy array of float32 for FAISS
        embeddings_np = np.array(embeddings).astype('float32')

        # Add to FAISS index
        start_id = self.index.ntotal
        self.index.add(embeddings_np)
        
        # Add metadata for retrieval
        for i, (text, meta) in enumerate(zip(texts, metadatas)):
            doc_id = str(start_id + i)
            # We store the pure text in the metadata as well so we can retrieve it directly
            meta['text'] = text
            self.metadata[doc_id] = meta
            
        self._save_index()
        logger.info(f"Added {len(texts)} chunks to the vector store.")

    def similarity_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search the FAISS index for the most similar chunks to a query."""
        if self.index.ntotal == 0:
            return []

        # Encode query
        query_embedding = self.embedding_model.encode([query])
        query_np = np.array(query_embedding).astype('float32')
        
        # Perform distance search (L2 distance)
        distances, indices = self.index.search(query_np, top_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1:  # -1 means no result found in faiss
                str_idx = str(idx)
                if str_idx in self.metadata:
                    result_item = {
                        "content": self.metadata[str_idx],
                        "score": float(dist) # Return distance, lower is more similar
                    }
                    results.append(result_item)
                    
        return results

    def get_all_document_names(self) -> List[str]:
        """Return a unique list of document names currently in the store."""
        sources = set()
        for meta in self.metadata.values():
            if "source" in meta:
                sources.add(meta["source"])
        return list(sources)
