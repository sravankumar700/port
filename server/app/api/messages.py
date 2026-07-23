from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Message
from app.schemas.portfolio import MessageCreate, MessageUpdate, MessageResponse

router = APIRouter()

@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def submit_message(message_in: MessageCreate, db: Session = Depends(get_db)):
    message = Message(**message_in.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/", response_model=List[MessageResponse])
def get_messages(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    return db.query(Message).order_by(Message.created_at.desc()).all()

@router.put("/{message_id}", response_model=MessageResponse)
def update_message_status(
    message_id: int,
    status_in: MessageUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    update_data = status_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(message, field, value)
        
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(message)
    db.commit()
    return None
