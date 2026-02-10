from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    model_id: str
    conversation_id: str | None = None


class CreateConversationRequest(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    model_id: str


class UpdateConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
