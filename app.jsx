function Portfolio() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <h1>Senior Full-Stack Engineer</h1>
          <p>Delivering scalable web applications, robust APIs, and polished digital experiences for enterprise teams.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>About</h2>
          <p>I bring 10 years of experience building production-grade software that balances architecture, performance, and user experience. My approach is grounded in reliability, maintainability, and team collaboration.</p>
        </section>

        <section className="card">
          <h2>Core Strengths</h2>
          <ul>
            <li>End-to-end product development</li>
            <li>Frontend architecture and accessibility</li>
            <li>Backend services, APIs, and database design</li>
            <li>Cloud deployment and automation</li>
            <li>Technical leadership and roadmap execution</li>
          </ul>
        </section>

        <section className="card">
          <h2>Highlighted Work</h2>
          <article>
            <h3>Insights Platform</h3>
            <p>Designed and delivered a centralized analytics platform used by executive and operational teams to monitor business performance.</p>
          </article>
          <article>
            <h3>Customer Operations Portal</h3>
            <p>Built a responsive portal and API backend that streamlined workflows, lowered support volume, and boosted customer satisfaction.</p>
          </article>
        </section>

        <section className="card">
          <h2>Contact</h2>
          <p>Let’s connect about senior engineering roles, consulting, or digital product strategy.</p>
          <p><a href="mailto:youremail@example.com">youremail@example.com</a></p>
          <p><a href="https://linkedin.com/in/yourname" target="_blank" rel="noreferrer">linkedin.com/in/yourname</a></p>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Senior Full-Stack Engineer Portfolio</p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Portfolio />);
