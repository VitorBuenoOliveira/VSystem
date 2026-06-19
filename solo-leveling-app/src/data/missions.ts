import type { Mission } from '../types'

export const MISSIONS: Mission[] = [
  // ── PRINCIPAIS — penalidade real se falhar ───────────────────────
  {
    id: 'orar',
    name: 'Orar e agradecer a Deus',
    type: 'principal',
    category: 'fe',
    xpReward: 20,
    xpPenalty: 15,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-fe',
    estimatedMinutes: 5,
    icon: '🙏'
  },
  {
    id: 'mensagem-ela',
    name: 'Mensagem carinhosa para ela',
    type: 'principal',
    category: 'amor',
    xpReward: 20,
    xpPenalty: 15,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-amor',
    estimatedMinutes: 2,
    icon: '❤️'
  },
  {
    id: 'dormir-23h',
    name: 'Dormir antes das 23h',
    type: 'principal',
    category: 'habito',
    xpReward: 15,
    xpPenalty: 20,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 0,
    icon: '😴'
  },
  {
    id: 'ds-30min',
    name: 'Estudar Data Science (30min)',
    type: 'principal',
    category: 'estudo',
    xpReward: 30,
    xpPenalty: 20,
    availableDays: ['seg','ter','qua','qui','sex'],
    dungeonId: 'dungeon-ds',
    estimatedMinutes: 30,
    icon: '💻'
  },
  {
    id: 'carater-dia',
    name: 'Fui uma boa pessoa hoje',
    type: 'principal',
    category: 'carater',
    xpReward: 20,
    xpPenalty: 10,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-carater',
    estimatedMinutes: 0,
    icon: '🕊️'
  },

  // ── SECUNDÁRIAS — importantes, sem penalidade ────────────────────
  {
    id: 'ler-10pag',
    name: 'Ler 10 páginas',
    type: 'secundaria',
    category: 'habito',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 15,
    icon: '📖'
  },
  {
    id: 'agua-2l',
    name: 'Beber 2L de água',
    type: 'secundaria',
    category: 'saude',
    xpReward: 10,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 0,
    icon: '💧'
  },
  {
    id: 'ingles-15min',
    name: 'Inglês 15min (Duolingo / app)',
    type: 'secundaria',
    category: 'ingles',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex'],
    dungeonId: 'dungeon-ingles',
    estimatedMinutes: 15,
    icon: '🌎'
  },
  {
    id: 'aula-ingles-sab',
    name: 'Aula de inglês (8h–12h)',
    type: 'secundaria',
    category: 'ingles',
    xpReward: 25,
    xpPenalty: 0,
    availableDays: ['sab'],
    dungeonId: 'dungeon-ingles',
    estimatedMinutes: 240,
    icon: '🏫'
  },
  {
    id: 'ds-1h',
    name: 'Sessão longa de Data Science (1h)',
    type: 'secundaria',
    category: 'estudo',
    xpReward: 40,
    xpPenalty: 0,
    availableDays: ['sab','dom'],
    dungeonId: 'dungeon-ds',
    estimatedMinutes: 60,
    icon: '💻'
  },

  // ── BÔNUS — só ganho, sem punição ───────────────────────────────
  {
    id: 'academia',
    name: 'Academia / Treino',
    type: 'bonus',
    category: 'saude',
    xpReward: 50,
    xpPenalty: 0,
    availableDays: ['sex','sab','dom'],
    dungeonId: 'dungeon-corpo',
    estimatedMinutes: 60,
    icon: '🏋️'
  },
  {
    id: 'ela-aqui',
    name: 'Ela está aqui — priorizei ❤️',
    type: 'bonus',
    category: 'amor',
    xpReward: 35,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-amor',
    estimatedMinutes: 0,
    icon: '👑'
  },
  {
    id: 'leitura-biblica',
    name: 'Leitura bíblica',
    type: 'bonus',
    category: 'fe',
    xpReward: 20,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-fe',
    estimatedMinutes: 15,
    icon: '📜'
  },

  // ── FAMÍLIA — ser filho que dá orgulho ───────────────────────────
  {
    id: 'pais-contato',
    name: 'Falar com os pais (ligação/mensagem)',
    type: 'secundaria',
    category: 'familia',
    xpReward: 20,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-familia',
    estimatedMinutes: 10,
    icon: '📞'
  },
  {
    id: 'pais-visita',
    name: 'Visitar / tempo de qualidade com os pais',
    type: 'bonus',
    category: 'familia',
    xpReward: 40,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-familia',
    estimatedMinutes: 120,
    icon: '👨‍👩‍👦'
  },

  // ── SIDE QUESTS EXTRAS — secundárias rotativas (sem penalidade) ──────
  {
    id: 'planejar-dia',
    name: 'Planejar o dia (manhã)',
    type: 'secundaria',
    category: 'habito',
    xpReward: 12,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex'],
    estimatedMinutes: 5,
    icon: '🗒️'
  },
  {
    id: 'alongamento',
    name: 'Alongamento / mobilidade',
    type: 'secundaria',
    category: 'saude',
    xpReward: 12,
    xpPenalty: 0,
    availableDays: ['seg','qua','sex'],
    dungeonId: 'dungeon-corpo',
    estimatedMinutes: 10,
    icon: '🤸'
  },
  {
    id: 'meditar',
    name: 'Meditar / respiração consciente',
    type: 'secundaria',
    category: 'fe',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['ter','qui','dom'],
    dungeonId: 'dungeon-fe',
    estimatedMinutes: 8,
    icon: '🧘'
  },
  {
    id: 'diario-noite',
    name: 'Escrever no diário / reflexão do dia',
    type: 'secundaria',
    category: 'carater',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-carater',
    estimatedMinutes: 8,
    icon: '✍️'
  },
  {
    id: 'organizar-espaco',
    name: 'Organizar o espaço / arrumar o quarto',
    type: 'secundaria',
    category: 'habito',
    xpReward: 12,
    xpPenalty: 0,
    availableDays: ['ter','qui','sab'],
    estimatedMinutes: 15,
    icon: '🧹'
  },
  {
    id: 'ingles-listening',
    name: 'Ouvir podcast / vídeo em inglês',
    type: 'secundaria',
    category: 'ingles',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','qua','sex'],
    dungeonId: 'dungeon-ingles',
    estimatedMinutes: 20,
    icon: '🎧'
  },
  {
    id: 'amigo-contato',
    name: 'Conversar com um amigo / fortalecer laços',
    type: 'secundaria',
    category: 'familia',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['qua','sab','dom'],
    dungeonId: 'dungeon-familia',
    estimatedMinutes: 15,
    icon: '🤝'
  },

  // ── SIDE QUESTS EXTRAS — bônus (só ganho) ───────────────────────────
  {
    id: 'projeto-portfolio',
    name: 'Avançar projeto pessoal / portfólio',
    type: 'bonus',
    category: 'estudo',
    xpReward: 45,
    xpPenalty: 0,
    availableDays: ['sab','dom'],
    dungeonId: 'dungeon-ds',
    estimatedMinutes: 45,
    icon: '🚀'
  },
  {
    id: 'refeicao-saudavel',
    name: 'Preparar uma refeição saudável',
    type: 'bonus',
    category: 'saude',
    xpReward: 30,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 30,
    icon: '🥗'
  },
  {
    id: 'ato-bondade',
    name: 'Ato de bondade — ajudar alguém hoje',
    type: 'bonus',
    category: 'carater',
    xpReward: 35,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    dungeonId: 'dungeon-carater',
    estimatedMinutes: 0,
    icon: '🤍'
  },
  {
    id: 'sol-manha',
    name: 'Tomar sol da manhã / ar livre',
    type: 'bonus',
    category: 'saude',
    xpReward: 25,
    xpPenalty: 0,
    availableDays: ['sab','dom'],
    estimatedMinutes: 15,
    icon: '🌅'
  },
  {
    id: 'tempo-ela-presente',
    name: 'Tempo de qualidade sem celular com ela',
    type: 'bonus',
    category: 'amor',
    xpReward: 40,
    xpPenalty: 0,
    availableDays: ['sex','sab','dom'],
    dungeonId: 'dungeon-amor',
    estimatedMinutes: 60,
    icon: '💞'
  },

  // ── FLEXÍVEIS — degraus baixos e genéricos (bônus, sem punição) ─────
  // Sem dungeonId de propósito: constroem atributo pela categoria, mas não
  // adiantam masmorra (a masmorra continua premiando o hábito focado).
  {
    id: 'estudo-livre',
    name: 'Estude qualquer coisa por 10 min',
    type: 'bonus',
    category: 'estudo',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 10,
    icon: '🧠'
  },
  {
    id: 'aprender-novo',
    name: 'Aprenda algo novo (vídeo, artigo, curiosidade)',
    type: 'bonus',
    category: 'estudo',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','qua','sex'],
    estimatedMinutes: 10,
    icon: '💡'
  },
  {
    id: 'mexer-corpo',
    name: 'Mexa o corpo 10 min (alongue, ande, dance)',
    type: 'bonus',
    category: 'saude',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 10,
    icon: '🤾'
  },
  {
    id: 'gratidao-momento',
    name: 'Momento de gratidão',
    type: 'bonus',
    category: 'fe',
    xpReward: 12,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex','sab','dom'],
    estimatedMinutes: 3,
    icon: '🌟'
  },
  {
    id: 'gesto-gentileza',
    name: 'Um pequeno gesto por alguém',
    type: 'bonus',
    category: 'carater',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','ter','qua','qui','sex'],
    estimatedMinutes: 0,
    icon: '🫶'
  },
  {
    id: 'zona-conforto',
    name: 'Saí da zona de conforto hoje',
    type: 'bonus',
    category: 'carater',
    xpReward: 25,
    xpPenalty: 0,
    availableDays: ['ter','qui','sab'],
    estimatedMinutes: 0,
    icon: '🔥'
  },
  {
    id: 'desconectar',
    name: 'Desconectar 30 min (sem telas)',
    type: 'bonus',
    category: 'habito',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['seg','qua','sex','dom'],
    estimatedMinutes: 30,
    icon: '🌙'
  },
  {
    id: 'criativo',
    name: 'Fiz algo criativo (escrever, desenhar, tocar)',
    type: 'bonus',
    category: 'habito',
    xpReward: 20,
    xpPenalty: 0,
    availableDays: ['qua','sab','dom'],
    estimatedMinutes: 20,
    icon: '🎨'
  },
  {
    id: 'natureza',
    name: 'Tempo ao ar livre / contato com a natureza',
    type: 'bonus',
    category: 'saude',
    xpReward: 20,
    xpPenalty: 0,
    availableDays: ['sab','dom'],
    estimatedMinutes: 20,
    icon: '🌳'
  },
  {
    id: 'conexao-querida',
    name: 'Conversa boa com alguém querido',
    type: 'bonus',
    category: 'familia',
    xpReward: 15,
    xpPenalty: 0,
    availableDays: ['sex','sab','dom'],
    estimatedMinutes: 15,
    icon: '💬'
  }
]
