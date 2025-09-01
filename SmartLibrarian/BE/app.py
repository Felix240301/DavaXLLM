import json
import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Models.BookModel import BookModel
from Models.UserRequest import UserRequest
from openai import OpenAI
import os
import dotenv


origins = [
    "http://localhost:5173",
]

tools = tools = [{
  "type": "function",
  "name": "get_summary_by_title",   
  "description": "Retrieves the summary of a book by its title.",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {"type": "string", "description": "Book title"}
    },
    "required": ["title"],
    "additionalProperties": False
  }
}]

api_key = 'API_KEY'

chatclient = OpenAI(api_key=api_key)

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="book_summary")


app = FastAPI(title="Smart Librarian API", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RAGRequest(BaseModel):
    query_texts: list[str]
    
@app.post("/ask_smart_librarian")
async def ask_smart_librarian(request: UserRequest):
    input_list = []
    
    try:
        response = chatclient.responses.parse(

            model="gpt-4.1-nano-2025-04-14",
               instructions=(
                "You are a librarian that identifies interests from user queries. "
                "You need to extract the main topics of interest so that you can recommend books. "
                "If you cannot identify any topics, try to think of a book topic based on the user's query and personality."
            ),
            input=[
                {"role": "user", "content": request.text}
            ]+ input_list,
            text_format=RAGRequest,

        )
        rag_request: RAGRequest = response.output_parsed
        retrieved_data = await get_relevant_documents(rag_request.query_texts)
        book_titles = retrieved_data.get("ids")
        documents = retrieved_data.get("documents")

        books = []
        for _ in range(len(book_titles[0])):
           book: BookModel = BookModel(
               title=book_titles[0][_],
               summary=documents[0][_]
           )
           books.append(book.__str__())
        
        input_list = [{"role": "user", "content": request.text},
                      {"role": "user", "content":  "Books: \n".join(books)}
                    ]


        recommendation_message = chatclient.responses.create(
            model="gpt-4.1-nano-2025-04-14",
            instructions=(
                "You are a smart librarian. Given a user query and a set of documents, "
                "select the most relevant document that best matches the user's interest. "
                "Return the title of the book which is the best match. If none are relevant, respond with 'Sorry I have nothing to recommend.'"
                "Always replace underscores with spaces in the book titles and ensure the titles are properly formatted."
                "Do not give information about any other books that aren't in the provided list."
            ),
            input=input_list,
            tools=tools,
        )

        for item in getattr(recommendation_message, "output_tool_calls", []):
            if item.function.name == "get_summary_by_title":
                args = json.loads(item.function.arguments or "{}") 
                title = args["title"]
                summary = await get_summary_by_title(title)
                input_list.append({
                        "type": "function_call_output",
                        "call_id": item.id,                 
                        "output": json.dumps({"summary": summary})
                })

        final_response = chatclient.responses.create(
        model="gpt-4.1-nano-2025-04-14",
        instructions=("Respond to the user based on the provided information. If a book summary is provided present said summary to the user. If no relevant book is found, apologize and state that you have nothing to recommend."
                    "Do not give information about any other books that aren't in the provided list."),
        input=input_list,
        )
        input_list.append({"role": "assistant", "content": final_response.output_text})
        select_response = final_response
        if not select_response.output_text:
            return {"response": "No response from model."}
        return {"response": select_response.output_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_relevant_documents(query_texts: list[str]):
    query: str = ""
    for text in query_texts:
        query += " " + text
    query = query.strip()
    return collection.query(
        query_texts=query,
        n_results=3,
        include=["documents"]
    )

@app.post("/add_documents")
async def add_documents(ids: list[str], documents: list[str], metadatas: list[dict]):
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
    )

async def get_summary_by_title(title: str):
    result = collection.query(
        query_texts=[title],
        n_results=1,
        include=["documents", "metadatas"]
    )
    return result.get("documents", [])[0] 
