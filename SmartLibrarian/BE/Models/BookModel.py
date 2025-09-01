from pydantic import BaseModel

class BookModel(BaseModel):
    title: str
    author: str = "Unknown Author"
    summary: str
    genre: str = "Unknown Genre"

    def __str__(self):
        return f"Book(title={self.title}, author={self.author}, genre={self.genre}, summary={self.summary})"