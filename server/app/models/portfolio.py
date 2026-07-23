from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, JSON
from datetime import datetime, timezone
from app.core.database import Base

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    problem_statement = Column(Text)
    solution = Column(Text)
    features = Column(JSON, default=list) # List of strings
    technologies = Column(JSON, default=list) # List of strings
    architecture_diagram = Column(String) # Image URL or string representation
    database_design = Column(Text)
    challenges = Column(Text)
    learnings = Column(Text)
    future_improvements = Column(Text)
    github_url = Column(String)
    live_url = Column(String)
    doc_url = Column(String)
    duration = Column(String) # e.g. "2 Months"
    difficulty = Column(String) # e.g. "Advanced", "Intermediate"
    status = Column(String) # e.g. "Completed", "In Progress"
    featured = Column(Boolean, default=False)
    image_url = Column(String)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g. "Programming", "Frontend", etc.
    proficiency = Column(Integer, default=80) # 0-100
    years_of_experience = Column(Float, default=1.0)
    related_projects = Column(JSON, default=list) # List of project names or IDs
    learning_status = Column(String, default="Mastered") # e.g. "Mastered", "Learning", "Exploring"

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    degree = Column(String, nullable=False)
    college = Column(String, nullable=False)
    university = Column(String, nullable=False)
    cgpa = Column(Float, nullable=False)
    duration = Column(String, nullable=False) # e.g. "2022 - 2026"
    description = Column(Text)

class Experience(Base):
    __tablename__ = "experience"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    start_date = Column(String, nullable=False)
    end_date = Column(String) # Nullable for "Present"
    description = Column(Text, nullable=False)
    type = Column(String, nullable=False) # e.g. "Internship", "Freelance", etc.
    technologies = Column(JSON, default=list) # List of strings
    achievements = Column(JSON, default=list) # List of strings

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    category = Column(String) # e.g. "Hackathon", "Open Source"
    link = Column(String)

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    issue_date = Column(String, nullable=False)
    skills_learned = Column(JSON, default=list) # List of strings
    credential_url = Column(String)

class Blog(Base):
    __tablename__ = "blogs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False) # Markdown
    summary = Column(Text)
    category = Column(String, nullable=False)
    reading_time = Column(Integer, default=5) # In minutes
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String)
    subject = Column(String, nullable=False)
    purpose = Column(String) # e.g. "Recruitment", "Project Collaboration", "Other"
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    replied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Resume(Base):
    __tablename__ = "resume"
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SocialLink(Base):
    __tablename__ = "social_links"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, unique=True, nullable=False) # e.g. "GitHub", "LinkedIn"
    url = Column(String, nullable=False)
    icon = Column(String) # Icon name

class VisitorAnalytics(Base):
    __tablename__ = "visitor_analytics"
    id = Column(Integer, primary_key=True, index=True)
    page_path = Column(String, nullable=False)
    ip_hash = Column(String, nullable=False)
    user_agent = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
