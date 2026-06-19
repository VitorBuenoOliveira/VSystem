// Versículos e Salmos curados (tradução católica). Leves — sem a Bíblia inteira.

export interface Verse {
  ref: string
  text: string
}

export const VERSES: Verse[] = [
  { ref: 'Filipenses 4,13', text: 'Tudo posso naquele que me fortalece.' },
  { ref: 'Josué 1,9', text: 'Sê forte e corajoso! Não temas, porque o Senhor teu Deus estará contigo por onde quer que andares.' },
  { ref: 'Isaías 40,31', text: 'Os que esperam no Senhor renovam as suas forças; correm e não se cansam, caminham e não se fatigam.' },
  { ref: 'Salmo 23,1', text: 'O Senhor é meu pastor, nada me faltará.' },
  { ref: 'Mateus 6,33', text: 'Buscai primeiro o Reino de Deus e a sua justiça, e tudo o mais vos será dado em acréscimo.' },
  { ref: 'Provérbios 3,5-6', text: 'Confia no Senhor de todo o teu coração e não te apoies na tua própria inteligência.' },
  { ref: 'Romanos 8,31', text: 'Se Deus é por nós, quem será contra nós?' },
  { ref: '1 Coríntios 16,13', text: 'Vigiai, permanecei firmes na fé, sede homens, sede fortes.' },
  { ref: 'Salmo 27,1', text: 'O Senhor é minha luz e minha salvação; a quem temerei?' },
  { ref: 'Jeremias 29,11', text: 'Eu sei os planos que tenho para vós: planos de paz e não de mal, para vos dar um futuro e uma esperança.' },
  { ref: 'Salmo 46,2', text: 'Deus é o nosso refúgio e a nossa força, auxílio sempre presente nas tribulações.' },
  { ref: 'Mateus 11,28', text: 'Vinde a mim todos vós que estais cansados e sobrecarregados, e eu vos aliviarei.' },
  { ref: 'Gálatas 6,9', text: 'Não nos cansemos de fazer o bem, pois no tempo devido colheremos, se não desfalecermos.' },
  { ref: 'Salmo 121,1-2', text: 'Levanto os meus olhos para os montes: de onde me virá o socorro? O meu socorro vem do Senhor.' },
  { ref: '2 Timóteo 1,7', text: 'Deus não nos deu um espírito de timidez, mas de fortaleza, de amor e de moderação.' },
  { ref: 'Eclesiastes 3,1', text: 'Para tudo há um tempo, e um momento para cada coisa debaixo do céu.' },
  { ref: 'Salmo 37,5', text: 'Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.' },
  { ref: 'Tiago 1,12', text: 'Feliz o homem que suporta a provação, porque, depois de aprovado, receberá a coroa da vida.' },
  { ref: 'Colossenses 3,23', text: 'Tudo o que fizerdes, fazei-o de coração, como para o Senhor e não para os homens.' },
  { ref: 'Salmo 118,24', text: 'Este é o dia que o Senhor fez; alegremo-nos e exultemos nele.' },
]

/** Versículo determinístico do dia (gira diariamente). */
export function getVerseOfDay(dateStr: string): Verse {
  const seed = dateStr.replace(/-/g, '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return VERSES[seed % VERSES.length]
}

// ── Salmos curados (para leitura) ──────────────────────────────────────────
export interface Psalm {
  id: string
  title: string
  text: string[]   // versículos
}

export const PSALMS: Psalm[] = [
  {
    id: 'salmo-23',
    title: 'Salmo 23 — O Bom Pastor',
    text: [
      'O Senhor é meu pastor, nada me faltará.',
      'Em verdes prados ele me faz repousar e me conduz às águas tranquilas.',
      'Restaura as forças de minha alma e me guia por caminhos retos, por amor do seu nome.',
      'Ainda que eu caminhe por um vale tenebroso, nenhum mal temerei, pois estais comigo.',
      'O vosso bastão e o vosso cajado são o meu amparo.',
      'Para mim preparais a mesa à vista de meus adversários.',
      'Derramais o perfume sobre a minha cabeça, e o meu cálice transborda.',
      'A vossa bondade e misericórdia hão de seguir-me por todos os dias de minha vida.',
      'E habitarei na casa do Senhor por longos dias.',
    ],
  },
  {
    id: 'salmo-91',
    title: 'Salmo 91 — Sob a proteção do Altíssimo',
    text: [
      'Tu que habitas sob a proteção do Altíssimo e moras à sombra do Onipotente,',
      'dize ao Senhor: sois meu refúgio e minha cidadela, meu Deus, em quem confio.',
      'Ele te livrará do laço do caçador e da peste perniciosa.',
      'Sob suas asas te abrigará, e em suas penas encontrarás refúgio.',
      'Não temerás os terrores da noite, nem a flecha que voa de dia.',
      'Porque aos seus anjos ele ordenou que te guardem em todos os teus caminhos.',
    ],
  },
  {
    id: 'salmo-27',
    title: 'Salmo 27 — O Senhor é minha luz',
    text: [
      'O Senhor é minha luz e minha salvação; a quem temerei?',
      'O Senhor é o protetor da minha vida; perante quem tremerei?',
      'Uma coisa peço ao Senhor e a procuro: habitar na casa do Senhor todos os dias de minha vida.',
      'Ele me esconde em seu abrigo no dia da desventura.',
      'Espera no Senhor e tem coragem; espera no Senhor!',
    ],
  },
]
