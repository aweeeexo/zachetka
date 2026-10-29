// Зачётка — лендинг. Чистый JavaScript без фреймворков.
// 1) мобильное меню, 2) появление блоков при прокрутке, 3) демо-разбор задания, 4) форма раннего доступа.
document.documentElement.classList.add('js');

/* ---------- 1. Мобильное меню ---------- */
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  navToggle.querySelector('.visually-hidden').textContent = open ? 'Закрыть меню' : 'Открыть меню';
}
navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); navToggle.focus(); }
});

/* ---------- 2. Появление блоков при прокрутке ---------- */
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('is-visible'));
}

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- 3. Демо-разбор задания ----------
   Упрощённый разбор без нейросети: ищет заголовки «Этап N», строки «Срок сдачи: 8 октября»
   и пункты списка «- …». У каждого найденного пункта запоминаем номер строки — это и есть
   «источник», как в настоящем приложении. */
const SAMPLE = `# Итоговый проект

### Этап 1. Презентация и защита идеи
Срок сдачи: 8 октября.
- описание проблемы, целевой аудитории и идеи приложения;
- основной функционал и отличие от существующих решений;
- 2–3 ключевых пользовательских сценария;
- предварительный контракт REST API.

### Этап 2. Статический лендинг
Срок сдачи: 29 октября.
- чистые HTML, CSS и JavaScript без React;
- корректное отображение на мобильных устройствах и десктопе;
- заметный призыв к действию;
- публикация по публичной ссылке, например на GitHub Pages.

### Этап 3. Frontend MVP
Срок сдачи: 19 ноября.
- React и TypeScript;
- Redux Toolkit для глобального состояния;
- формы с базовой валидацией.`;

const MONTHS = {
  января: 'янв', февраля: 'фев', марта: 'мар', апреля: 'апр', мая: 'мая', июня: 'июн',
  июля: 'июл', августа: 'авг', сентября: 'сен', октября: 'окт', ноября: 'нояб', декабря: 'дек',
};

/** Разбирает текст задания в список этапов. Возвращает [{ title, deadline, items: [{ text, line }] }]. */
function parseAssignment(text) {
  const stages = [];
  let current = null;
  const ensureStage = () => {
    if (!current) { current = { title: 'Общие требования', deadline: null, items: [] }; stages.push(current); }
    return current;
  };

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;

    const stage = line.match(/^#{0,6}\s*Этап\s+(\d+)\s*[.:)]?\s*(.*)$/i);
    if (stage) {
      current = { title: `Этап ${stage[1]}${stage[2] ? ' · ' + stage[2].replace(/[.:]$/, '') : ''}`, deadline: null, items: [] };
      stages.push(current);
      return;
    }

    const deadline = line.match(/срок\s+сдачи\s*[:—-]?\s*(\d{1,2})\s+([а-яё]+)/i);
    if (deadline) {
      const month = MONTHS[deadline[2].toLowerCase()];
      ensureStage().deadline = month ? `${deadline[1]} ${month}` : `${deadline[1]} ${deadline[2]}`;
      return;
    }

    const bullet = line.match(/^(?:[-*•–]|\d+[.)])\s+(.+?)[;.]?$/);
    if (bullet) ensureStage().items.push({ text: bullet[1], line: index + 1 });
  });

  return stages.filter((s) => s.items.length > 0 || s.deadline);
}

const demoForm = document.getElementById('demo-form');
const demoText = document.getElementById('demo-text');
const demoError = document.getElementById('demo-error');
const demoOutput = document.getElementById('demo-output');
demoText.value = SAMPLE;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v; else node.setAttribute(k, v);
  });
  children.forEach((c) => node.append(c));
  return node;
}

