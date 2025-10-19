API para Questionário Anticorrupção

Esta pasta contém um servidor HTTP simples (Node.js) que implementa o endpoint necessário para o front-end do projeto. Ele usa `dotenv` para carregar variáveis a partir de um arquivo `.env`.

Endpoints

- POST `/functions/v1/process-questionnaire`
  - Entrada: JSON com os campos do formulário (vide `src/types/form.ts`).
  - Saída (200): `{ success: true, message, analysis, emailId }`
  - Saída (erro): `{ success: false, error }` (HTTP 500)
  - CORS: habilitado para qualquer origem, incluindo preflight `OPTIONS`.

Variáveis de ambiente

- `OPENAI_API_KEY` (obrigatória): chave da API OpenAI.
- `RESEND_API_KEY` (obrigatória): chave da API Resend.
- `RESEND_TO` (opcional): e-mail de destino. Padrão: `adevillart@gmail.com`.
- `PORT` (opcional): porta do servidor. Padrão: `3001`.

Como executar

1) Instale dependências (necessita rede):

```
cd api-server
npm install
```

2) Crie um arquivo `.env` dentro de `api-server/` (você pode copiar de `.env.example`) e defina as variáveis:

```
OPENAI_API_KEY=...
RESEND_API_KEY=...
RESEND_TO=adevillart@gmail.com
PORT=3001
```

3) Rode:

```
node server.js
```

Ao subir localmente, configure o front-end para apontar para este servidor, por exemplo:

- Defina `VITE_SUPABASE_URL` para `http://localhost:3001`.
- Defina `VITE_SUPABASE_ANON_KEY` com qualquer valor (é ignorado pelo servidor; é aceito apenas para compatibilidade com o front-end).

Observações

- O servidor usa `fetch` nativo do Node 18+. Garanta Node >= 18.
- As chamadas externas (OpenAI e Resend) ocorrem no momento da requisição; valide as chaves.
