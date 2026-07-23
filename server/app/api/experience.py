from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Experience
from app.schemas.portfolio import ExperienceCreate, ExperienceUpdate, ExperienceResponse

router = APIRouter()

@router.get("/", response_model=List[ExperienceResponse])
def get_experience(db: Session = Depends(get_db)):
    return db.query(Experience).all()

@router.post("/", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    exp_in: ExperienceCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    exp = Experience(**exp_in.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/{exp_id}", response_model=ExperienceResponse)
def update_experience(
    exp_id: int,
    exp_in: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    
    update_data = exp_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)
        
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    exp_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    db.delete(exp)
    db.commit()
    return None
