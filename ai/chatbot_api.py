import os
import sys
import pickle

import faiss
import google.generativeai as genai

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer


load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

gemini_model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# ---------------------------
# ABSOLUTE PATHS
# ---------------------------

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

INDEX_PATH = os.path.join(
    BASE_DIR,
    "vectorstore",
    "index.faiss"
)

CHUNKS_PATH = os.path.join(
    BASE_DIR,
    "vectorstore",
    "chunks.pkl"
)

# ---------------------------
# LOAD VECTOR DATABASE
# ---------------------------

index = faiss.read_index(
    INDEX_PATH
)

with open(
    CHUNKS_PATH,
    "rb"
) as f:
    chunks = pickle.load(f)

# ---------------------------
# LOAD EMBEDDING MODEL
# ---------------------------

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# ---------------------------
# GET QUERY
# ---------------------------

query = sys.argv[1]

# ---------------------------
# CREATE QUERY EMBEDDING
# ---------------------------

query_embedding = embedding_model.encode(
    [query]
)

# ---------------------------
# SEARCH FAISS
# ---------------------------

distances, indices = index.search(
    query_embedding,
    3
)

# ---------------------------
# BUILD CONTEXT
# ---------------------------

context = ""

for idx in indices[0]:

    if idx < len(chunks):

        context += (
            chunks[idx].page_content
            + "\n\n"
        )

# ---------------------------
# CREATE PROMPT
# ---------------------------

prompt = f"""
You are an AI assistant for a stock exchange simulator.

Use the context below to answer the question.

Context:
{context}

Question:
{query}

Answer clearly and concisely.
"""

# ---------------------------
# GEMINI RESPONSE
# ---------------------------

response = gemini_model.generate_content(
    prompt
)

print(
    response.text
)