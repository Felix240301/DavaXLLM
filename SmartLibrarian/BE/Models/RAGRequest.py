from pydantic import BaseModel

class RAGRequest(BaseModel):
    query_texts: list[str]