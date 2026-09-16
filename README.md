# MiniDrive

Repositório feito para aprender Angular, NestJS e processamento assíncrono
como preparação para um processo seletivo.

MVP de armazenamento pessoal com NestJS, Angular, autenticação JWT e SQLite.
Os metadados ficam em `data/minidrive.sqlite` e o conteúdo em `arquivos/`.

## Funcionalidades

- login do usuário inicial configurado no ambiente;
- sessão JWT mantida durante a aba do navegador;
- upload concorrente de até 10 arquivos de 10 MB;
- rollback do lote se uma gravação ou transação falhar;
- listagem, renomeação e exclusão por proprietário.

## Executando

Requer Node.js 22 ou superior. Copie `.env.example` para `.env`, ajuste os
segredos e execute:

```bash
npm run setup
npm run start:dev --prefix mini-drive
npm start --prefix mini-drive-web
```

Acesse `http://localhost:4200`. O Angular encaminha `/api` para o backend em
`http://localhost:3000`.

## API

- `POST /api/auth/login`
- `GET /api/files`
- `POST /api/files` (`multipart/form-data`, campo `files`)
- `PATCH /api/files/:id`
- `DELETE /api/files/:id`

As rotas de arquivos exigem `Authorization: Bearer <token>`.
