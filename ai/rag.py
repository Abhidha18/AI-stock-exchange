import os
import pickle

import faiss

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from sentence_transformers import SentenceTransformer


print("Loading documents...")

documents = []

for filename in os.listdir("docs"):

    if filename.endswith(".md"):

        with open(
            os.path.join("docs", filename),
            "r",
            encoding="utf-8"
        ) as f:

            content = f.read()

            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "source": filename
                    }
                )
            )

print(f"Loaded {len(documents)} documents")


print("Splitting documents into chunks...")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(
    documents
)

print(f"Created {len(chunks)} chunks")


print("Generating embeddings...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

texts = [
    chunk.page_content
    for chunk in chunks
]

embeddings = model.encode(
    texts,
    convert_to_numpy=True
)

print(
    f"Generated {len(embeddings)} embeddings"
)


print("Creating FAISS index...")

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(
    dimension
)

index.add(
    embeddings
)

print(
    f"Stored {index.ntotal} vectors"
)


print("Saving vector database...")

os.makedirs(
    "vectorstore",
    exist_ok=True
)

faiss.write_index(
    index,
    "vectorstore/index.faiss"
)

with open(
    "vectorstore/chunks.pkl",
    "wb"
) as f:

    pickle.dump(
        chunks,
        f
    )

print(
    "\nVector database created successfully!"
)