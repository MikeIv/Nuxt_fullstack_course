---
description: Создать или обновить brief.md из шаблона
argument-hint: [описание задачи или пусто = из контекста чата]
---

# Brief

**Input:** $ARGUMENTS · Шаблон: `.planning/brief-template.md` · Правила: `01`, `02`, `90`

1. Если `brief.md` нет — скопировать из `brief-template.md`
2. Заполнить: **Цель**, **Scope**, **Done when**, **Класс** (S/M/L/XL)
3. Из input или контекста чата — без угадывания продукта; кадр Figma — только если указан
4. Показать краткое резюме (bullets); полный файл — в `.planning/brief.md`

**Формат промпта пользователя:** `Класс M. Задача: … Done when: …`
