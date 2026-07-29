let state = NicoleStorage.load();
let timer = { seconds: 25 * 60, running: false, mode: "focus", interval: null };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindModals();
  bindForms();
  bindJournal();
  bindTimer();
  updateClock();
  setInterval(updateClock, 1000);
  render();
});

function saveAndRender() {
  NicoleStorage.save(state);
  render();
}

function bindNavigation() {
  $$(".menu-item").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".menu-item").forEach((item) => item.classList.remove("active"));
      $$(".view").forEach((view) => view.classList.remove("active"));
      button.classList.add("active");
      $(`#${button.dataset.view}`).classList.add("active");
      $(".sidebar").classList.remove("open");
    });
  });
  $(".mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
}

function bindModals() {
  $$("[data-open-modal]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.openModal)));
  $$("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModals));
  $$(".modal").forEach((modal) => modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModals();
  }));
}

function bindForms() {
  $('[data-form="task"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const payload = { name: data.name, category: data.category, priority: data.priority };
    const existing = state.tasks.find((task) => task.id === data.id);
    existing ? Object.assign(existing, payload) : state.tasks.unshift({ id: crypto.randomUUID(), ...payload, done: false, createdAt: NicoleStorage.today() });
    closeModals();
    saveAndRender();
  });

  $('[data-form="goal"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const payload = { name: data.name, category: data.category, deadline: data.deadline, progress: clamp(data.progress) };
    const existing = state.goals.find((goal) => goal.id === data.id);
    existing ? Object.assign(existing, payload) : state.goals.unshift({ id: crypto.randomUUID(), ...payload });
    closeModals();
    saveAndRender();
  });

  $('[data-form="habit"]').addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    state.habits.unshift({ id: crypto.randomUUID(), name: data.name, completions: [] });
    closeModals();
    saveAndRender();
  });
}

function bindJournal() {
  const journal = $("#journalText");
  journal.value = state.journal || "";
  journal.addEventListener("input", () => {
    state.journal = journal.value;
    NicoleStorage.save(state);
    $("#journalStatus").textContent = "Salvando...";
    clearTimeout(window.nicoleJournalTimer);
    window.nicoleJournalTimer = setTimeout(() => $("#journalStatus").textContent = "Salvo", 420);
  });
}

function bindTimer() {
  $("#startTimer").addEventListener("click", startTimer);
  $("#pauseTimer").addEventListener("click", pauseTimer);
  $("#resetTimer").addEventListener("click", resetTimer);
}

function updateClock() {
  const now = new Date();
  $("#currentDate").textContent = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  $("#weekday").textContent = now.toLocaleDateString("pt-BR", { weekday: "long" });
  $("#clock").textContent = now.toLocaleTimeString("pt-BR");
  $("#dailyMessage").textContent = now.getHours() < 12
    ? "Que sua manhã comece com clareza e carinho."
    : now.getHours() < 18
      ? "Organize seu dia, construa seu futuro."
      : "Feche o dia com gratidão pelo que avançou.";
}

function render() {
  renderTasks();
  renderWeek();
  renderGoals();
  renderHabits();
  renderSessions();
  updateStats();
  NicoleCharts.update(state);
}

function renderTasks() {
  const list = $("#taskList");
  list.innerHTML = "";
  if (!state.tasks.length) {
    list.innerHTML = '<div class="empty">Adicione uma tarefa para começar o dia com intenção.</div>';
    return;
  }

  state.tasks.forEach((task) => {
    const item = document.createElement("article");
    item.className = `task-item ${task.done ? "done" : ""}`;
    item.innerHTML = `
      <input class="check" type="checkbox" ${task.done ? "checked" : ""} aria-label="Concluir tarefa">
      <div>
        <p class="title">${escapeHtml(task.name)}</p>
        <p class="meta"><span class="tag">${task.category}</span> ${task.priority} prioridade · ${task.done ? "Concluída" : "Pendente"}</p>
      </div>
      <div class="actions">
        <button class="icon-btn" title="Editar">Editar</button>
        <button class="icon-btn" title="Excluir">Excluir</button>
      </div>`;
    item.querySelector(".check").addEventListener("change", (event) => {
      task.done = event.target.checked;
      saveAndRender();
    });
    item.querySelector('[title="Editar"]').addEventListener("click", () => editTask(task));
    item.querySelector('[title="Excluir"]').addEventListener("click", () => {
      state.tasks = state.tasks.filter((candidate) => candidate.id !== task.id);
      saveAndRender();
    });
    list.appendChild(item);
  });
}

