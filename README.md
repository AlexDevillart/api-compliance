API para Questionário Anticorrupção

Esta pasta contém um servidor HTTP simples (Node.js) que implementa o endpoint necessário para o front-end do projeto. Ele usa `dotenv` para carregar variáveis a partir de um arquivo `.env` e envia e-mails via SMTP usando Nodemailer.

Endpoints

- POST `/functions/v1/process-questionnaire`
  - Entrada: JSON com os campos do formulário (vide `src/types/form.ts`).
  - Saída (200): `{ success: true, message, analysis, emailId }`
  - Saída (erro): `{ success: false, error }` (HTTP 500)
  - CORS: habilitado para qualquer origem, incluindo preflight `OPTIONS`.

Variáveis de ambiente

- `OPENAI_API_KEY` (obrigatória): chave da API OpenAI.
- `SMTP_HOST` (obrigatório): host SMTP.
- `SMTP_PORT` (opcional): porta SMTP. Padrão: `587`.
- `SMTP_SECURE` (opcional): `true` para SSL (465); caso contrário usa STARTTLS. Padrão: `false`.
- `SMTP_USER` (obrigatório): usuário SMTP.
- `SMTP_PASS` (obrigatório): senha SMTP.
- `MAIL_FROM` (opcional): remetente. Padrão: `Questionário CVLB <no-reply@example.com>`.
- `MAIL_TO` (opcional): e-mail de destino. Padrão: `adevillart@gmail.com`.
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

# SMTP (exemplo genérico)
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario
SMTP_PASS=senha
MAIL_FROM="Questionário CVLB <no-reply@seuprovedor.com>"
MAIL_TO=adevillart@gmail.com
PORT=3001
```

3) Rode:

```
node server.js
```

Ao subir localmente, configure o front-end para apontar para este servidor, por exemplo:

- Defina `VITE_SUPABASE_URL` para `http://localhost:3001`.
- Defina `VITE_SUPABASE_ANON_KEY` com qualquer valor (é ignorado pelo servidor; aceito apenas para compatibilidade com o front-end).

Observações

- O servidor usa `axios` e `nodemailer`. Garanta Node >= 18.
- As chamadas externas (OpenAI e SMTP) ocorrem no momento da requisição; valide as credenciais.

