from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase_client
from app.ai import stream_chat_completion, fetch_available_models
import json

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    message: str
    model_id: str
    conversation_id: str | None = None
    api_key: str | None = None

class ConversationCreate(BaseModel):
    title: str
    model_id: str

class ConversationUpdate(BaseModel):
    title: str

class ModelsRequest(BaseModel):
    api_key: str

@router.post("/chat")
async def chat(
    request: ChatRequest,
    user_data: tuple[str, str] = Depends(get_current_user)
):
    user_id, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    # Create or get conversation
    conv_id = request.conversation_id
    if not conv_id:
        result = supabase.table("conversations").insert({
            "user_id": user_id,
            "title": request.message[:60],
            "model_id": request.model_id
        }).execute()
        conv_id = result.data[0]["id"]
    
    # Save user message
    supabase.table("messages").insert({
        "conversation_id": conv_id,
        "role": "user",
        "content": request.message
    }).execute()
    
    # Get conversation history
    messages_result = supabase.table("messages")\
        .select("role,content")\
        .eq("conversation_id", conv_id)\
        .order("created_at")\
        .execute()
    
    messages = [{"role": m["role"], "content": m["content"]} for m in messages_result.data]
    
    # Stream response
    async def generate():
        assistant_content = []
        try:
            async for token in stream_chat_completion(messages, request.model_id, request.api_key):
                assistant_content.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"
            
            # Save assistant message
            full_response = "".join(assistant_content)
            if full_response:
                supabase.table("messages").insert({
                    "conversation_id": conv_id,
                    "role": "assistant",
                    "content": full_response
                }).execute()
            
            yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.get("/conversations")
async def list_conversations(user_data: tuple[str, str] = Depends(get_current_user)):
    user_id, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    result = supabase.table("conversations")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()
    
    return result.data

@router.post("/conversations")
async def create_conversation(
    request: ConversationCreate,
    user_data: tuple[str, str] = Depends(get_current_user)
):
    user_id, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    result = supabase.table("conversations").insert({
        "user_id": user_id,
        "title": request.title,
        "model_id": request.model_id
    }).execute()
    
    return result.data[0]

@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: str,
    user_data: tuple[str, str] = Depends(get_current_user)
):
    _, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    result = supabase.table("messages")\
        .select("*")\
        .eq("conversation_id", conversation_id)\
        .order("created_at")\
        .execute()
    
    return result.data

@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: str,
    request: ConversationUpdate,
    user_data: tuple[str, str] = Depends(get_current_user)
):
    _, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    result = supabase.table("conversations")\
        .update({"title": request.title})\
        .eq("id", conversation_id)\
        .execute()
    
    return result.data[0]

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_data: tuple[str, str] = Depends(get_current_user)
):
    _, access_token = user_data
    supabase = get_supabase_client(access_token)
    
    supabase.table("conversations").delete().eq("id", conversation_id).execute()
    return {"deleted": True}

@router.post("/models")
async def get_models(request: ModelsRequest):
    try:
        models = await fetch_available_models(request.api_key)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
