# Mantella Standalone

Interface web para testar e simular conversas com o [Mantella Mod](https://www.nexusmods.com/skyrimspecialedition/mods/98631) sem precisar do Skyrim rodando.

---

## Pré-requisitos

| Ferramenta | Versão mínima               |
| ---------- | --------------------------- |
| Node.js    | 18+                         |
| Python     | 3.10+                       |
| Mantella   | rodando em `localhost:4999` |

---

## Estrutura do projeto

```
mantella-standalone/
├── frontend/          # React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── CharacterConfig.tsx   # Painel de configuração de personagens
│       │   ├── ChatWindow.tsx        # Área de chat
│       │   ├── MessageBubble.tsx     # Balões de mensagem
│       │   ├── DebugPanel.tsx        # Debug JSON
│       │   └── StatusBar.tsx         # Barra de status
│       ├── hooks/
│       │   └── useConversation.ts    # Lógica de estado da conversa
│       ├── services/
│       │   └── mantellaApi.ts        # Chamadas HTTP ao proxy
│       ├── types/
│       │   └── mantella.ts           # Tipos TypeScript
│       └── data/
│           └── presets.ts            # Presets de NPCs
└── backend/
    ├── proxy.py          # FastAPI proxy (CORS bridge)
    └── requirements.txt
```

---

## Instalação e execução

### 1. Backend proxy (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python proxy.py
```

O proxy iniciará em `http://localhost:8080`.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

A interface abrirá em `http://localhost:3000`.

### 3. Mantella

Certifique-se de que o Mantella está rodando em `http://localhost:4999` antes de iniciar conversas.

---

## Como usar

1. **Configure o jogador** — preencha nome, raça, gênero, localização e hora.
2. **Adicione NPCs** — use os presets (Lydia, Serana, Ulfric, etc.) ou configure manualmente.
3. **Inicie a conversa** — clique em "▶ Iniciar conversa".
4. **Converse** — digite no campo de texto e pressione Enter.
5. **Encerre** — clique em "✕ Encerrar conversa" ou feche o Mantella.

---

## Endpoints do proxy

| Método | Rota                  | Descrição                          |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/status`             | Verifica se o Mantella está online |
| POST   | `/start_conversation` | Inicia conversa com NPCs           |
| POST   | `/player_input`       | Envia fala do jogador              |
| POST   | `/end_conversation`   | Encerra a conversa                 |
| GET    | `/health`             | Health check do proxy              |

---

## Presets disponíveis

| NPC               | Raça     | Local sugerido                |
| ----------------- | -------- | ----------------------------- |
| Lydia             | Nord     | Breezehome, Whiterun          |
| Ulfric Stormcloak | Nord     | Palace of the Kings, Windhelm |
| Serana            | Nord     | Castle Volkihar               |
| Paarthurnax       | Nord     | Throat of the World           |
| Nazeem            | Redguard | Whiterun                      |

---

## Configuração avançada

### Alterar porta do Mantella

Edite `backend/proxy.py`:

```python
MANTELLA_BASE = "http://localhost:SUAPORTA"
```

### Alterar porta do proxy

Edite `backend/proxy.py`:

```python
uvicorn.run("proxy:app", host="0.0.0.0", port=SUAPORTA, ...)
```

E atualize `frontend/src/services/mantellaApi.ts`:

```typescript
const PROXY_BASE = "http://localhost:SUAPORTA";
```

---

## Solução de problemas

| Problema           | Causa provável                         | Solução                            |
| ------------------ | -------------------------------------- | ---------------------------------- |
| "Mantella offline" | Mantella não está rodando              | Inicie o Mantella no Skyrim ou MO2 |
| Erro 503           | Porta errada ou firewall               | Verifique `MANTELLA_BASE` no proxy |
| Erro CORS          | Frontend chamando Mantella diretamente | Use sempre o proxy em porta 8080   |
| Timeout            | Mantella demorando para responder      | Aumente `TIMEOUT` em `proxy.py`    |

---

## Licença

MIT — use à vontade para testes e desenvolvimento de mods.
