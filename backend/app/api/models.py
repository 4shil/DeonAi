from pydantic import BaseModel, Field, validator

from app.core.config import settings


def validate_model_id(model_id: str) -> str:
    if model_id not in settings.allowed_model_ids:
        raise ValueError("Unsupported model_id")
    return model_id


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    model_id: str
    conversation_id: str | None = None

    _model_id_allowed = validator("model_id", allow_reuse=True)(validate_model_id)


class CreateConversationRequest(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    model_id: str

    _model_id_allowed = validator("model_id", allow_reuse=True)(validate_model_id)


class UpdateConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
