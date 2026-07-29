const NicoleCharts = (() => {
  const charts = {};
  const colors = {
    rose: "#d97091",
    deep: "#9f4563",
    gold: "#b98b4b",
    sage: "#8ba989",
    lavender: "#9b8fc4",
    grid: "rgba(80, 50, 58, 0.09)",
    text: "#8d7d82"
  };

  function update(state) {
    Chart.defaults.color = colors.text;
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.plugins.legend.labels.boxWidth = 10;

    const days = Object.keys(state.week);
    const weeklyDone = days.map((day) => state.week[day].filter((item) => item.done).length);
    const weeklyTotal = days.map((day) => state.week[day].length);
    const taskDone = state.tasks.filter((task) => task.done).length;
    const taskOpen = Math.max(state.tasks.length - taskDone, 0);
    const habitNames = state.habits.map((habit) => habit.name.slice(0, 16));
    const habitCounts = state.habits.map((habit) => habit.completions.length);
    const goalNames = state.goals.map((goal) => goal.name.slice(0, 18));
    const goalProgress = state.goals.map((goal) => Number(goal.progress));

    render("weeklyChart", {
      type: "bar",
      data: {
        labels: days.map((day) => day.slice(0, 3)),
        datasets: [
          { label: "Concluídas", data: weeklyDone, backgroundColor: colors.rose, borderRadius: 8 },
          { label: "Planejadas", data: weeklyTotal, backgroundColor: "rgba(185,139,75,0.34)", borderRadius: 8 }
        ]
      },
      options: baseOptions()
    });

    render("tasksChart", {
      type: "doughnut",
      data: {
        labels: ["Concluídas", "Pendentes"],
        datasets: [{ data: [taskDone, taskOpen], backgroundColor: [colors.rose, colors.lavender], borderWidth: 0 }]
      },
      options: { ...baseOptions(), cutout: "70%", scales: undefined }
    });

    render("habitsChart", {
      type: "bar",
      data: {
        labels: habitNames.length ? habitNames : ["Sem hábitos"],
        datasets: [{ label: "Check-ins", data: habitCounts.length ? habitCounts : [0], backgroundColor: colors.sage, borderRadius: 8 }]
      },
      options: baseOptions()
    });

    render("goalsChart", {
      type: "line",
      data: {
        labels: goalNames.length ? goalNames : ["Sem metas"],
        datasets: [{
          label: "Progresso",
          data: goalProgress.length ? goalProgress : [0],
          borderColor: colors.gold,
          backgroundColor: "rgba(185,139,75,0.16)",
          fill: true,
          tension: 0.38
        }]
      },
      options: { ...baseOptions(), scales: scaledAxes(100) }
    });
  }

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: scaledAxes()
    };
  }

  function scaledAxes(max) {
    return {
      x: { grid: { color: "transparent" } },
      y: { beginAtZero: true, max, grid: { color: colors.grid } }
    };
  }

  function render(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(canvas, config);
  }

  return { update };
})();
