const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#main-nav');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const themeLabel = document.querySelector('.theme-label');

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeLabel.textContent = isDark ? 'Light' : 'Dark';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#0c241f' : '#163b32';
}

// Always begin in light mode on every page load.
localStorage.removeItem('research-theme');
setTheme('light');

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('open');
  nav.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.classList.remove('open');
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const glow = document.querySelector('.cursor-glow');
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
} else {
  glow.style.display = 'none';
}

document.querySelector('#year').textContent = new Date().getFullYear();

const questionForm = document.querySelector('#question-form');
const questionText = document.querySelector('#question-text');
const characterCount = document.querySelector('#character-count');
const forumFeed = document.querySelector('#forum-feed');
const questionTotal = document.querySelector('#question-total');
const formMessage = document.querySelector('#form-message');
const questionStorageKey = 'research-forum-questions';

function getQuestions() {
  try {
    const stored = JSON.parse(localStorage.getItem(questionStorageKey));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function renderQuestions() {
  const questions = getQuestions();
  questionTotal.textContent = `${questions.length} ${questions.length === 1 ? 'question' : 'questions'}`;
  forumFeed.replaceChildren();

  if (!questions.length) {
    const empty = document.createElement('div');
    empty.className = 'forum-empty';
    empty.innerHTML = '<span>?</span><p>No questions yet.<br>Begin the conversation.</p>';
    forumFeed.append(empty);
    return;
  }

  questions.slice().reverse().forEach(item => {
    const card = document.createElement('article');
    card.className = 'question-card';

    const meta = document.createElement('div');
    meta.className = 'question-meta';
    const topic = document.createElement('span');
    topic.textContent = item.topic;
    const time = document.createElement('time');
    time.dateTime = item.createdAt;
    time.textContent = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(item.createdAt));
    meta.append(topic, time);

    const question = document.createElement('p');
    question.textContent = item.question;
    const author = document.createElement('strong');
    author.textContent = `Asked by ${item.name || 'Curious researcher'}`;
    card.append(meta, question, author);
    forumFeed.append(card);
  });
}

questionText.addEventListener('input', () => {
  characterCount.textContent = questionText.value.length;
});

questionForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(questionForm);
  const question = String(data.get('question') || '').trim();
  if (!question) {
    formMessage.textContent = 'Please write a question before posting.';
    questionText.focus();
    return;
  }

  const questions = getQuestions();
  questions.push({
    name: String(data.get('name') || '').trim(),
    topic: String(data.get('topic') || 'General Research'),
    question,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(questionStorageKey, JSON.stringify(questions.slice(-30)));
  questionForm.reset();
  characterCount.textContent = '0';
  formMessage.textContent = 'Your question has been posted to the forum.';
  renderQuestions();
  window.setTimeout(() => { formMessage.textContent = ''; }, 4000);
});

renderQuestions();

const backToTop = document.querySelector('.back-to-top');
const observedSections = [...document.querySelectorAll('main section[id]')];
const sectionLinks = [...document.querySelectorAll('#main-nav a[href^="#"]')];

const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  sectionLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .2, .5] });

observedSections.forEach(section => sectionObserver.observe(section));

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.classList.add('image-unavailable');
    img.setAttribute('aria-label', `${img.alt || 'Image'} unavailable`);
  });
});

window.addEventListener('scroll', () => {
  const visual = document.querySelector('.hero-visual');
  if (visual && window.innerWidth > 720) {
    visual.style.transform = `translateY(${Math.min(window.scrollY * 0.07, 35)}px)`;
  }
  backToTop.classList.toggle('visible', window.scrollY > 700);
}, { passive: true });
