import os
import pickle

import faiss
import google.generativeai as genai

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer


load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

print("Loading vector database...")

index = faiss.read_index(
    "vectorstore/index.faiss"
)

with open(
    "vectorstore/chunks.pkl",
    "rb"
) as f:

    chunks = pickle.load(f)

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("AI Stock Exchange Assistant Ready!")

while True:

    query = input("\nAsk: ")

    if query.lower() == "exit":
        break

    query_embedding = embedding_model.encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding,
        3
    )

    context = ""

    for idx in indices[0]:

        if idx < len(chunks):

            context += (
                chunks[idx].page_content
                + "\n\n"
            )

    prompt = f"""
You are an AI assistant for a stock exchange simulator.

Use the context below to answer the question.

Context:
{context}

Question:
{query}

Answer in a clear and educational way.
"""

    response = model.generate_content(
        prompt
    )

    print(
        "\n===== ANSWER =====\n"
    )

    print(
        response.text
    )