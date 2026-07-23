import hashlib
from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.portfolio import VisitorAnalytics
from app.schemas.portfolio import VisitorAnalyticsResponse

router = APIRouter()

@router.post("/track")
def track_visit(
    page_path: str,
    request: Request,
    user_agent: str = Header(None),
    db: Session = Depends(get_db)
):
    # Anonymize IP address by hashing
    client_host = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_host.encode()).hexdigest()
    
    analytics = VisitorAnalytics(
        page_path=page_path,
        ip_hash=ip_hash,
        user_agent=user_agent
    )
    db.add(analytics)
    db.commit()
    return {"status": "success"}

@router.get("/stats", response_model=Dict[str, Any])
def get_analytics_stats(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # Total Views
    total_views = db.query(VisitorAnalytics).count()
    
    # Unique Visitors
    unique_visitors = db.query(func.count(func.distinct(VisitorAnalytics.ip_hash))).scalar()
    
    # Top Pages
    top_pages_query = db.query(
        VisitorAnalytics.page_path, 
        func.count(VisitorAnalytics.id).label("views")
    ).group_by(VisitorAnalytics.page_path).order_by(func.count(VisitorAnalytics.id).desc()).limit(10).all()
    
    top_pages = [{"path": row[0], "views": row[1]} for row in top_pages_query]
    
    # Simple timeline (views per day for the last 14 days)
    two_weeks_ago = datetime.now(timezone.utc) - timedelta(days=14)
    timeline_query = db.query(
        func.strftime("%Y-%m-%d", VisitorAnalytics.timestamp).label("date"),
        func.count(VisitorAnalytics.id).label("views"),
        func.count(func.distinct(VisitorAnalytics.ip_hash)).label("uniques")
    ).filter(VisitorAnalytics.timestamp >= two_weeks_ago).group_by("date").order_by("date").all()
    
    timeline = [{"date": row[0], "views": row[1], "uniques": row[2]} for row in timeline_query]
    
    return {
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "top_pages": top_pages,
        "timeline": timeline
    }
