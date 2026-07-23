import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Resume
from app.schemas.portfolio import ResumeResponse

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.get("/", response_model=ResumeResponse)
def get_resume(db: Session = Depends(get_db)):
    # Get the latest resume record
    resume = db.query(Resume).order_by(Resume.last_updated.desc()).first()
    if not resume:
        # Default empty record if none exists
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return resume

@router.post("/", response_model=ResumeResponse)
def upload_resume(
    version: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # Ensure upload directory exists
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Standardize name or use filename safely
    file_path = os.path.join(UPLOAD_DIR, "resume.pdf")
    
    # Save file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    # Create or update resume entry in DB
    resume = db.query(Resume).first()
    if not resume:
        resume = Resume(version=version, file_url=f"/uploads/resume.pdf")
        db.add(resume)
    else:
        resume.version = version
        resume.file_url = f"/uploads/resume.pdf"
        
    db.commit()
    db.refresh(resume)
    return resume
