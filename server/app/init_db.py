from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.portfolio import (
    Admin, Skill, Education, Experience, Achievement, 
    Certification, Blog, SiteSettings, SocialLink, Project
)

def init_db(db: Session) -> None:
    # 1. Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # 2. Initialize Admin
    admin = db.query(Admin).filter(Admin.username == settings.ADMIN_USERNAME).first()
    if not admin:
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        admin = Admin(
            username=settings.ADMIN_USERNAME,
            hashed_password=hashed_password
        )
        db.add(admin)
        print(f"Admin '{settings.ADMIN_USERNAME}' created.")
    else:
        print(f"Admin '{settings.ADMIN_USERNAME}' already exists.")

    # 3. Seed Default Site Settings (Identity)
    default_settings = {
        "name": "Sravan Kumar",
        "title": "AI Engineer • Full Stack Developer • Problem Solver",
        "tagline": "Building intelligent software that solves real-world problems through Artificial Intelligence, scalable backend systems, and modern web technologies.",
        "introduction": "Hello, I'm Sravan Kumar, a final-year Artificial Intelligence & Data Science student passionate about designing intelligent systems and building scalable full-stack applications. I enjoy transforming ideas into real-world software using Python, FastAPI, React, PostgreSQL, and modern development practices. Every project in this portfolio represents my commitment to continuous learning, engineering excellence, and creating technology that makes a meaningful impact.",
        "mission": "My mission is to become a world-class AI Engineer and Full Stack Software Engineer by continuously learning, solving challenging problems, and building production-grade software that improves businesses and people's lives. I believe the best way to grow as an engineer is to build, experiment, and never stop learning.",
        "motto": "Learn. Build. Solve. Improve. Repeat.",
        "philosophy": "I believe great software is built through curiosity, consistency, and continuous improvement. My goal is not just to write code, but to design secure, scalable, and user-focused applications that solve meaningful problems.",
        "github_username": "sravankumar700",
        "leetcode_username": "sravankumar700",
        "email": "sravankumar@example.com",
    }

    for key, val in default_settings.items():
        exists = db.query(SiteSettings).filter(SiteSettings.key == key).first()
        if not exists:
            setting = SiteSettings(key=key, value=val)
            db.add(setting)

    # 4. Seed Social Links
    social_links = [
        {"platform": "GitHub", "url": "https://github.com/sravankumar700", "icon": "Github"},
        {"platform": "LinkedIn", "url": "https://linkedin.com/in/sravankumar", "icon": "Linkedin"},
        {"platform": "Email", "url": "mailto:sravankumar@example.com", "icon": "Mail"},
    ]
    for sl in social_links:
        exists = db.query(SocialLink).filter(SocialLink.platform == sl["platform"]).first()
        if not exists:
            link = SocialLink(**sl)
            db.add(link)

    # 5. Seed Skills
    skills = [
        # Programming
        {"name": "Python", "category": "Programming", "proficiency": 90, "years_of_experience": 3.0, "learning_status": "Mastered"},
        {"name": "Java", "category": "Programming", "proficiency": 75, "years_of_experience": 2.0, "learning_status": "Mastered"},
        {"name": "JavaScript", "category": "Programming", "proficiency": 80, "years_of_experience": 2.5, "learning_status": "Mastered"},
        
        # Frontend
        {"name": "React", "category": "Frontend", "proficiency": 80, "years_of_experience": 2.0, "learning_status": "Mastered"},
        {"name": "HTML", "category": "Frontend", "proficiency": 90, "years_of_experience": 3.0, "learning_status": "Mastered"},
        {"name": "CSS", "category": "Frontend", "proficiency": 85, "years_of_experience": 3.0, "learning_status": "Mastered"},
        {"name": "Tailwind CSS", "category": "Frontend", "proficiency": 85, "years_of_experience": 1.5, "learning_status": "Mastered"},
        
        # Backend
        {"name": "FastAPI", "category": "Backend", "proficiency": 85, "years_of_experience": 1.5, "learning_status": "Mastered"},
        {"name": "Flask", "category": "Backend", "proficiency": 70, "years_of_experience": 1.0, "learning_status": "Mastered"},
        {"name": "REST APIs", "category": "Backend", "proficiency": 85, "years_of_experience": 2.0, "learning_status": "Mastered"},
        
        # Database
        {"name": "PostgreSQL", "category": "Database", "proficiency": 80, "years_of_experience": 1.5, "learning_status": "Mastered"},
        {"name": "MongoDB", "category": "Database", "proficiency": 75, "years_of_experience": 1.5, "learning_status": "Mastered"},
        
        # Tools
        {"name": "Git", "category": "Tools", "proficiency": 85, "years_of_experience": 2.5, "learning_status": "Mastered"},
        {"name": "GitHub", "category": "Tools", "proficiency": 85, "years_of_experience": 2.5, "learning_status": "Mastered"},
        {"name": "VS Code", "category": "Tools", "proficiency": 90, "years_of_experience": 3.0, "learning_status": "Mastered"},
        {"name": "Postman", "category": "Tools", "proficiency": 80, "years_of_experience": 1.5, "learning_status": "Mastered"},
        
        # Deployment
        {"name": "Docker", "category": "Deployment", "proficiency": 70, "years_of_experience": 1.0, "learning_status": "Exploring"},
        {"name": "Vercel", "category": "Deployment", "proficiency": 80, "years_of_experience": 1.5, "learning_status": "Mastered"},
        {"name": "Render", "category": "Deployment", "proficiency": 75, "years_of_experience": 1.0, "learning_status": "Mastered"},
        
        # AI & Data
        {"name": "NumPy", "category": "AI & Data", "proficiency": 85, "years_of_experience": 2.0, "learning_status": "Mastered"},
        {"name": "Pandas", "category": "AI & Data", "proficiency": 85, "years_of_experience": 2.0, "learning_status": "Mastered"},
        {"name": "Hugging Face", "category": "AI & Data", "proficiency": 75, "years_of_experience": 1.0, "learning_status": "Exploring"},
        {"name": "Ollama", "category": "AI & Data", "proficiency": 80, "years_of_experience": 1.0, "learning_status": "Learning"},
        {"name": "Scikit-learn", "category": "AI & Data", "proficiency": 75, "years_of_experience": 1.5, "learning_status": "Learning"},
    ]
    for s in skills:
        exists = db.query(Skill).filter(Skill.name == s["name"]).first()
        if not exists:
            db.add(Skill(**s))

    # 6. Seed Education
    education_records = [
        {
            "degree": "Bachelor of Technology in Artificial Intelligence and Data Science",
            "college": "St. Mary's Engineering College",
            "university": "Jawaharlal Nehru Technological University",
            "cgpa": 8.9,
            "duration": "2022 - 2026",
            "description": "Specializing in Machine Learning models, Deep Learning, Big Data Analytics, and Database Systems. Active member of the Coding Club and AI research group."
        }
    ]
    for edu in education_records:
        exists = db.query(Education).filter(Education.degree == edu["degree"]).first()
        if not exists:
            db.add(Education(**edu))

    # 7. Seed Experience
    experiences = [
        {
            "role": "AI Developer Intern",
            "company": "CognitiveTech Solutions",
            "location": "Remote",
            "start_date": "May 2025",
            "end_date": "July 2025",
            "description": "Designed and deployed neural network models for predictive analytics, reducing inference latency by 30%. Created RESTful APIs using FastAPI to integrate ML models into web dashboards.",
            "type": "Internship",
            "technologies": ["Python", "FastAPI", "Scikit-learn", "Docker"],
            "achievements": [
                "Reduced inference latency by 30% through model quantization.",
                "Built and documented 12 new API endpoints using FastAPI."
            ]
        },
        {
            "role": "Freelance Full Stack Developer",
            "company": "Independent Contracts",
            "location": "Remote",
            "start_date": "August 2024",
            "end_date": "Present",
            "description": "Developed and maintained custom responsive web applications for local businesses. Implemented secure admin panels, relational database layouts, and contact forms.",
            "type": "Freelance",
            "technologies": ["React", "TypeScript", "Tailwind CSS", "FastAPI", "PostgreSQL"],
            "achievements": [
                "Delivered 3 complete web applications on time, meeting all requirements.",
                "Engineered responsive designs leading to a 40% increase in mobile traffic for clients."
            ]
        }
    ]
    for exp in experiences:
        exists = db.query(Experience).filter(Experience.role == exp["role"], Experience.company == exp["company"]).first()
        if not exists:
            db.add(Experience(**exp))

    # 8. Seed Achievements
    achievements = [
        {
            "title": "1st Place - Smart City Hackathon",
            "description": "Led a team of 4 to design an AI-powered smart traffic management solution using computer vision. Awarded Best Innovative AI project.",
            "date": "March 2025",
            "category": "Hackathon",
            "link": "https://github.com/sravankumar700/smart-traffic-hackathon"
        },
        {
            "title": "LeetCode 300+ Problems Solved",
            "description": "Solved over 300 data structures and algorithms problems on LeetCode with a peak rating of 1650.",
            "date": "Ongoing",
            "category": "Coding",
            "link": "https://leetcode.com/sravankumar700"
        }
    ]
    for ach in achievements:
        exists = db.query(Achievement).filter(Achievement.title == ach["title"]).first()
        if not exists:
            db.add(Achievement(**ach))

    # 9. Seed Certifications
    certifications = [
        {
            "name": "Supervised Machine Learning: Regression and Classification",
            "organization": "DeepLearning.AI (Coursera)",
            "issue_date": "July 2024",
            "skills_learned": ["Python", "Machine Learning", "Linear Regression", "Gradient Descent"],
            "credential_url": "https://coursera.org/verify/supervised-ml-sravan"
        },
        {
            "name": "React - The Complete Guide",
            "organization": "Udemy",
            "issue_date": "December 2024",
            "skills_learned": ["React", "JavaScript", "Redux", "Hooks", "State Management"],
            "credential_url": "https://udemy.com/certificate/react-sravan"
        }
    ]
    for cert in certifications:
        exists = db.query(Certification).filter(Certification.name == cert["name"]).first()
        if not exists:
            db.add(Certification(**cert))

    # 10. Seed Blog Post
    blogs = [
        {
            "title": "Building Secure and Scalable APIs with FastAPI",
            "slug": "building-secure-scalable-apis-fastapi",
            "summary": "A comprehensive guide on implementing JWT authentication, dependency injection, and Pydantic validation in FastAPI apps.",
            "content": """# Building Secure and Scalable APIs with FastAPI

FastAPI has quickly become one of the most popular Python web frameworks for building RESTful APIs. It is fast, easy to write, and generates interactive documentation (Swagger) out-of-the-box. In this post, we will explore the three pillars of a production-ready FastAPI application:

1. **JWT Authentication**: Securing endpoints using token-based authentication.
2. **Pydantic Validation**: Validating request payloads and response serialization.
3. **Dependency Injection**: Structuring database sessions and authenticators cleanly.

## Why FastAPI?

FastAPI is built on top of Starlette and Pydantic. It offers performance on par with NodeJS and Go. Here is a simple benchmark:
* FastAPI: High performance, built-in validation.
* Flask: Simple, but requires external packages for validation/async.
* Django: Full-featured, but heavy for microservices.

## 1. Request Validation with Pydantic

Pydantic handles type enforcement and serialization. Below is an example schema for user registration:

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
```

By specifying these types, FastAPI automatically validates incoming requests and returns clean `422 Unprocessable Entity` JSON responses if validation fails.

## 2. Dependency Injection

FastAPI's dependency injection system allows us to declare dependencies for endpoints. A classic example is getting a database session:

```python
from sqlalchemy.orm import Session
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Database logic here
    return {"message": "User created successfully"}
```

This keeps code clean and modular, making it very easy to swap implementation (e.g. mock databases for testing).

## Conclusion

FastAPI provides an outstanding developer experience and lightning-fast execution. By using strict typing and security best practices, you can build APIs ready for production environments. Stay tuned for my next post on deploying FastAPI on Docker!
""",
            "category": "FastAPI Notes",
            "reading_time": 5,
            "published": True
        }
    ]
    for b in blogs:
        exists = db.query(Blog).filter(Blog.slug == b["slug"]).first()
        if not exists:
            db.add(Blog(**b))

    # 11. Seed Projects
    projects = [
        {
            "title": "AI Resume Screening & Ranking Platform",
            "description": "An intelligent resume screening system that parses PDFs, extracts skills, and ranks profiles based on job descriptions using Natural Language Processing.",
            "problem_statement": "Recruiters manually screen hundreds of resumes daily, which is time-consuming and prone to human bias.",
            "solution": "Built an automated parser that processes resumes in parallel, computes cosine similarity between skills/experience, and ranks them for specific roles.",
            "features": ["PDF Text Extraction & Parsing", "Skill & Keyword Extraction", "Ranked Candidates Dashboard", "Custom Search & Filtering"],
            "technologies": ["Python", "FastAPI", "React", "Tailwind CSS", "PostgreSQL", "Ollama"],
            "architecture_diagram": "Upload Resume -> Parse PDF (PyPDF) -> Compute Embeddings (Ollama/SentenceTransformers) -> Match Job Description -> Save in DB -> Render React Dashboard",
            "database_design": "Projects table, Resumes table, MatchScores table",
            "challenges": "Extracting clean text from multi-column PDF layouts without losing semantic structure.",
            "learnings": "Learned to configure sentence embedding models locally and optimize vector calculations.",
            "future_improvements": "Add support for extracting resume structures (sections like education vs work experience) dynamically.",
            "github_url": "https://github.com/sravankumar700/ai-resume-screener",
            "live_url": "https://resume-screener-demo.vercel.app",
            "doc_url": "https://github.com/sravankumar700/ai-resume-screener/blob/main/README.md",
            "duration": "2 Months",
            "difficulty": "Advanced",
            "status": "Completed",
            "featured": True,
            "image_url": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop"
        },
        {
            "title": "Collaborative Task Management Board",
            "description": "A responsive full-stack Trello clone featuring real-time drag-and-drop task boards, secure collaboration, and analytics charts.",
            "problem_statement": "Teams need a lightweight, secure tool to plan tasks visually without complex configurations.",
            "solution": "Created a kanban board with custom lists, drag-and-drop handlers, user permissions, activity history, and project timeline graphs.",
            "features": ["Interactive Kanban Board", "JWT Protected Team Invites", "Task Checklists & File Uploads", "Project Progress Analytics"],
            "technologies": ["React", "TypeScript", "Tailwind CSS", "FastAPI", "PostgreSQL", "SQLAlchemy"],
            "architecture_diagram": "Vite Client -> React Router -> Axios Client -> REST API Endpoints -> SQLAlchemy Session -> PostgreSQL Storage",
            "database_design": "Users table, Boards table, Lists table, Tasks table, Comments table",
            "challenges": "Managing real-time visual updates and resolving out-of-order drag transitions.",
            "learnings": "Gained deep understanding of relational schema designs, foreign key constraints, and transactional consistency in SQLAlchemy.",
            "future_improvements": "Implement WebSockets for multi-user real-time board updates.",
            "github_url": "https://github.com/sravankumar700/task-board",
            "live_url": "https://task-board-demo.vercel.app",
            "doc_url": "https://github.com/sravankumar700/task-board/blob/main/README.md",
            "duration": "1.5 Months",
            "difficulty": "Intermediate",
            "status": "Completed",
            "featured": True,
            "image_url": "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop"
        }
    ]
    for p in projects:
        exists = db.query(Project).filter(Project.title == p["title"]).first()
        if not exists:
            db.add(Project(**p))

    db.commit()
    print("Database seeding completed.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
