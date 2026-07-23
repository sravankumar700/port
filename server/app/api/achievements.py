from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Achievement
from app.schemas.portfolio import AchievementCreate, AchievementUpdate, AchievementResponse

router = APIRouter()

@router.get("/", response_model=List[AchievementResponse])
def get_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).all()

@router.post("/", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    ach_in: AchievementCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    ach = Achievement(**ach_in.model_dump())
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach

@router.put("/{ach_id}", response_model=AchievementResponse)
def update_achievement(
    ach_id: int,
    ach_in: AchievementUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement record not found")
    
    update_data = ach_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ach, field, value)
        
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach

@router.delete("/{ach_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_achievement(
    ach_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    ach = db.query(Achievement).filter(Achievement.id == ach_id).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement record not found")
    db.delete(ach)
    db.commit()
    return None
