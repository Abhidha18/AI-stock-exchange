import pickle

import faiss

from sentence_transformers import SentenceTransformer


print("Loading vector database...")

index = faiss.read_index(
    "vectorstore/index.faiss"
)

with open(
    "vectorstore/chunks.pkl",
    "rb"
) as f:

    chunks = pickle.load(f)

print(
    f"Loaded {len(chunks)} chunks"
)


model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


while True:

    query = input("\nAsk: ")

    if query.lower() == "exit":
        break

    query_embedding = model.encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding,
        3
    )

    print("\n===== RETRIEVED CONTEXT =====\n")

    for idx in indices[0]:

        if idx < len(chunks):

            print(
                chunks[idx].page_content
            )

            print(
                "\n---------------------\n"
            )