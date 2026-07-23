from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import Blog
from app.schemas.portfolio import BlogCreate, BlogUpdate, BlogResponse

router = APIRouter()

@router.get("/", response_model=List[BlogResponse])
def get_blogs(
    category: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Blog)
    if published_only:
        query = query.filter(Blog.published == True)
    if category:
        query = query.filter(Blog.category.ilike(f"%{category}%"))
    return query.order_by(Blog.created_at.desc()).all()

@router.get("/{slug_or_id}", response_model=BlogResponse)
def get_blog(slug_or_id: str, db: Session = Depends(get_db)):
    # Try slug first, then ID
    blog = db.query(Blog).filter(Blog.slug == slug_or_id).first()
    if not blog:
        try:
            blog_id = int(slug_or_id)
            blog = db.query(Blog).filter(Blog.id == blog_id).first()
        except ValueError:
            pass
            
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog

@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(
    blog_in: BlogCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # Check if slug exists
    existing = db.query(Blog).filter(Blog.slug == blog_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
        
    blog = Blog(**blog_in.model_dump())
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

@router.put("/{blog_id}", response_model=BlogResponse)
def update_blog(
    blog_id: int,
    blog_in: BlogUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    update_data = blog_in.model_dump(exclude_unset=True)
    
    # If slug is being updated, verify it is unique
    if "slug" in update_data and update_data["slug"] != blog.slug:
        existing = db.query(Blog).filter(Blog.slug == update_data["slug"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
            
    for field, value in update_data.items():
        setattr(blog, field, value)
        
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(blog)
    db.commit()
    return None
