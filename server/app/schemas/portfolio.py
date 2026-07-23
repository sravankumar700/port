from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Admin Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: str
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    architecture_diagram: Optional[str] = None
    database_design: Optional[str] = None
    challenges: Optional[str] = None
    learnings: Optional[str] = None
    future_improvements: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    doc_url: Optional[str] = None
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None
    featured: bool = False
    image_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Skill Schemas
class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: int = Field(ge=0, le=100)
    years_of_experience: float = Field(ge=0)
    related_projects: List[str] = Field(default_factory=list)
    learning_status: str = "Mastered"

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Education Schemas
class EducationBase(BaseModel):
    degree: str
    college: str
    university: str
    cgpa: float = Field(ge=0, le=10)
    duration: str
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    degree: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None

class EducationResponse(EducationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Experience Schemas
class ExperienceBase(BaseModel):
    role: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    description: str
    type: str
    technologies: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase):
    role: Optional[str] = None
    company: Optional[str] = None

class ExperienceResponse(ExperienceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Achievement Schemas
class AchievementBase(BaseModel):
    title: str
    description: str
    date: str
    category: Optional[str] = None
    link: Optional[str] = None

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(AchievementBase):
    title: Optional[str] = None
    description: Optional[str] = None

class AchievementResponse(AchievementBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Certification Schemas
class CertificationBase(BaseModel):
    name: str
    organization: str
    issue_date: str
    skills_learned: List[str] = Field(default_factory=list)
    credential_url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(CertificationBase):
    name: Optional[str] = None
    organization: Optional[str] = None

class CertificationResponse(CertificationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Blog Schemas
class BlogBase(BaseModel):
    title: str
    slug: str
    content: str
    summary: Optional[str] = None
    category: str
    reading_time: int = 5
    published: bool = True

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BlogBase):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None

class BlogResponse(BlogBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Message Schemas
class MessageBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    subject: str
    purpose: Optional[str] = None
    message: str

class MessageCreate(MessageBase):
    pass

class MessageUpdate(BaseModel):
    read: Optional[bool] = None
    replied: Optional[bool] = None

class MessageResponse(MessageBase):
    id: int
    read: bool
    replied: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Resume Schemas
class ResumeBase(BaseModel):
    version: str
    file_url: str

class ResumeCreate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: int
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

# SocialLink Schemas
class SocialLinkBase(BaseModel):
    platform: str
    url: str
    icon: Optional[str] = None

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkResponse(SocialLinkBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# SiteSettings Schemas
class SiteSettingsBase(BaseModel):
    key: str
    value: str

class SiteSettingsCreate(SiteSettingsBase):
    pass

class SiteSettingsResponse(SiteSettingsBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# VisitorAnalytics Schemas
class VisitorAnalyticsBase(BaseModel):
    page_path: str
    ip_hash: str
    user_agent: Optional[str] = None

class VisitorAnalyticsResponse(VisitorAnalyticsBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
