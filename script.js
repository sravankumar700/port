document.addEventListener('DOMContentLoaded', function () {
  var footer = document.querySelector('footer p');
  var currentYear = new Date().getFullYear();
  if (footer) {
    footer.textContent = '© ' + currentYear + ' Senior Full-Stack Engineer Portfolio';
  }

  var contactLinks = document.querySelectorAll('a[href^="mailto:"], a[href*="linkedin.com"]');
  contactLinks.forEach(function (link) {
    link.addEventListener('mouseover', function () {
      link.style.opacity = '0.7';
    });
    link.addEventListener('mouseout', function () {
      link.style.opacity = '1';
    });
  });
});
