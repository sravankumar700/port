from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import SiteSettings, SocialLink
from app.schemas.portfolio import SiteSettingsResponse, SiteSettingsCreate, SocialLinkResponse, SocialLinkCreate

router = APIRouter()

# --- Site Settings Endpoints ---

@router.get("/site", response_model=Dict[str, str])
def get_site_settings(db: Session = Depends(get_db)):
    settings_list = db.query(SiteSettings).all()
    return {setting.key: setting.value for setting in settings_list}

@router.post("/site", response_model=SiteSettingsResponse)
def update_site_setting(
    setting_in: SiteSettingsCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    setting = db.query(SiteSettings).filter(SiteSettings.key == setting_in.key).first()
    if not setting:
        setting = SiteSettings(key=setting_in.key, value=setting_in.value)
        db.add(setting)
    else:
        setting.value = setting_in.value
    db.commit()
    db.refresh(setting)
    return setting

# --- Social Links Endpoints ---

@router.get("/socials", response_model=List[SocialLinkResponse])
def get_social_links(db: Session = Depends(get_db)):
    return db.query(SocialLink).all()

@router.post("/socials", response_model=SocialLinkResponse, status_code=status.HTTP_201_CREATED)
def create_social_link(
    social_in: SocialLinkCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    social = SocialLink(**social_in.model_dump())
    db.add(social)
    db.commit()
    db.refresh(social)
    return social

@router.put("/socials/{social_id}", response_model=SocialLinkResponse)
def update_social_link(
    social_id: int,
    social_in: SocialLinkCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    social = db.query(SocialLink).filter(SocialLink.id == social_id).first()
    if not social:
        raise HTTPException(status_code=404, detail="Social link not found")
        
    for field, value in social_in.model_dump().items():
        setattr(social, field, value)
        
    db.commit()
    db.refresh(social)
    return social

@router.delete("/socials/{social_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_social_link(
    social_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    social = db.query(SocialLink).filter(SocialLink.id == social_id).first()
    if not social:
        raise HTTPException(status_code=404, detail="Social link not found")
    db.delete(social)
    db.commit()
    return None
