# NestJS AI Doc Generator

A hobby/vibe-coded CLI tool that automatically generates **DTOs** and **Swagger decorators** for NestJS projects using AI (Gemini 2.5 Flash via LangGraph).

> Built for my own projects. Works well enough for me — feel free to fork and customize it for yours.

---

## What it does

Point it at a NestJS project and it will:

1. **Parse** every controller endpoint via TypeScript AST (ts-morph)
2. **Trace** service method calls to understand actual business logic
3. **Generate** typed DTOs with `class-validator` + `class-transformer`
4. **Generate** `@ApiOperation`, `@ApiBody`, `@ApiResponse` Swagger decorators
5. **Write** the output files next to your controllers — **without touching your existing code**

### Output structure

```
src/
  users/
    users.controller.ts          ← untouched
    users.controller.decorators.ts  ← generated (Swagger decorators)
    dto/
      create-user.request.dto.ts   ← generated
      create-user.response.dto.ts  ← generated
```

---

## Stack

| Layer | Tool |
|-------|------|
| AST parsing | [ts-morph](https://ts-morph.com/) |
| LLM | Gemini 2.5 Flash via `@langchain/google` |
| Orchestration | [LangGraph](https://langchain-ai.github.io/langgraphjs/) |
| Schema validation | Zod |
| Runtime | `tsx` (no build step needed) |

---

## Setup

```bash
git clone https://github.com/Ugur-Atakan/AI-Documentator.git
cd nestjs-ai-doc-gen
npm install
```

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

---

## Usage

```bash
npm run doc-gen -- --project /path/to/your/nestjs-project
```

Or directly:

```bash
tsx doc-gen.ts --project /path/to/your/nestjs-project
```

The tool processes each endpoint one at a time and logs progress:

```
[1/12] Processing: POST /users
  [DTO] POST /users
  [Swagger] POST /users
  Written: 3 files
    src/users/dto/create-user.request.dto.ts
    src/users/dto/create-user.response.dto.ts
    src/users/users.controller.decorators.ts

[2/12] Processing: GET /users/:id
...

Done. 12 completed, 0 failed.
```

---

## Prisma support

If your project has a `schema.prisma`, the parser detects which Prisma models each endpoint touches and sends only the relevant schema to the LLM — keeping token usage low.

---

## Customization

This project is intentionally simple and opinionated. The easiest things to change:

- **Prompts** — `src/prompts/dto-prompt.ts` and `src/prompts/swagger-prompt.ts`
- **LLM model** — swap `gemini-2.5-flash` in `src/graph/doc-gen-graph.ts` for any model supported by LangChain
- **Output format** — `src/nodes/file-writer.ts` controls where and how files are written
- **Parser behavior** — `src/parser/nestjs-parser.ts` for AST traversal logic

---

## Limitations

- Only handles standard NestJS controller patterns (`@Get`, `@Post`, etc.)
- Generated code is a starting point — review before committing
- No incremental mode yet (re-runs process all endpoints)
- Tested on my own projects, YMMV

---

## License

MIT — do whatever you want with it.
