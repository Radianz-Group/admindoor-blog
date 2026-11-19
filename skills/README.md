# Agent skills

Skills that teach AI coding agents how to work with `admindoor-blog`. Each one is a folder with a `SKILL.md`, in the [Agent Skills](https://agentskills.io) format used by Claude Code, Cursor and other agents.

| Skill                                         | What it does                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`admindoor-blog`](./admindoor-blog/SKILL.md) | Adds the blog to a Next.js App Router site, or upgrades an existing integration (including from `@radianz-group/next-blog`). Inspects the repo first, asks only what it can't infer. |

## Install

**Claude Code:** copy the folder into your project or user skills directory, then run `/admindoor-blog` (or just ask to add a blog).

```bash
# this project only
mkdir -p .claude/skills && cp -r node_modules/admindoor-blog/skills/admindoor-blog .claude/skills/
# or for every project
mkdir -p ~/.claude/skills && cp -r node_modules/admindoor-blog/skills/admindoor-blog ~/.claude/skills/
```

The skill ships inside the npm package, so the copy in `node_modules` always matches the installed version. Before the package is installed, copy it from this repository instead.

**Other agents:** if your agent supports skills, point it at `skills/admindoor-blog/`. Otherwise, paste the contents of `SKILL.md` (everything after the front matter) into the chat.

## Maintaining

Keep `SKILL.md` in sync with [README.md](../README.md), [docs/search.md](../docs/search.md) and the exports in [`src/`](../src). When a feature ships, add it to the skill's **Feature checklist**. Its code snippets must keep compiling against the current package types.