function showError(message) {
  demoError.textContent = message;
  demoError.hidden = !message;
  demoText.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function renderLoading() {
  demoOutput.setAttribute('aria-busy', 'true');
  demoOutput.replaceChildren(...[1, 2, 3].map(() => el('div', { class: 'skeleton', 'aria-hidden': 'true' })));
}

function renderEmpty(message) {
  const icon = document.querySelector('#demo-output .empty .icon')?.cloneNode(true);
  const box = el('div', { class: 'empty' }, el('p', {}, message));
  if (icon) box.prepend(icon);
  demoOutput.replaceChildren(box);
}

function renderPlan(stages) {
  const total = stages.reduce((sum, s) => sum + s.items.length, 0);
  const bar = el('i');
  const progress = el('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Готово пунктов', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': '0' }, bar);
  const counter = el('span', { class: 'chip' }, `Готово 0 из ${total}`);

  const update = () => {
    const done = demoOutput.querySelectorAll('.req input:checked').length;
    bar.style.width = total ? `${(done / total) * 100}%` : '0';
    progress.setAttribute('aria-valuenow', String(done));
    counter.textContent = `Готово ${done} из ${total}`;
  };

  const cards = stages.map((stage, si) => {
    const head = el('div', { class: 'stage-head' }, el('h3', {}, stage.title));
    if (stage.deadline) head.append(el('span', { class: 'deadline' }, stage.deadline));
    const items = stage.items.map((item, ii) => {
      const id = `req-${si}-${ii}`;
      const box = el('input', { type: 'checkbox', id });
      box.addEventListener('change', update);
      return el('div', { class: 'req' }, box, el('label', { for: id }, item.text), el('span', { class: 'src', title: 'Строка в исходном тексте' }, `стр. ${item.line}`));
    });
    return el('section', { class: 'stage', 'aria-label': stage.title }, head, ...items);
  });

  demoOutput.replaceChildren(
    el('div', { class: 'demo-summary' }, el('span', { class: 'chip' }, `Этапов: ${stages.length}`), el('span', { class: 'chip' }, `Пунктов: ${total}`), counter),
    progress,
    ...cards,
  );
}

demoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = demoText.value.trim();
  if (text.length < 20) {
    showError('Вставьте текст задания — хотя бы пару строк.');
    demoText.focus();
    return;
  }
  showError('');
  renderLoading();
  // Небольшая задержка имитирует запрос к серверу и показывает состояние загрузки.
  window.setTimeout(() => {
    const stages = parseAssignment(text);
    demoOutput.setAttribute('aria-busy', 'false');
    if (stages.length === 0) renderEmpty('Не нашли ни этапов, ни пунктов списка. Добавьте строки «Этап 1» и пункты через «-».');
    else renderPlan(stages);
  }, 600);
});

document.getElementById('demo-reset').addEventListener('click', () => {
  demoText.value = SAMPLE;
  showError('');
  demoText.focus();
});

/* ---------- 4. Форма раннего доступа ----------
   Бэкенда на этом этапе нет: проверяем поле на клиенте и сохраняем заявку в localStorage. */
const signupForm = document.getElementById('signup-form');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const signupSuccess = document.getElementById('signup-success');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setEmailError(message) {
  emailError.textContent = message;
  emailError.hidden = !message;
  emailInput.setAttribute('aria-invalid', message ? 'true' : 'false');
}

emailInput.addEventListener('blur', () => {
  if (emailInput.value && !EMAIL_RE.test(emailInput.value.trim())) setEmailError('Похоже, в адресе опечатка. Пример: name@example.com');
});
emailInput.addEventListener('input', () => { if (!emailError.hidden) setEmailError(''); });

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) { setEmailError('Укажите электронную почту.'); emailInput.focus(); return; }
  if (!EMAIL_RE.test(email)) { setEmailError('Похоже, в адресе опечатка. Пример: name@example.com'); emailInput.focus(); return; }
  setEmailError('');
  try {
    const saved = JSON.parse(localStorage.getItem('zachetka-signups') || '[]');
    saved.push({ email, role: signupForm.role.value, at: new Date().toISOString() });
    localStorage.setItem('zachetka-signups', JSON.stringify(saved));
  } catch { /* localStorage недоступен (приватный режим) — заявку просто показываем */ }
  document.getElementById('signup-email').textContent = email;
  signupSuccess.hidden = false;
  signupForm.reset();
});