function renderWeek() {
  const grid = $("#weekGrid");
  grid.innerHTML = "";
  Object.entries(state.week).forEach(([day, items]) => {
    const column = document.createElement("section");
    column.className = "day-column";
    column.innerHTML = `
      <h3>${day}</h3>
      <form class="day-form">
        <input placeholder="Adicionar compromisso" required>
        <select aria-label="Categoria">
          <option>Estudos</option>
          <option>Trabalho</option>
          <option>Faculdade</option>
          <option>Projetos</option>
          <option>Exercícios</option>
          <option>Compromissos</option>
          <option>Momentos pessoais</option>
        </select>
        <button class="primary-btn">Adicionar</button>
      </form>
      <div class="list"></div>`;

    column.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.target.querySelector("input");
      const category = event.target.querySelector("select").value;
      items.push({ id: crypto.randomUUID(), name: input.value, category, done: false });
      input.value = "";
      saveAndRender();
    });

    const list = column.querySelector(".list");
    items.forEach((plan) => {
      const row = document.createElement("article");
      row.className = `week-item ${plan.done ? "done" : ""}`;
      row.innerHTML = `
        <input class="check" type="checkbox" ${plan.done ? "checked" : ""}>
        <div><p class="title">${escapeHtml(plan.name)}</p><p class="meta">${plan.category}</p></div>
        <button class="icon-btn" title="Excluir">×</button>`;
      row.querySelector(".check").addEventListener("change", (event) => {
        plan.done = event.target.checked;
        saveAndRender();
      });
      row.querySelector("button").addEventListener("click", () => {
        state.week[day] = items.filter((candidate) => candidate.id !== plan.id);
        saveAndRender();
      });
      list.appendChild(row);
    });
    grid.appendChild(column);
  });
  updateWeekSummary();
}

function renderGoals() {
  const list = $("#goalList");
  list.innerHTML = state.goals.length ? "" : '<div class="empty">Adicione um sonho ou meta para acompanhar com carinho.</div>';
  state.goals.forEach((goal) => {
    const card = document.createElement("article");
    card.className = "goal-card";
    card.innerHTML = `
      <div class="panel-head">
        <div>
          <h2>${escapeHtml(goal.name)}</h2>
          <p class="meta">${goal.category} · prazo ${formatDate(goal.deadline)}</p>
        </div>
        <button class="icon-btn" title="Excluir">×</button>
      </div>
      <div class="progress-track"><div class="progress-bar" style="width: ${clamp(goal.progress)}%"></div></div>
      <input type="range" min="0" max="100" value="${clamp(goal.progress)}" aria-label="Progresso">
      <p class="meta">${clamp(goal.progress)}% concluído</p>`;
    card.querySelector("input").addEventListener("input", (event) => {
      goal.progress = Number(event.target.value);
      saveAndRender();
    });
    card.querySelector("button").addEventListener("click", () => {
      state.goals = state.goals.filter((candidate) => candidate.id !== goal.id);
      saveAndRender();
    });
    list.appendChild(card);
  });
}

function renderHabits() {
  const list = $("#habitList");
  list.innerHTML = state.habits.length ? "" : '<div class="empty">Crie um hábito para cuidar da sua evolução.</div>';
  const today = NicoleStorage.today();
  state.habits.forEach((habit) => {
    const completedToday = habit.completions.includes(today);
    const card = document.createElement("article");
    card.className = "habit-card";
    card.innerHTML = `
      <div class="panel-head">
        <div>
          <h2>${escapeHtml(habit.name)}</h2>
          <p class="meta">Sequência de ${habitStreak(habit)} dias</p>
        </div>
        <button class="icon-btn" title="Excluir">×</button>
      </div>
      <div class="habit-calendar">${habitCalendar(habit)}</div>
      <button class="habit-toggle ${completedToday ? "secondary-btn" : "primary-btn"}">${completedToday ? "Feito hoje" : "Marcar hoje"}</button>`;
    card.querySelector('[title="Excluir"]').addEventListener("click", () => {
      state.habits = state.habits.filter((candidate) => candidate.id !== habit.id);
      saveAndRender();
    });
    card.querySelector(".habit-toggle").addEventListener("click", () => {
      habit.completions = completedToday
        ? habit.completions.filter((date) => date !== today)
        : [...new Set([...habit.completions, today])];
      saveAndRender();
    });
    list.appendChild(card);
  });
}

