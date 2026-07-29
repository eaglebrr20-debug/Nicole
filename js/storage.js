const NicoleStorage = (() => {
  const key = "nicole-life-state-v1";
  const today = () => new Date().toISOString().slice(0, 10);
  const id = () => crypto.randomUUID();

  const defaults = {
    tasks: [
      { id: id(), name: "Organizar prioridades da manhã", category: "Momentos pessoais", priority: "Alta", done: false, createdAt: today() },
      { id: id(), name: "Revisar conteúdo da faculdade", category: "Faculdade", priority: "Média", done: true, createdAt: today() }
    ],
    week: {
      Segunda: [{ id: id(), name: "Estudos dirigidos", category: "Estudos", done: false }],
      Terça: [{ id: id(), name: "Exercícios", category: "Exercícios", done: false }],
      Quarta: [{ id: id(), name: "Projeto pessoal", category: "Projetos", done: true }],
      Quinta: [],
      Sexta: [],
      Sábado: [{ id: id(), name: "Momento de autocuidado", category: "Momentos pessoais", done: false }],
      Domingo: []
    },
    goals: [
      { id: id(), name: "Evoluir nos estudos", category: "Estudos", deadline: today(), progress: 38 },
      { id: id(), name: "Construir um portfólio lindo", category: "Projetos", deadline: today(), progress: 24 }
    ],
    habits: [
      { id: id(), name: "Leitura", completions: [today()] },
      { id: id(), name: "Beber água", completions: [today()] },
      { id: id(), name: "Autocuidado", completions: [] }
    ],
    focusSessions: [],
    journal: ""
  };

  function load() {
    const saved = localStorage.getItem(key);
    if (!saved) {
      save(defaults);
      return structuredClone(defaults);
    }

    try {
      return { ...structuredClone(defaults), ...JSON.parse(saved) };
    } catch {
      save(defaults);
      return structuredClone(defaults);
    }
  }

  function save(state) {
    localStorage.setItem(key, JSON.stringify(state));
  }

  return { load, save, today };
})();
