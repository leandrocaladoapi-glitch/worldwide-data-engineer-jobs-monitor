# Worldwide Data Engineer Jobs Monitor

Este é um projeto em **Next.js** focado em agregar e validar rigorosamente vagas de **Data Engineer** abertas **mundialmente**.

## Objetivo do Projeto

O sistema varre múltiplas fontes de vagas (APIs e RSS de Remotive, RemoteOK, We Work Remotely, Jobicy, Arbeitnow, e Hacker News), e passa cada vaga por dois portões (gates) de validação extremamente rigorosos:

1. **Gate 1 - Cargo (Role):** Verifica se o cargo é estritamente voltado a Engenharia de Dados. Rejeita automaticamente vagas relacionadas a Cientista de Dados, Analista de Dados, Engenharia de Software generalista, Gerente de Produto, AI/Video Editor, etc.
2. **Gate 2 - Disponibilidade Mundial (Worldwide):** Analisa a localização e descrição da vaga procurando evidências explícitas de que candidatos de qualquer lugar do mundo podem se candidatar ("Work from anywhere", "Worldwide", "Global"). Vagas que possuem restrições geográficas (ex: "US Only", "Canada", "EU Only") são rejeitadas.

> **Regra de Sucesso:** Uma ingestão só é considerada "sucesso" se o número de vagas aceitas for maior ou igual a 30. Dado o rigor do filtro, execuções com poucas vagas verdadeiramente "Worldwide" reprovarão graciosamente. Nenhuma vaga fictícia ou sintética é introduzida no banco de dados.

## Tecnologias Utilizadas

- **Next.js (App Router):** Framework React.
- **TypeScript:** Tipagem estática.
- **Tailwind CSS:** Estilização de componentes.
- **Prisma ORM:** Modelagem e acesso ao banco de dados.
- **SQLite (Dev) / PostgreSQL (Prod):** Banco de dados relacional (por padrão utiliza SQLite localmente, ideal trocar para Postgres no Vercel).
- **Fast XML Parser:** Parseamento de feeds RSS (We Work Remotely).

## Estrutura do Banco de Dados

- **Job:** Armazena todas as vagas ingeridas com seu respectivo `status` (`ACCEPTED`, `REJECTED`, `DUPLICATE`, `INVALID`) e as justificativas ou evidências textuais coletadas.
- **IngestionRun:** Armazena um histórico das rodadas de ingestão, detalhando quantidades processadas e o motivo de eventual falha da meta de 30 vagas.

## Instruções de Uso Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicialize e popule o banco SQLite local com o Prisma:
   ```bash
   npx prisma migrate dev
   ```

3. Suba a aplicação (background):
   ```bash
   npm run dev &
   ```

4. Acesse http://localhost:3000
   - Clique em **"Trigger Manual Ingestion"** para varrer as APIs.
   - Navegue para **"Admin / Logs"** para ver a quebra minuciosa da análise de vagas.

---

## Passo a Passo: Como realizar o deploy na Vercel

Uma vez que a Vercel opera em arquitetura Serverless, não é possível utilizar bancos de dados baseados em arquivos estáticos (como SQLite) caso você pretenda manter o estado entre as execuções e deploys. Siga este processo:

### 1. Configure um Banco de Dados na Vercel (PostgreSQL)

1. Acesse sua conta no painel do [Vercel](https://vercel.com/).
2. Vá para a aba **Storage**.
3. Crie um novo banco de dados clicando em **Create Database** e escolha **Postgres**. Siga as instruções para finalizar a configuração.
4. Após criado, vá na aba `.env.local` dentro das configurações do banco no Vercel, clique em "Show Secret" e copie a variável `POSTGRES_PRISMA_URL`. Você usará esse valor como `DATABASE_URL`.

### 2. Modifique o Prisma para usar PostgreSQL

Localmente, no arquivo `prisma/schema.prisma`, altere o provedor de dados de SQLite para PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

E no seu projeto, instale o Prisma e certifique-se de que não exista menção chumbada (hardcoded) ao "dev.db" no arquivo `src/lib/prisma.ts`. Deixe como:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3. Conecte seu repositório à Vercel e faça Deploy

1. No dashboard da Vercel, clique em **Add New... > Project**.
2. Importe o seu repositório no GitHub contendo este código.
3. No painel de configuração de Deploy do Vercel, configure a Build:
   - Framework Preset: **Next.js**
   - Na seção **Environment Variables**, adicione as variáveis de ambiente relacionadas ao banco que você acabou de criar. Adicione especificamente:
     - **Key:** `DATABASE_URL`
     - **Value:** `[Cole aqui a string de conexão POSTGRES_PRISMA_URL que a Vercel Storage te deu]`
4. O Vercel geralmente roda a build normal (Next.js), mas para rodar as tabelas do Prisma, edite o comando de "Build Command" (em Settings > General) de `next build` para:
   ```bash
   npx prisma generate && npx prisma migrate deploy && next build
   ```
5. Clique em **Deploy**.

Uma vez publicado, a URL fornecida pela Vercel terá o seu projeto completo rodando com um PostgreSQL na nuvem, preservando logs e histórico das ingestões processadas manualmente!
