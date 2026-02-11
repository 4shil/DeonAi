from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    model_id: str
    conversation_id: str | None = None
    api_key: str | None = None  # User-provided API key


class CreateConversationRequest(BaseModel):
    title: str | None = None
    model_id: str


class UpdateConversationRequest(BaseModel):
    title: str


class ModelsRequest(BaseModel):
    api_key: str  # User-provided API key for fetching models
