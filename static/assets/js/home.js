// ===============================
// Smooth Scroll for Navbar Links
// ===============================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    if (this.hash !== '') {
      e.preventDefault();
      const target = document.querySelector(this.hash);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70, // adjust for navbar height
          behavior: 'smooth'
        });
      }
    }
  });
});

// ===============================
// Scroll Reveal Animation
// ===============================
const revealElements = document.querySelectorAll('.reveal');

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  const revealPoint = 150;

  revealElements.forEach(el => {
    const revealTop = el.getBoundingClientRect().top;
    if (revealTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);

// ===============================
// Button Click Animation
// ===============================
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.classList.add('clicked');
    setTimeout(() => this.classList.remove('clicked'), 200);
  });
});
