---
description: Code review — local diff, MR или PR
argument-hint: [mr-iid | mr-url | pr-url | пусто = local]
---

# Code Review

**Input:** $ARGUMENTS · Протокол: `04-verify-and-done.mdc`

| Input         | Режим                                                                                 |
| ------------- | ------------------------------------------------------------------------------------- |
| Пусто         | **Local** — `git diff --name-only HEAD`, файлы целиком                                |
| MR/PR IID/URL | **MR или PR** — инструмент по доступным серверам (GitLab — GitKraken User-расширение) |

Платформа — по remote проекта: GitLab MR или GitHub PR.

1. Файлы целиком
2. CRITICAL → LOW (`04`, Nuxt/Nitro)
3. `pnpm lint:all`; L+ — `pnpm build`; pipeline для MR/PR

Отчёт: **OK** | **FIX REQUIRED** | **BLOCK** + pipeline.
