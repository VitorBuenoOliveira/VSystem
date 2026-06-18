# Projeto Monarca — Documentação Técnica e Funcional
**Beta 4.5** | React 19 + TypeScript + Vite | Solo Leveling RPG de Evolução Pessoal

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Estrutura de Dados (Types)](#3-estrutura-de-dados-types)
4. [Motor do Sistema (utils/index.ts)](#4-motor-do-sistema)
5. [Gerenciamento de Estado (usePlayerStore)](#5-gerenciamento-de-estado)
6. [Dados Estáticos (data/)](#6-dados-estáticos)
7. [Abas e Telas](#7-abas-e-telas)
8. [Componentes Globais](#8-componentes-globais)
9. [Sistema de Sons](#9-sistema-de-sons)
10. [Fluxo Completo de um Dia](#10-fluxo-completo-de-um-dia)

---

## 1. Visão Geral

O Projeto Monarca transforma hábitos e objetivos reais em um sistema de RPG estilo *Solo Leveling*. Cada missão cumprida concede XP, gold e avança dungeons. Falhas em missões principais geram penalidade de XP e missões de punição. O objetivo é crescer de Rank F até Rank S evoluindo de verdade nas áreas da vida: **Estudo, Saúde, Inglês, Amor e Fé**.

**Stack:** React 19, TypeScript, Vite, Tailwind v4  
**Storage:** `localStorage` chave `monarca-v2`  
**Visual:** fundo `#04060f`, neon azul `#3a8fff`, fontes Rajdhani + Share Tech Mono

---

## 2. Arquitetura

```
src/
├── types/index.ts          — interfaces de todos os objetos do jogo
├── utils/index.ts          — motor: applyDayEnd, calcAttributes, etc.
├── hooks/
│   ├── usePlayerStore.ts   — estado global + todas as actions
│   ├── useSounds.ts        — Web Audio API + mp3 de notificação
│   └── useCountdown.ts     — countdown do reset time
├── data/
│   ├── missions.ts         — missões fixas do jogo
│   ├── dungeons.ts         — dungeons + portões de requisito
│   ├── monthlyBoss.ts      — boss mensal com 3 tiers
│   ├── bonusMissions.ts    — pool de quests surpresa
│   ├── events.ts           — eventos aleatórios (XP/gold grátis)
│   ├── weeklyPool.ts       — gerador de missões semanais
│   ├── shadows.ts          — exército de sombras
│   ├── shop.ts             — perks e títulos
│   ├── achievements.ts     — conquistas
│   └── ranks.ts            — tabela de ranks e XP
├── components/
│   ├── DashboardScreen.tsx — aba Missões
│   ├── DungeonsScreen.tsx  — aba Masmorras
│   ├── ArmyScreen.tsx      — aba Exército
│   ├── VidaScreen.tsx      — aba Vida
│   ├── ShopScreen.tsx      — aba Loja
│   ├── StatsScreen.tsx     — aba Stats
│   ├── ProfileScreen.tsx   — aba Perfil
│   └── shared/             — Toast, EventBus, overlays
└── App.tsx                 — roteamento de abas + overlays globais
```

---

## 3. Estrutura de Dados (Types)

### `PlayerStats` — estado completo do jogador

| Campo | Tipo | Descrição |
|---|---|---|
| `name` | `string` | Nome do caçador |
| `totalXp` / `currentXp` | `number` | XP total acumulado |
| `rank` | `RankLabel` | F → E → D → C → B → A → S |
| `level` | `number` | Calculado por `√(totalXp/50)+1` |
| `gold` | `number` | Moeda do jogo |
| `totalHonorDays` | `number` | Total de dias honrados |
| `currentStreak` | `number` | Sequência atual de dias limpos |
| `longestStreak` | `number` | Melhor sequência histórica |
| `dungeons` | `Dungeon[]` | 5 masmorras com andar atual |
| `logs` | `DailyLog[]` | Histórico de cada dia encerrado |
| `achievements` | `Achievement[]` | Lista de conquistas (travadas/desbloqueadas) |
| `customMissions` | `Mission[]` | Missões criadas pelo usuário |
| `penaltyMissions` | `Mission[]` | Missões de punição geradas automaticamente |
| `shadows` | `Shadow[]` | Sombras do exército |
| `missionStreaks` | `Record<string,number>` | Dias consecutivos por missão |
| `boss` | `Boss \| null` | Boss pessoal atual |
| `monthlyBoss` | `MonthlyBoss \| null` | Boss do mês atual |
| `weeklyMissions` | `WeeklyMission[]` | Missões da semana atual |
| `allocatedPoints` | `Partial<PlayerAttributes>` | Pontos manuais alocados por atributo |
| `freeAttributePoints` | `number` | Pontos disponíveis para alocar |
| `dungeonKeys` | `number` | Chaves de masmorra disponíveis |
| `openedGates` | `string[]` | IDs de portões abertos (`"dungeonId:floor"`) |
| `activeBonusMission` | `BonusMission \| null` | Quest surpresa aceita no dia |
| `lastBonusMissionDate` | `string` | Para rolar máx 1 quest surpresa/dia |
| `sysLog` | `SysLog[]` | Log de atividades (máx 100 entradas) |
| `soundEnabled` | `boolean` | Liga/desliga sons |
| `resetTime` | `string` | Horário do reset automático (HH:MM) |
| `todayCompleted` | `string[]` | IDs de missões marcadas hoje |
| `lastActiveDate` | `string` | Data do último dia registrado |

### `Mission`

```
id, name, type (principal|secundaria|bonus|penalty|class)
category (estudo|amor|fe|saude|ingles|habito)
xpReward, xpPenalty, availableDays, dungeonId?, estimatedMinutes, icon
```

### `MonthlyBoss`

```
month, name, icon, hpMax, hp, defeated
rewXp, rewGold
damageCondition: 'any' | 'no_fail' | 'all_principals' | 'honor'
statRequirements    → tier Mínimo  (chance cap 50%)
statRequirementsMed → tier Médio   (chance cap 85%)
statRequirementsMax → tier Máximo  (chance cap 100%)
strengthMultiplier  → multiplicador de HP (aumenta se perder)
winRolled           → evita re-roll no mesmo mês
```

### `PlayerAttributes`

| Atributo | Fonte automática | Alias |
|---|---|---|
| `forca` | Missões categoria `saude` | STR |
| `inteligencia` | Missões `estudo` + `ingles` | INT |
| `espiritual` | Missões categoria `fe` | SPR |
| `carisma` | Missões categoria `amor` | CHA |
| `vitalidade` | Missões `habito` + `longestStreak/10` | VIT |

### `BonusMission` (Quest Surpresa)

```
id, name, icon, description
task        — instrução concreta do que fazer
category    — categoria para determinar cor e atributo
xpReward, goldReward
issuedAt    — data de emissão
completed   — se foi marcada como concluída
```

---

## 4. Motor do Sistema

Arquivo: `src/utils/index.ts`

### Helpers de data

| Função | O que faz |
|---|---|
| `todayStr()` | Retorna `"YYYY-MM-DD"` do dia atual |
| `addDaysStr(dateStr, days)` | Soma dias a uma string de data |
| `todayDayOfWeek()` | Retorna `'seg'` / `'ter'` etc. |
| `dayOfWeekFromDate(dateStr)` | Dia da semana de uma data específica |
| `secondsUntilReset(resetTime)` | Segundos até o próximo HH:MM |
| `formatCountdown(seconds)` | Formata `"HH:MM:SS"` |

### Missões

| Função | O que faz |
|---|---|
| `getAllMissions(custom, penalty)` | Base + custom + penalty |
| `getTodayMissions(custom, penalty)` | Missões disponíveis hoje (por dia da semana) |
| `getMissionName(id, stats)` | Nome de uma missão pelo ID |

### Atributos

| Função | O que faz |
|---|---|
| `calcBaseAttributes(stats)` | Conta missões por categoria no histórico, aplica curva `√n` |
| `calcAttributes(stats)` | Base + pontos manuais alocados |

**Curva de atributo:** `Math.floor(√missõesCompletas)` — com 4 missões o atributo chega em 2, com 9 chega em 3, com 16 em 4. Progresso visível desde o início, mas que exige constância para os níveis altos.

### Rank e Level

| Função | O que faz |
|---|---|
| `calcRank(totalXp)` | F→E→D→C→B→A→S por tabela de XP mínimo |
| `getRankProgress(totalXp)` | `{ current, needed, pct }` para a barra de XP |
| `calcLevel(totalXp)` | `floor(√(totalXp/50)) + 1` |

### Dia Honrado

```typescript
checkHonorDay(completedIds, customMissions): boolean
```
Retorna `true` se o jogador completou missões de **ao menos 3 categorias:**
- Mente: `estudo` **OU** `ingles`
- Amor: `amor`
- Fé: `fe`

Recompensa: +30 XP no encerramento + 1 Chave de Masmorra.

### `applyDayEnd` — núcleo do sistema

```typescript
applyDayEnd(stats, todayCompleted, forDate?, wasAutoReset?): DayEndResult
```

Esta é a função mais importante. Ela calcula e aplica **tudo** que acontece ao encerrar um dia:

1. **XP ativo** — soma XP de todas as missões concluídas
2. **Penalidade** — subtrai XP das principais que falharam (teto: `MAX_DAILY_PENALTY`)
3. **Honra** — +30 XP se dia honrado
4. **Shadow Army** — atualiza streaks por missão; cria nova sombra se streak ≥ 7; evolui tier das existentes; calcula XP passivo (cap: 30% do XP ativo)
5. **Boss pessoal** — distribui dano baseado em XP de missões concluídas; detecta derrota
6. **Missão de penalidade** — se falharam principais, adiciona `penalty-{date}` à lista
7. **Boss mensal** — verifica condição de dano (`no_fail` / `all_principals` / `honor` / `any`) + tier de atributos; distribui dano ao boss mensal
8. **XP total** — `earned + honorXp + passiveXp + bossXp + monthlyBossXp`
9. **Streak** — incrementa se zero falhas, zera se houve falha
10. **Log do dia** — registra `DailyLog` com missões, falhas, XP, honra
11. **SysLog** — entradas de texto com o que aconteceu
12. **Level-up** — calcula nível novo, concede `levelsGained * 2` pontos de atributo (nunca remove)
13. **Chaves** — +1 honrado, +2 boss derrotado, +3 boss mensal derrotado
14. **Masmorras** — avança andar das dungeons cujas missões foram concluídas (respeita portões)
15. **Missões semanais** — recalcula progresso; concede XP/gold/chave se completou
16. **Conquistas** — verifica todas as condições e desbloqueia novas

**Retorna `DayEndResult`:**
```typescript
{
  xpEarned, xpLost, netXp, passiveXp
  failedPrincipals: string[]
  honorBonus: boolean
  newStats: PlayerStats
  unlockedAchievements: string[]
  dungeonAdvances: { dungeonId, newFloor }[]
  newShadows: Shadow[]
  bossDefeated: boolean
  bossDamageDealt: number
  weeklyCompleted: string[]
  keysEarned: number
  wasAutoReset: boolean
}
```

### Portões de Masmorra

```typescript
checkGateRequirement(gate, stats, totalMissions): boolean
```

Tipos de portão e condição:

| Tipo | Condição |
|---|---|
| `streak` | `currentStreak >= value` |
| `level` | `level >= value` |
| `honor_days` | `totalHonorDays >= value` |
| `total_missions` | `totalMissions >= value` |
| `shadow` | `shadows.length >= value` |
| `rank` | Rank atual ≥ valor |
| `attribute` | `calcAttributes(stats)[attrKey] >= value` |

Para avançar um andar com portão: requisito atendido **E** portão aberto com chave (`openedGates.includes(gateId)`).

### Scores de Vida e Monarca

| Função | O que faz |
|---|---|
| `calcAreaScore(areaId, stats)` | 0–100 baseado em taxa de conclusão nos últimos 14 dias |
| `calcMonarcaScore(stats)` | Rank (30%) + Streak (25%) + Honra (20%) + Áreas de Vida (25%) |

---

## 5. Gerenciamento de Estado

Arquivo: `src/hooks/usePlayerStore.ts`

Hook principal. Lê do `localStorage` no mount, persiste em cada action.

### Mount (useEffect inicial)

Executado uma vez ao abrir o app:

1. **Auto-reset** — detecta dias perdidos desde `lastActiveDate`. Para cada dia sem log, chama `applyDayEnd(..., wasAutoReset=true)`. Usa `Set<string>` de datas logadas para garantir que nenhum dia seja processado mais de uma vez.

2. **Boss mensal** — se o mês mudou, resolve o boss anterior (`resolveBossEndOfMonth` rola dado com a `winChance` acumulada) e gera um novo (`generateMonthlyBoss`). Boss antigo sem `statRequirementsMed` é regenerado sem penalidade (migração de dados).

3. **Missões semanais** — se não existem missões para a semana atual (segunda-feira como início), gera novas via `generateWeeklyMissions`.

4. **Evento aleatório** (30% chance) — concede XP/gold instantaneamente, dispara `RandomEventOverlay` via EventBus.

5. **Quest Surpresa** (25% chance) — expira missão do dia anterior se não concluída, rola nova quest, dispara `BonusMissionOverlay` via EventBus.

### Actions

| Action | O que faz |
|---|---|
| `toggleMission(id)` | Marca/desmarca missão no `todayCompleted` |
| `endDay()` | Chama `applyDayEnd` com as missões de hoje |
| `addCustomMission(mission)` | Adiciona missão personalizada |
| `deleteCustomMission(id)` | Remove missão personalizada |
| `completePenaltyMission(id)` | Remove missão de penalidade sem recompensa |
| `createBoss(name, hp)` | Cria novo boss pessoal |
| `buyPerk(perkId)` | Compra perk na loja (desconta gold) |
| `equipTitle(titleId)` | Equipa um título desbloqueado |
| `syncTitles()` | Verifica e desbloqueia títulos conquistados |
| `setVidaGoal(areaId, goal)` | Define meta pessoal em área da Vida |
| `openGate(dungeonId)` | Valida requisito + tem chave → abre portão, -1 chave |
| `acceptBonusMission(mission)` | Salva quest surpresa como ativa |
| `completeBonusMission()` | Marca como concluída e concede XP + gold |
| `dismissBonusMission()` | Descarta quest sem penalidade |
| `allocatePoint(attr)` | Gasta 1 ponto livre no atributo escolhido |
| `deallocatePoint(attr)` | Devolve 1 ponto do atributo para livre |
| `setResetTime(time)` | Altera horário de reset |
| `setSoundEnabled(bool)` | Liga/desliga sons |
| `exportData()` | Baixa JSON com o estado completo |
| `importData(file)` | Importa JSON (com migração) |
| `updateName(name)` | Muda nome do caçador |
| `resetData()` | Apaga tudo e recomeça |

### `migrate(raw)` — migração de dados

Garante que estados salvos de versões antigas ganhem os novos campos com valores padrão. Toda vez que o app carrega, o estado salvo passa por `migrate()`.

---

## 6. Dados Estáticos

### `data/missions.ts` — Missões fixas

**Principais (com penalidade):**
| Missão | Categoria | Dias | XP/Pen |
|---|---|---|---|
| Orar e agradecer a Deus | Fé | Todos | 20/15 |
| Mensagem carinhosa para ela | Amor | Todos | 20/15 |
| Dormir antes das 23h | Hábito | Todos | 15/20 |
| Estudar Data Science (30min) | Estudo | Seg–Sex | 30/20 |

**Secundárias (sem penalidade):**
| Missão | Categoria | Dias | XP |
|---|---|---|---|
| Ler 10 páginas | Hábito | Todos | 15 |
| Beber 2L de água | Saúde | Todos | 10 |
| Inglês 15min | Inglês | Seg–Sex | 15 |
| Aula de inglês (8h–12h) | Inglês | Sábado | 25 |
| Sessão longa DS (1h) | Estudo | Sab/Dom | 40 |

**Bônus (só ganho):**
| Missão | Categoria | Dias | XP |
|---|---|---|---|
| Academia / Treino | Saúde | Sex/Sab/Dom | 50 |
| Ela está aqui — priorizei | Amor | Todos | 35 |
| Leitura bíblica | Fé | Todos | 20 |

### `data/dungeons.ts` — Masmorras e Portões

| Dungeon | Andares | Categoria | Missão relacionada |
|---|---|---|---|
| Masmorra do Data Scientist | 30 | Estudo | DS 30min / DS 1h |
| Forja do Corpo | 12 | Saúde | Academia |
| Caminho da Fluência | 24 | Inglês | Inglês 15min / Aula sábado |
| Arquiteto do Amor | 21 | Amor | Mensagem / Ela aqui |
| Fortaleza da Fé | 21 | Fé | Orar / Leitura bíblica |

**Portões por dungeon (exemplos):**
- `dungeon-ds:8` — Streak 5 dias
- `dungeon-ds:15` — Inteligência 3
- `dungeon-ds:25` — Inteligência 6
- `dungeon-corpo:7` — Força 3
- `dungeon-amor:12` — Carisma 3
- `dungeon-fe:12` — Espiritual 3

### `data/monthlyBoss.ts` — Boss Mensal

12 bosses (um por mês), cada um representando um inimigo psicológico:

| Mês | Boss | HP | Condição de Dano |
|---|---|---|---|
| Jan | O Procrastinador Eterno | 800 | Sem falhar principal |
| Fev | A Dúvida Interior | 900 | Completar TODAS as principais |
| Mar | O Vício da Tela | 750 | Sem falhar principal |
| Abr | A Preguiça do Corpo | 1000 | Dia Honrado |
| Mai | O Medo do Fracasso | 850 | Completar TODAS as principais |
| Jun | A Distração Constante | 950 | Sem falhar principal |
| Jul | O Isolamento | 800 | Dia Honrado |
| Ago | A Versão Mediocre de Você | 1200 | Completar TODAS as principais |
| Set | O Ceticismo | 700 | Sem falhar principal |
| Out | A Ansiedade | 1000 | Dia Honrado |
| Nov | O Conformismo | 900 | Completar TODAS as principais |
| Dez | O Ócio Final | 1100 | Dia Honrado |

**Sistema de tiers e chance de vitória:**
- `getBossTier(attrs, boss)` → verifica se atende requisitos Mín/Méd/Máx
- `calcWinChance(boss, attrs)` → `min(hpDrain%, tierCap)`
  - Tier Mínimo: cap 50%
  - Tier Médio: cap 85%
  - Tier Máximo: cap 100%
- `resolveBossEndOfMonth(boss, attrs)` → rola dado no virar do mês; derrota: +15% HP no próximo; vitória: -5% HP no próximo

### `data/bonusMissions.ts` — Quest Surpresa (13 quests)

| Categoria | Exemplos |
|---|---|
| Saúde | 20 flexões, 2km de caminhada, 2L de água |
| Amor | Mensagem carinhosa, áudio especial |
| Estudo | 30min de código extra, revisar anotações |
| Inglês | 10min bônus, 5 frases em inglês |
| Fé | 5min de oração, versículo + reflexão |
| Hábito | Dormir antes de meia-noite, 3 gratidões |

`rollBonusMission(date, hasActive)` — 25% de chance/dia, retorna `null` se já tem quest ativa.

### `data/events.ts` — Eventos Aleatórios (8 eventos)

`rollRandomEvent(date)` — 30% de chance/dia. Concede XP/gold instantaneamente via popup:
- Runa Antiga (+80 XP), Baú da Masmorra (+40G), Sussurro das Sombras (+60 XP +20G)
- Marca do Caçador (+100 XP), Portal Dourado (+50G), Favor do Monarca (+120 XP +30G)
- Provação de Ferro (+90 XP +10G), Pergaminho Esquecido (+70 XP +15G)

### `data/weeklyPool.ts`

Gera 3 missões semanais aleatórias toda segunda-feira. Tipos:
- `missions` — completar N missões no total
- `category` — completar N missões de uma categoria
- `honor` — ter N dias honrados na semana

Recompensa: XP + gold + 1 Chave de Masmorra por missão completada.

### `data/shadows.ts` — Exército de Sombras

Sombra criada quando streak de uma missão ≥ 7 dias consecutivos.

**Tiers de evolução:**
| Tier | Dias | Bônus |
|---|---|---|
| Comum | 7 | Base |
| Elite | 21 | Power × 1.5 |
| General | 60 | Power × 3 |
| Monarca | 120 | Power × 6 |

XP passivo diário = soma do poder das sombras (cap: 30% do XP ativo do dia).

### `data/shop.ts` — Loja

**Perks (melhorias permanentes):** comprados com gold, efeito narrativo/bônus.  
**Títulos:** desbloqueados por conquistas, equipados no perfil. Aparecem no header do dashboard.

### `data/achievements.ts`

Conquistas verificadas a cada `applyDayEnd`. Exemplos: primeiro boss derrotado, 7 dias de streak, primeira sombra invocada, rank E alcançado, etc.

### `data/ranks.ts`

| Rank | XP Mínimo |
|---|---|
| F | 0 |
| E | 500 |
| D | 1.500 |
| C | 3.500 |
| B | 7.000 |
| A | 14.000 |
| S | 28.000 |

`MAX_DAILY_PENALTY = 60 XP` — teto de penalidade por dia  
`HONOR_BONUS_XP = 30 XP` — bônus do dia honrado

---

## 7. Abas e Telas

### ⚔️ Missões (Dashboard)

**O que mostra:**
- Header: nome, nível, XP total, título equipado, badge "HONRADO", botão STATUS
- Barra de XP do rank atual
- Streak, Gold, Countdown até o reset
- Panel de status colapsável (detalhes de progressão)
- **Quest Surpresa ativa** (se aceita) com botão CONCLUIR
- Seções de missões: Principais / Secundárias / Bônus / Penalidade
- Formulário de criação de missão personalizada
- Painel de resultado do dia encerrado

**Ações disponíveis:**
- Marcar/desmarcar missões (toggle)
- Criar missão personalizada (qualquer tipo, categoria, dias)
- Excluir missão personalizada
- Concluir quest surpresa
- Encerrar o Dia (com confirmação)

**Encerrar o Dia:**  
Só pode encerrar uma vez (desaparece o botão depois que `todayLogged = true`). Ao encerrar: aplica `applyDayEnd`, exibe resultado (XP ganho/perdido, honra, chaves, dungeons que avançaram), dispara toasts.

---

### 🏰 Masmorras (Dungeons)

**O que mostra:**
- Contador de 🔑 chaves disponíveis
- Cards de cada dungeon com: andar atual / total, barra de progresso, tier do boss mensal
- Portão de andar (se existir): requisito, status e botão "ABRIR PORTÃO (1 CHAVE)"
- Cards dos 3 tiers do boss mensal (clicáveis para ver requisitos de atributo)
- Progress bars de atributos por tier (Mínimo / Médio / Máximo)

**Mecânica de portão:**
1. Missão da dungeon é completada → sistema tenta avançar o andar
2. Se o próximo andar tem portão: verifica requisito (`checkGateRequirement`) E se `openedGates` contém o ID
3. Para abrir: clicar "ABRIR PORTÃO" — valida requisito atendido + tem ≥ 1 chave → subtrai 1 chave, adiciona ao `openedGates`

**Aquisição de chaves 🔑:**
- +1 por Dia Honrado
- +2 por derrotar o boss pessoal
- +3 por derrotar o boss mensal
- +1 por completar missão semanal

---

### 🌑 Exército (Army)

**O que mostra:**
- Lista de sombras invocadas (por streak ≥ 7 de uma missão)
- Tier de cada sombra: Comum / Elite / General / Monarca
- Poder individual e XP passivo que gera
- Total de XP passivo do exército

**Mecânica de sombras:**
- Uma sombra representa a versão "sombra" de um hábito que você manteve por 7+ dias
- O nome é gerado automaticamente a partir do nome da missão (ex: "Sombra do Estudo")
- A sombra evolui de tier conforme os dias acumulados crescem: Comum → Elite (21d) → General (60d) → Monarca (120d)
- Se você quebrar o streak, a sombra não some — ela para de evoluir mas permanece

---

### ❤️ Vida

**O que mostra:**
- 4 áreas de vida com score 0–100 (calculado nos últimos 14 dias):
  - **Relacionamento** (missões de amor)
  - **Espiritual** (missões de fé)
  - **Saúde** (missões de saúde)
  - **Conhecimento** (estudo + inglês)
- Score Monarca (composto): Rank 30% + Streak 25% + Honra 20% + Vida 25%
- Campo de texto para definir meta pessoal de cada área

**Como o score é calculado:**  
Para cada área, filtra as missões relevantes, verifica nos últimos 14 logs quantas foram completadas vs. quantas deveriam ter sido, calcula percentual.

---

### ◈ Loja (Shop)

**O que mostra:**
- Saldo de Gold atual
- Lista de Perks disponíveis com custo e descrição
- Lista de Títulos desbloqueados e disponíveis

**Como funciona:**
- Perks comprados com gold — efeito narrativo ou de gameplay
- Títulos desbloqueados por conquistas (verificado via `syncTitles()`)
- Título equipado aparece no header do Dashboard entre 「 」

---

### 📊 Stats

**O que mostra:**
- **Radar de Atributos** (5 eixos): valores reais de Força / INT / SPR / CHA / VIT com glow neon
- **Painel de Alocação**: para cada atributo mostra Base + Alocado + Total, com botões +/−
  - Pontos livres ganhos: 2 por level-up (nunca removidos se o nível cair)
- **Gráfico de XP** (últimos 21 dias): barras com linha de média
- **Heatmap de atividade** (14 semanas): célula por dia, intensidade = missões concluídas
- Estatísticas gerais: total de logs, missões, dias honrados, maior streak

**Alocação de pontos:**  
`allocatePoint(attr)` — gasta 1 ponto livre, adiciona 1 ao atributo. Permanente mas reversível (`deallocatePoint` devolve para o pool). Útil para impulsionar atributos importantes para o boss mensal do mês.

---

### 👤 Perfil

**O que mostra:**
- Nome e rank atual
- Botão de editar nome
- Conquistas desbloqueadas (com data)
- Boss pessoal: HP atual, barra de progresso, histórico de batalhas
- Configurações: horário de reset, horário de dormir, toggle de som
- Export / Import de dados (JSON)
- Botão de reset completo

**Boss pessoal:**  
Criado manualmente (nome + HP). Recebe dano diário proporcional ao XP das missões concluídas (`xpReward / 4`, mínimo 5). Ao ser derrotado: +XP +gold + 2 chaves + novo boss pode ser criado.

---

## 8. Componentes Globais

### `Toast` / `toast()`

Sistema de notificações no topo. Chamado via `toast(message, type)` em qualquer lugar.  
Tipos: `success` (verde), `error` (vermelho), `info` (azul), `honor` (dourado).  
Cada toast toca o som de notificação (com debounce de 400ms para não empilhar).

### `RandomEventOverlay`

Popup dourado que aparece ao abrir o app (30% chance). Mostra nome, ícone e recompensa. Auto-fecha em 4s ou ao tocar. XP/gold já foram creditados antes do popup aparecer.

### `BonusMissionOverlay`

Popup azul que aparece ao abrir o app (25% chance, depois do evento aleatório). Mostra a quest surpresa com nome, descrição, tarefa concreta e recompensa.  
- **ACEITAR**: salva `activeBonusMission` no estado → card aparece no Dashboard
- **IGNORAR**: não penaliza, some e `lastBonusMissionDate` é marcado para não rolar novamente hoje

### `RankUpOverlay`

Aparece automaticamente quando o rank muda após `endDay`. Animação de ascensão de rank.

### `EventBus`

Módulo simples de pub/sub para comunicar entre `usePlayerStore` (que dispara eventos) e `App.tsx` (que registra handlers e renderiza overlays):
- `registerEventHandler` / `triggerEvent` — evento aleatório
- `registerBonusMissionHandler` / `triggerBonusMission` — quest surpresa

### `SLFrame`

Componente de UI que renderiza os cantos SVG estilo Solo Leveling em volta de qualquer conteúdo. Aceita `glowColor` para variar a cor dos cantos.

---

## 9. Sistema de Sons

Arquivo: `src/hooks/useSounds.ts`

| Som | Quando toca |
|---|---|
| `playNotificationSound()` | Cada toast que aparece (mp3 Solo Leveling) |
| `playSystemOpen()` | Ao abrir o Dashboard |
| `playMissionComplete()` | Ao marcar uma missão |
| `playPenalty()` | Se falharam principais ao encerrar o dia |
| `playHonorOrRankUp()` | Dia honrado ou rank up |
| `playDungeonFloor()` | Ao avançar andar de dungeon |

**Mp3 (`/public/system-notification.mp3`):** o som de notificação do Solo Leveling. Tocado com debounce de 400ms — vários toasts simultâneos disparam só 1 som.

**Toggle:** `soundEnabled` no `PlayerStats` (configurado na aba Perfil). A função `soundsEnabled()` lê direto do localStorage para funcionar sem prop drilling.

---

## 10. Fluxo Completo de um Dia

```
MANHÃ — Abre o app
  ↓
  [Mount do usePlayerStore]
  ├── Auto-reset? → processa dias perdidos com applyDayEnd(wasAutoReset=true)
  ├── Mês novo? → resolve boss anterior, gera novo boss mensal
  ├── Semana nova? → gera 3 missões semanais
  ├── Evento aleatório (30%) → credita XP/gold, dispara RandomEventOverlay
  └── Quest Surpresa (25%) → dispara BonusMissionOverlay
        ├── ACEITAR → card aparece no Dashboard
        └── IGNORAR → nada acontece

AO LONGO DO DIA
  ↓
  [Dashboard]
  ├── Marca missões como concluídas (toggle)
  ├── Concluir Quest Surpresa (botão CONCLUIR) → XP + gold imediato
  └── Abre portões de dungeon (aba Masmorras) quando requisito atendido

FINAL DO DIA — "Encerrar o Dia"
  ↓
  [applyDayEnd(stats, todayCompleted)]
  ├── Calcula XP ativo + penalidades
  ├── Honra? (+30 XP, +1 chave)
  ├── Shadow Army: atualiza streaks, cria/evolui sombras, calcula XP passivo
  ├── Boss pessoal: distribui dano, detecta derrota (+2 chaves)
  ├── Boss mensal: verifica condição + tier de atributos, distribui dano
  ├── Atualiza rank, level, streak, gold
  ├── Avança andares das dungeons
  ├── Recalcula missões semanais
  ├── Verifica conquistas
  └── Salva tudo no localStorage

  [Toasts informativos na tela]:
    → XP ganho/perdido
    → Dia Honrado
    → Chaves ganhas
    → Dungeons que avançaram
    → Sombras invocadas
    → Boss derrotado
    → Missões semanais completas
```

---

## Glossário

| Termo | Significado |
|---|---|
| **Dia Honrado** | Dia em que completou missões de mente + amor + fé |
| **Streak** | Sequência de dias sem falhar nenhuma principal |
| **Sombra** | Representação de um hábito mantido por 7+ dias consecutivos |
| **Tier (boss)** | Nível de atributos do jogador vs. requisitos do boss (Mín/Méd/Máx) |
| **Chave 🔑** | Recurso estratégico para abrir portões de dungeon |
| **Auto-reset** | Processo automático que encerra dias passados ao reabrir o app |
| **Quest Surpresa** | Missão bônus aleatória com tarefa concreta; expira ao virar o dia |
| **Evento Aleatório** | Recompensa instantânea de XP/gold, sem tarefa a cumprir |
| **XP Passivo** | XP gerado pelo exército de sombras (cap: 30% do XP ativo) |
| **Penalidade** | XP negativo por falhar principal + missão extra de punição |
