# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Everything should always be done cleanly, simply, and scalably. no spaghetti code!

Always ask yourself:
- is this the simplest solution? If no re-evaluate
- Will this cause problems down the line? If yes, re-evaluate
- Is this scalable? If not, re-evalute

Golden Rules
- The best solution is the simplest solution.
- NOTHING should be a bandaid or spaghetti.
- all code should be industry standard and scalable ALWAYS
- The WHY is as important as the WHAT. When making decisions and creating/modifying documentation, always include the reasoning behind things.
- when implementing an existing plan, do a second pass and critique it. Does it make sense? is it the best/simplest solution? and what could go wrong?
- before adding new features or changing existing ones, consider how these changes will interact with the existing system. If it will introduce inefficiencies, scalability issues, or bloat, reassess.

## Session Management

- `.claude/masterplan.md` - Long-term multi-step plans spanning multiple sessions
- `.claude/workplan.md` - Current work section to execute over 1-2 sessions
- `.claude/scratchpad.md` - Session context to carry forward

Use `/handoff` at the end of a session to capture context for the next session.

## Documenting Changes

When working through OR writing plans, capture context alongside progress:
- **Why** decisions were made (not just what was done)
- **Gotchas** encountered and how they were resolved
- **Bugs** that arose during implementation
- **Mistakes** made and corrections applied

Update the active workplan.md and scratchpad.md with this context as you work. This ensures reasoning is preserved with the plan, not lost in commit messages.

## Learning from History

Before starting significant work:
- Check `.claude/changelog/` for relevant past project decisions
- Use `git log --oneline -20` to see recent changes
- Use `git log -p <file>` to understand why a specific file evolved

When something seems oddly implemented, assume there was a reason - check history before "fixing" it.

## Architecture: Single Source of Truth

Simplicity is king, when things can be refered to a single source for modifications this makes it easier to read and quickly modify the code/add things to it

## Common Gotchas

### Frontend/Backend Field Naming
When working with APIs that transform database records, verify the exact field names returned (e.g., MongoDB `_id` often becomes `id` in API responses). Test selectors/lookups early to catch mismatches.

### LLM Provider Fallback
For AI features, implement automatic fallback between providers (primary → fallback) with a `model_used` response field so consumers know which model generated the response.

## Skills

Domain-specific guidance lives in `.claude/skills/`. Each skill file has a `triggers` frontmatter listing when to consult it:

- **ui-design.md** - UI, CSS, styling, layout, responsive design
