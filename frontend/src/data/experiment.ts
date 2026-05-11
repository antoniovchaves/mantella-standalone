// =============================================================================
// CONFIGURAÇÃO DO EXPERIMENTO
// Edite este arquivo para personalizar o contexto e as perguntas.
// =============================================================================

export interface LikertQuestion {
  id: string;
  text: string;
  anchorLow: string;  // rótulo do extremo esquerdo (ex: "Discordo totalmente")
  anchorHigh: string; // rótulo do extremo direito (ex: "Concordo totalmente")
}

// -----------------------------------------------------------------------------
// TEXTO DE CONTEXTO
// Mostrado ao participante antes de iniciar qualquer conversa.
// Suporta quebras de linha com \n\n para parágrafos.
// -----------------------------------------------------------------------------
export const EXPERIMENT_CONTEXT = `
Bem-vindo ao experimento de avaliação de diálogos com personagens virtuais.

Neste estudo, você irá conversar com um personagem do jogo Skyrim por meio de uma interface de chat. O personagem é controlado por um modelo de linguagem (LLM) integrado ao sistema Mantella.

Seu objetivo é conduzir uma conversa natural com o personagem, como faria dentro do jogo. Não há respostas certas ou erradas — queremos entender como você percebe a experiência de interagir com este tipo de personagem.

Após a conversa, você responderá um breve questionário sobre sua experiência.

Instruções:
• Converse normalmente com o personagem por pelo menos 5 mensagens
• Quando sentir que a conversa chegou a um ponto natural de encerramento, clique em "Encerrar experimento"
• Em seguida, responda o questionário com sinceridade

Este experimento tem duração estimada de 10 a 15 minutos.

Obrigado por participar!
`.trim();

// -----------------------------------------------------------------------------
// PERGUNTAS DO QUESTIONÁRIO
// Cada pergunta tem: id único, texto, âncora baixa e âncora alta.
// Para escala Likert de 7 pontos:
//   Range: slider contínuo de 1 a 7
//   Clássico: botões rotulados 1–7
// -----------------------------------------------------------------------------
export const QUESTIONNAIRE: LikertQuestion[] = [
  {
    id: 'q1',
    text: 'O personagem pareceu compreender o que eu quis dizer.',
    anchorLow: 'Discordo totalmente',
    anchorHigh: 'Concordo totalmente',
  },
  {
    id: 'q2',
    text: 'As respostas do personagem foram coerentes com sua personalidade.',
    anchorLow: 'Discordo totalmente',
    anchorHigh: 'Concordo totalmente',
  },
  {
    id: 'q3',
    text: 'A conversa me pareceu natural e fluida.',
    anchorLow: 'Totalmente artificial',
    anchorHigh: 'Totalmente natural',
  },
  {
    id: 'q4',
    text: 'Senti que estava conversando com um personagem que "existe" no mundo do jogo.',
    anchorLow: 'Discordo totalmente',
    anchorHigh: 'Concordo totalmente',
  },
  {
    id: 'q5',
    text: 'A experiência foi satisfatória.',
    anchorLow: 'Nada satisfatória',
    anchorHigh: 'Muito satisfatória',
  },
  {
    id: 'q6',
    text: 'Eu me engajei emocionalmente com o personagem durante a conversa.',
    anchorLow: 'Nenhum engajamento',
    anchorHigh: 'Alto engajamento',
  },
  {
    id: 'q7',
    text: 'Gostaria de ter conversas assim com outros personagens do jogo.',
    anchorLow: 'Discordo totalmente',
    anchorHigh: 'Concordo totalmente',
  },
];

// -----------------------------------------------------------------------------
// METADADOS DO EXPERIMENTO
// Incluídos no JSON/CSV exportado.
// -----------------------------------------------------------------------------
export const EXPERIMENT_META = {
  title: 'Avaliação de Diálogos com NPCs via LLM',
  version: '1.0',
  scale: 5,         // pontos na escala Likert
  scaleMin: 1,
  scaleMax: 5,
};
