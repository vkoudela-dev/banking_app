'use strict';
import * as accountPage from './accountPage.js';

// Modal window
const modals = document.querySelectorAll('.modal');
const overlay = document.querySelector('.overlay');
const btnsCloseModal = document.querySelectorAll('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const toggleBtn = document.querySelector('.toggle-button');
const navLinks = document.querySelector('.nav__links')
toggleBtn.addEventListener('click', (e) => {
  e.preventDefault();
  navLinks.classList.toggle('active');

});

const openModal = function () {
  modals.forEach(
    (modal) =>
      modal.dataset.type === `${this.dataset.type}` &&
      modal.classList.remove('hidden')
  );
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modals.forEach((modal) => modal.classList.add('hidden'));
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach((btn) => btn.addEventListener('click', openModal));
btnsCloseModal.forEach((btn) => btn.addEventListener('click', closeModal));
overlay?.addEventListener('click', closeModal);

// Nav links hover effect
const nav = document.querySelector('.nav');
const handleHover = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const siblings = nav.querySelectorAll('.nav__link');
    const logo = nav.querySelector('img');

    siblings.forEach((el) => {
      if (el !== e.target) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

// Nav links functionality
document.querySelector('.nav__links').addEventListener('click', function (e) {
  if (e.target.classList.contains('logout')) return;

  e.preventDefault();

  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    if (id === '#') return;
    document.querySelector(id).scrollIntoView({
      behavior: 'smooth',
    });
  }
});

// "Learn more" button
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

btnScrollTo?.addEventListener('click', function (e) {
  section1.scrollIntoView({
    behavior: 'smooth',
  });
});

// Tabbed component
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

tabsContainer?.addEventListener('click', function (e) {
  const btn = e.target.closest('.operations__tab');

  // Guard clause
  if (!btn) return;

  // Activate clicked button
  tabs.forEach((tab) => tab.classList.remove('operations__tab--active'));
  btn.classList.add('operations__tab--active');

  // Activate and deactivate content tab
  tabsContent.forEach((tab) => {
    tab.classList.remove('operations__content--active');

    if (tab.classList.contains(`operations__content--${btn.dataset.tab}`)) {
      tab.classList.add('operations__content--active');
    }
  });
});

// Sticky navbar
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  !entry.isIntersecting
    ? nav.classList.add('sticky')
    : nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`,
});
headerObserver.observe(header);

// Reveal sections
const sections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});
sections.forEach((section) => {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

// Lazy loading images
const imgs = section1?.querySelectorAll('img');

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  //   Replace image
  entry.target.src = entry.target.dataset.src;

  entry.target.addEventListener('load', () =>
    entry.target.classList.remove('lazy-img')
  );
  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0.1,
});

imgs?.forEach((img) => imgObserver.observe(img));

// Slider
const slides = document.querySelectorAll('.slide');
const sliderBtns = document.querySelectorAll('.slider__btn');
const dotContainer = document.querySelector('.dots');

const createDots = function () {
  slides.forEach((_, i) => {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
};
createDots();

const activateDot = function (slide) {
  const dots = document.querySelectorAll('.dots__dot');
  dots?.forEach((dot) => dot.classList.remove('dots__dot--active'));

  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add('dots__dot--active');
};

const goToSlide = function (slide) {
  if (slides.length === 0) return;
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${(i - slide) * 100}%)`)
  );
  activateDot(slide);
};
goToSlide(0);

let curSlide = 0;
sliderBtns.forEach((btn) =>
  btn.addEventListener('click', (e) => {
    e.target.classList.contains('slider__btn--left') ? curSlide-- : curSlide++;

    // Create loops
    curSlide === -1 && (curSlide = 2);
    curSlide === slides.length && (curSlide = 0);

    goToSlide(curSlide);
  })
);

dotContainer?.addEventListener('click', (e) =>
  goToSlide(e.target.dataset.slide)
);

// Register user
const registerBtn = document.querySelector('button[name="register"]');
registerBtn?.addEventListener('click', (e) => {
  e.preventDefault();

  const username = document.querySelector('input[name="username"]').value;
  const firstName = document.querySelector('input[name="firstname"]').value;
  const lastName = document.querySelector('input[name="lastname"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const confirmation = document.querySelector(
    'input[name="confirmation"]'
  ).value;
  const msgDiv = document.querySelector('.msg');
  msgDiv.textContent = '';

  // Compare passwords
  if (password !== confirmation) {
    msgDiv.textContent = 'Passwords must match';
  }

  // Sent user's details
  fetch('banking/register', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      firstname: firstName,
      lastname: lastName,
      email: email,
      password: password,
    }),
  })
    .then((response) =>
      Promise.all([response.status, response.json()])
    )
    .then(([status, msg]) => {
      msgDiv.textContent = msg.msg;
      if (status === 201) location.reload(true);
    });
});

// Log in user
const logInBtn = document.querySelector('button[name="login"]');
logInBtn?.addEventListener('click', (e) => {
  e.preventDefault();

  const username = document.querySelector(
    'input[name="signin_username"]'
  ).value;
  const password = document.querySelector(
    'input[name="signin_password"]'
  ).value;
  const msgDiv = document.querySelector('.msg_login');
  msgDiv.textContent = '';

  fetch('/banking/login', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((JsonResponse) =>
      Promise.all([JsonResponse.status, JsonResponse.json()])
    )
    .then(([status, msg]) => {
      if (status === 201) {
        msgDiv.classList.add('msg_true');
        msgDiv.textContent = msg.msg;
        setTimeout(() => {
        location.reload()}, 3000);}
      msgDiv.textContent = msg.msg;
    });
});

////////////////////////////////////////////////////
// Open authenticated user's account page
if (!section1) {
  accountPage.startPage();
}