function renderSessions() {
  const list = $("#sessionList");
  list.innerHTML = "";
  if (!state.focusSessions.length) {
    list.innerHTML = '<div class="empty">As sessões de foco aparecerão aqui.</div>';
    return;
  }
  state.focusSessions.slice(0, 8).forEach((session) => {
    const item = document.createElement("article");
    item.className = "session-item";
    item.innerHTML = `<div><p class="title">${session.minutes} minutos focados</p><p class="meta">${formatDate(session.date)} às ${session.time}</p></div>`;
    list.appendChild(item);
  });
}

function updateStats() {
  const today = NicoleStorage.today();
  const doneToday = state.tasks.filter((task) => task.done && task.createdAt === today).length;
  const habitsToday = state.habits.filter((habit) => habit.completions.includes(today)).length;
  const totalMinutes = state.focusSessions.reduce((sum, session) => sum + session.minutes, 0);
  $("#doneToday").textContent = doneToday;
  $("#habitRate").textContent = `${state.habits.length ? Math.round((habitsToday / state.habits.length) * 100) : 0}%`;
  $("#focusMinutes").textContent = totalMinutes;
  $("#totalFocusTime").textContent = `${totalMinutes} min`;
}

function updateWeekSummary() {
  const entries = Object.entries(state.week);
  const all = entries.flatMap(([, items]) => items);
  const done = all.filter((item) => item.done).length;
  const best = entries
    .map(([day, items]) => ({ day, done: items.filter((item) => item.done).length }))
    .sort((a, b) => b.done - a.done)[0];
  $("#weekProgress").textContent = `${all.length ? Math.round((done / all.length) * 100) : 0}%`;
  $("#weekDone").textContent = done;
  $("#bestDay").textContent = best && best.done > 0 ? best.day : "-";
}

function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  modal.querySelector("form").reset();
}

function closeModals() {
  $$(".modal").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
}

function editTask(task) {
  openModal("taskModal");
  const form = $('[data-form="task"]');
  form.name.value = task.name;
  form.category.value = task.category;
  form.priority.value = task.priority;
  form.id.value = task.id;
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.interval = setInterval(() => {
    timer.seconds -= 1;
    if (timer.seconds <= 0) completeTimerCycle();
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  timer.running = false;
  clearInterval(timer.interval);
}

function resetTimer() {
  pauseTimer();
  timer.mode = "focus";
  timer.seconds = 25 * 60;
  updateTimerDisplay();
}

function completeTimerCycle() {
  pauseTimer();
  if (timer.mode === "focus") {
    const now = new Date();
    state.focusSessions.unshift({
      id: crypto.randomUUID(),
      minutes: 25,
      date: NicoleStorage.today(),
      time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    timer.mode = "break";
    timer.seconds = 5 * 60;
  } else {
    timer.mode = "focus";
    timer.seconds = 25 * 60;
  }
  saveAndRender();
  updateTimerDisplay();
}

function updateTimerDisplay() {
  $("#timerDisplay").textContent = `${String(Math.floor(timer.seconds / 60)).padStart(2, "0")}:${String(timer.seconds % 60).padStart(2, "0")}`;
  $("#focusMode").textContent = timer.mode === "focus" ? "Tempo de foco" : "Pausa delicada";
}

function habitCalendar(habit) {
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const iso = date.toISOString().slice(0, 10);
    return `<button class="habit-day ${habit.completions.includes(iso) ? "done" : ""}" title="${formatDate(iso)}">${date.getDate()}</button>`;
  }).join("");
}

function habitStreak(habit) {
  const completions = new Set(habit.completions);
  const date = new Date();
  let streak = 0;
  while (completions.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function clamp(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
