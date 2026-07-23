from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Education
from app.schemas.portfolio import EducationCreate, EducationUpdate, EducationResponse

router = APIRouter()

@router.get("/", response_model=List[EducationResponse])
def get_education(db: Session = Depends(get_db)):
    return db.query(Education).all()

@router.post("/", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def create_education(
    edu_in: EducationCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    edu = Education(**edu_in.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.put("/{edu_id}", response_model=EducationResponse)
def update_education(
    edu_id: int,
    edu_in: EducationUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    
    update_data = edu_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(edu, field, value)
        
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

@router.delete("/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    edu_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    db.delete(edu)
    db.commit()
    return None
