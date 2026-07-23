from fastapi import APIRouter
from app.api import (
    auth,
    projects,
    skills,
    education,
    experience,
    achievements,
    certifications,
    blogs,
    messages,
    resume,
    settings,
    analytics,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(education.router, prefix="/education", tags=["education"])
api_router.include_router(experience.router, prefix="/experience", tags=["experience"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["achievements"])
api_router.include_router(certifications.router, prefix="/certifications", tags=["certifications"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["blogs"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
