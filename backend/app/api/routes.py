import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.models import (
    ChatRequest,
    CreateConversationRequest,
    UpdateConversationRequest,
)
from app.core.auth import get_auth_context
from app.db.supabase import get_user_supabase_client
from app.services.openrouter import stream_chat

router = APIRouter()


@router.post("/chat")
async def chat(
    payload: ChatRequest,
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    user_id, access_token = auth_context
    supabase = get_user_supabase_client(access_token)

    conversation_id = payload.conversation_id
    if not conversation_id:
        title = payload.message.strip()[:60] or "New conversation"
        response = (
            supabase.table("conversations")
            .insert(
                {
                    "user_id": user_id,
                    "title": title,
                    "model_id": payload.model_id,
                }
            )
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create conversation")
        conversation_id = response.data[0]["id"]
    else:
        supabase.table("conversations").update(
            {"model_id": payload.model_id}
        ).eq("id", conversation_id).execute()

    supabase.table("messages").insert(
        {
            "conversation_id": conversation_id,
            "role": "user",
            "content": payload.message,
        }
    ).execute()

    message_rows = (
        supabase.table("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
        .data
        or []
    )
    messages = [
        {"role": row["role"], "content": row["content"]} for row in message_rows
    ]

    async def event_stream():
        assistant_chunks: list[str] = []
        try:
            async for token in stream_chat(messages, payload.model_id):
                assistant_chunks.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        assistant_content = "".join(assistant_chunks).strip()
        if assistant_content:
            supabase.table("messages").insert(
                {
                    "conversation_id": conversation_id,
                    "role": "assistant",
                    "content": assistant_content,
                }
            ).execute()

        yield (
            "data: "
            + json.dumps({"done": True, "conversation_id": conversation_id})
            + "\n\n"
        )

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/conversations")
def list_conversations(
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    user_id, access_token = auth_context
    supabase = get_user_supabase_client(access_token)
    response = (
        supabase.table("conversations")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/conversations")
def create_conversation(
    payload: CreateConversationRequest,
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    user_id, access_token = auth_context
    supabase = get_user_supabase_client(access_token)
    title = (payload.title or "New conversation").strip()
    response = (
        supabase.table("conversations")
        .insert(
            {
                "user_id": user_id,
                "title": title,
                "model_id": payload.model_id,
            }
        )
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")
    return response.data[0]


@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    _, access_token = auth_context
    supabase = get_user_supabase_client(access_token)
    response = (
        supabase.table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return response.data or []


@router.patch("/conversations/{conversation_id}")
def update_conversation(
    conversation_id: str,
    payload: UpdateConversationRequest,
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    _, access_token = auth_context
    supabase = get_user_supabase_client(access_token)
    response = (
        supabase.table("conversations")
        .update({"title": payload.title.strip()})
        .eq("id", conversation_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return response.data[0]


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    auth_context: tuple[str, str] = Depends(get_auth_context),
):
    _, access_token = auth_context
    supabase = get_user_supabase_client(access_token)
    supabase.table("conversations").delete().eq("id", conversation_id).execute()
    return {"deleted": True}
