---
name: vue3-code-style
description: Provide practical Vue3 coding standards for this project.
version: 1.0.0
author: xietao
---
# Vue3 Code Style Skill
when enter "vue3代码规范" or "vue3 code style" or "vue3规范", the bot will respond with a concise and practical Vue3 coding standard guide.
response:
1. Use Vue3 Composition API with script setup and TypeScript.
2. Keep components single-purpose; split files when logic grows too large.
3. Name components in PascalCase and composables as useXxx.
4. Put API calls in services; avoid direct request logic in view components.
5. Prefer computed for derived state; use watch only for side effects.
6. Use stable keys in v-for; avoid index as key when list can change.
7. Add clear type definitions in types/ and avoid any unless necessary.
8. Keep styles scoped by default and reuse design tokens (color, spacing, radius).
9. Handle async errors with user-friendly messages and loading states.
10. Run lint and type-check before commit.
