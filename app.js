const Portfolio = () => React.createElement(
  'div',
  { className: 'page' },
  React.createElement(
    'header',
    { className: 'hero' },
    React.createElement(
      'div',
      { className: 'hero-content' },
      React.createElement('h1', null, 'Senior Full-Stack Engineer'),
      React.createElement(
        'p',
        null,
        'Delivering scalable web applications, robust APIs, and polished digital experiences for enterprise teams.'
      )
    )
  ),
  React.createElement(
    'main',
    { className: 'content' },
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h2', null, 'About'),
      React.createElement(
        'p',
        null,
        'I bring 10 years of experience building production-grade software that balances architecture, performance, and user experience. My approach is grounded in reliability, maintainability, and team collaboration.'
      )
    ),
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h2', null, 'Core Strengths'),
      React.createElement(
        'ul',
        null,
        React.createElement('li', null, 'End-to-end product development'),
        React.createElement('li', null, 'Frontend architecture and accessibility'),
        React.createElement('li', null, 'Backend services, APIs, and database design'),
        React.createElement('li', null, 'Cloud deployment and automation'),
        React.createElement('li', null, 'Technical leadership and roadmap execution')
      )
    ),
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h2', null, 'Highlighted Work'),
      React.createElement(
        'article',
        null,
        React.createElement('h3', null, 'Insights Platform'),
        React.createElement(
          'p',
          null,
          'Designed and delivered a centralized analytics platform used by executive and operational teams to monitor business performance.'
        )
      ),
      React.createElement(
        'article',
        null,
        React.createElement('h3', null, 'Customer Operations Portal'),
        React.createElement(
          'p',
          null,
          'Built a responsive portal and API backend that streamlined workflows, lowered support volume, and boosted customer satisfaction.'
        )
      )
    ),
    React.createElement(
      'section',
      { className: 'card' },
      React.createElement('h2', null, 'Contact'),
      React.createElement(
        'p',
        null,
        'Let’s connect about senior engineering roles, consulting, or digital product strategy.'
      ),
      React.createElement(
        'p',
        null,
        React.createElement('a', { href: 'mailto:youremail@example.com' }, 'youremail@example.com')
      ),
      React.createElement(
        'p',
        null,
        React.createElement(
          'a',
          { href: 'https://linkedin.com/in/yourname', target: '_blank', rel: 'noreferrer' },
          'linkedin.com/in/yourname'
        )
      )
    )
  ),
  React.createElement(
    'footer',
    null,
    React.createElement('p', null, '\u00A9 ' + new Date().getFullYear() + ' Senior Full-Stack Engineer Portfolio')
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Portfolio));
