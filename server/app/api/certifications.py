from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Certification
from app.schemas.portfolio import CertificationCreate, CertificationUpdate, CertificationResponse

router = APIRouter()

@router.get("/", response_model=List[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(Certification).all()

@router.post("/", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def create_certification(
    cert_in: CertificationCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    cert = Certification(**cert_in.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.put("/{cert_id}", response_model=CertificationResponse)
def update_certification(
    cert_id: int,
    cert_in: CertificationUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    
    update_data = cert_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cert, field, value)
        
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(
    cert_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return None
