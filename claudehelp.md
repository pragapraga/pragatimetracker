# Comprehensive Guide to Using Claude Code Efficiently

## 1. Best Practices for Effective Work

### Give Claude a Way to Verify Its Work (Highest Leverage)
The single most important practice is including tests, screenshots, or expected outputs so Claude can validate independently:

- **Before**: "implement a function that validates email addresses"
- **After**: "write a validateEmail function. example test cases: user@example.com is true, invalid is false, user@.com is false. run the tests after implementing"

### Workflow: Explore → Plan → Code → Commit
For complex tasks, separate phases:
1. **Explore (Plan Mode)**: Read files and answer questions without making changes
2. **Plan**: Ask Claude to create a detailed implementation plan
3. **Implement (Normal Mode)**: Code while verifying against the plan
4. **Commit**: Have Claude commit with a descriptive message and create a PR

For small tasks (typos, variable names), skip planning - it adds overhead if the change is obvious.

### Provide Specific Context in Prompts
- **Scope the task**: "write a test for foo.py covering the edge case where the user is logged out"
- **Point to sources**: "look at git history of ExecutionFactory to understand the API design"
- **Reference existing patterns**: "look at HotDogWidget.php to understand patterns, follow that approach"
- **Describe symptoms**: "login fails after session timeout. check src/auth/ token refresh. write a failing test first, then fix it"

### Provide Rich Content
- Use `@filename` to reference files directly instead of describing them
- Paste images/screenshots directly for UI work
- Pipe data: `cat error.log | claude` sends file contents
- Let Claude fetch what it needs using bash commands or file reads

---

## 2. Keyboard Shortcuts & Essential Commands

### Critical Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Stop Claude mid-action (preserves context) |
| `Esc + Esc` or `/rewind` | Open rewind menu, restore previous code and conversation state |
| `Ctrl+L` | Clear terminal screen (keeps conversation history) |
| `Ctrl+O` | Toggle verbose output |
| `Ctrl+R` | Reverse search command history |
| `Ctrl+V` (or `Cmd+V`, `Alt+V`) | Paste image from clipboard |
| `Ctrl+B` | Background long-running tasks |
| `Shift+Tab` | Cycle through permission modes (Default → Auto-Accept → Plan Mode) |
| `Option+P` (macOS) / `Alt+P` | Switch models mid-session |
| `Option+T` (macOS) / `Alt+T` | Toggle extended thinking mode |
| `Ctrl+K` | Delete to end of line |
| `Ctrl+U` | Delete entire line |
| `Ctrl+Y` | Paste deleted text |

### Essential Built-in Commands

```
/clear                    # Clear conversation history between unrelated tasks
/compact [instructions]   # Compress conversation with focus hints
/cost                     # Show token usage and costs
/context                  # Visualize what's consuming context
/init                     # Generate CLAUDE.md from your project
/memory                   # Edit CLAUDE.md files
/model                    # Switch AI models
/permissions              # Configure what Claude can do
/plan                     # Enter plan mode directly
/rename <name>            # Name your session for easy resuming
/resume [session]         # Resume a previous conversation
/stats                    # Daily usage, streaks, model preferences
/mcp                      # Manage MCP server connections
/hooks                    # Configure hooks interactively
```

For custom commands, create skills in `.claude/skills/`.

---

## 3. Context Management (Critical for Efficiency)

### Core Principle
Claude's context window fills fast. Poor context management is the #1 reason for performance degradation. Your context window includes: conversation history, file contents, command outputs, CLAUDE.md, loaded skills, and system instructions.

### Proven Strategies

1. **Clear between unrelated tasks**
   ```
   /clear
   ```
   A session with irrelevant context wastes tokens on every message.

2. **Run `/context` to see what's consuming space**
   - MCP servers add tool definitions even when idle
   - See exactly where tokens are going

3. **Use subagents for investigation**
   Instead of reading hundreds of files in your main context:
   ```
   Use subagents to investigate how our authentication handles token refresh
   ```
   They explore separately and report summaries back.

4. **Customize compaction instructions**
   ```
   /compact Focus on API changes and test results
   ```
   Or add to CLAUDE.md:
   ```markdown
   # Compact instructions
   When compacting, focus on test output and code changes
   ```

5. **Manage extended thinking**
   Extended thinking is enabled by default (31,999 token budget) but uses output tokens. For simpler tasks:
   ```
   MAX_THINKING_TOKENS=8000   # Reduce from default
   ```
   Or disable in `/config` for routine work.

---

## 4. Environment Configuration (Setup Once, Benefit Always)

### Write an Effective CLAUDE.md
Create `/root/CLAUDE.md` (project root) or `~/.claude/CLAUDE.md` (home folder for all projects):

**Include:**
- Bash commands Claude can't guess
- Code style rules that differ from defaults
- Testing instructions and preferred runners
- Repository etiquette (branch naming, PR conventions)
- Architectural decisions specific to your project
- Developer environment quirks (required env vars)
- Common gotchas and non-obvious behaviors

**Exclude (Claude figures these out):**
- Standard language conventions
- Detailed API documentation (link instead)
- Information that changes frequently
- Long explanations or tutorials
- Self-evident practices

**Example:**
```markdown
# Code style
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports when possible

# Workflow
- Run typecheck after code changes
- Prefer single tests over full suite
- Always write tests for new features

# Environment
- Required env vars: API_KEY, DATABASE_URL
```

Keep it concise. If Claude keeps ignoring a rule, your file is too long and the rule is getting lost.

### Configure Permissions (Reduce Approval Fatigue)
Either allowlist safe commands or use sandboxing:

```
/permissions
```

Allowlist specific commands you trust:
```json
{
  "permissions": [
    "Bash(npm run lint:*)",
    "Bash(git commit:*)",
    "Edit(/src/**)"
  ]
}
```

Or enable OS-level sandboxing:
```
/sandbox
```

### Install CLI Tools (Context-Efficient)
CLI tools like `gh`, `aws`, `gcloud`, `sentry-cli` are more context-efficient than MCP servers because they don't add persistent tool definitions:

```bash
# GitHub operations
gh issue view 123
gh pr create --title "Fix bug" --body "Details"

# Claude learns CLI tools automatically
# Tell it: Use 'foo-cli-tool --help' to learn, then use it for X, Y, Z
```

### Connect MCP Servers (For External Services)
```
claude mcp add
```

Popular servers: Notion, Figma, databases, monitoring tools, version control systems.

### Set Up Hooks (Deterministic Automation)
Unlike CLAUDE.md (advisory), hooks guarantee actions happen:

```
/hooks
```

Example: Run eslint after every file edit, block writes to migrations folder, or filter test output.

### Create Skills (Domain Knowledge on Demand)
Skills load only when needed, keeping base context smaller:

```markdown
# .claude/skills/api-conventions/SKILL.md
---
name: api-conventions
description: REST API design conventions
---
- Use kebab-case for URL paths
- Use camelCase for JSON properties
- Always include pagination for list endpoints
```

Invoke with `/api-conventions` or let Claude use automatically when relevant.

### Create Custom Subagents (Isolated Specialists)
```markdown
# .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review for:
- Injection vulnerabilities
- Auth and authorization flaws
- Secrets in code
- Insecure data handling
```

Request explicitly: "Use a subagent to review this code for security issues."

---

## 5. Token & Cost Optimization

### Monitor Your Costs
```
/cost                    # See detailed token usage
/stats                   # Usage patterns (for subscribers)
```

Average cost: $6/developer/day. 90% of users stay under $12/day.

### Reduce Token Usage

1. **Manage context aggressively**
   - Use `/clear` frequently between tasks
   - Run `/compact <focus>` to control what survives summarization
   - Check `/context` to see what's consuming space

2. **Choose the right model**
   - **Sonnet**: Default, handles most tasks, cheapest
   - **Opus**: Complex architecture, multi-step reasoning
   - **Haiku**: Subagent tasks only

   ```
   /model sonnet      # Switch models
   ```

3. **Reduce MCP server overhead**
   ```
   /mcp              # See configured servers
   ```
   - Disable unused servers
   - Prefer CLI tools (context-efficient)
   - Lower tool search threshold: `ENABLE_TOOL_SEARCH=auto:5`

4. **Install code intelligence plugins**
   For typed languages (TypeScript, Python, Go, Rust), plugins give precise symbol navigation instead of text search, reducing unnecessary file reads.

5. **Offload to hooks and skills**
   Instead of Claude reading a 10,000-line log, a hook can grep for errors first, reducing context from tens of thousands of tokens to hundreds.

6. **Move instructions from CLAUDE.md to skills**
   Load detailed workflows only when needed, keeping base context smaller. Aim for CLAUDE.md under ~500 lines.

7. **Write specific prompts**
   - Vague: "improve this codebase" (triggers broad scanning)
   - Specific: "add input validation to the login function in auth.ts" (minimal file reads)

8. **Work efficiently on complex tasks**
   - Use plan mode before implementing complex changes
   - Course-correct early (press Esc to stop)
   - Use `/rewind` to undo failed approaches
   - Test incrementally (one file → test → continue)

---

## 6. Common Failure Patterns & How to Avoid Them

| Problem | Cause | Fix |
|---------|-------|-----|
| **Kitchen sink session** | Started with one task, added unrelated work, context full | `/clear` between unrelated tasks |
| **Repeating corrections** | Claude does wrong thing, you correct it, still wrong | After 2 corrections: `/clear` and write better initial prompt |
| **Oversized CLAUDE.md** | Too many rules, important ones get lost | Ruthlessly prune; if Claude already does it right, delete or convert to hook |
| **No verification** | Claude produces plausible but buggy code | Always provide tests, scripts, or screenshots |
| **Infinite exploration** | Asked Claude to "investigate" without scoping | Scope narrowly or use subagents for isolated investigation |

---

## 7. Session Management & Persistence

### Resume Previous Work
```bash
claude --continue    # Resume most recent session
claude --resume      # Pick from recent sessions
/rename oauth-migration    # Name your session for easy finding
```

Sessions are persistent locally. Different tasks = separate sessions.

### Rewind Changes
```
Esc + Esc            # Open rewind menu
/rewind              # Same as above
```

Every action Claude makes creates a checkpoint. You can restore conversation only (keep code), code only (keep conversation), or both. Checkpoints survive session close.

### Run Parallel Sessions
- **Claude Desktop**: Manage multiple local sessions visually with separate worktrees
- **Web**: Run on Anthropic's cloud infrastructure in isolated VMs
- **Git worktrees**: Use `git worktree` to run separate Claude sessions on different branches simultaneously

Writer/Reviewer pattern:
1. Session A writes code
2. Session B reviews in fresh context (no bias from writing it)
3. Session A addresses feedback

---

## 8. Advanced Workflows

### Headless Mode (Automation & CI)
```bash
claude -p "Explain what this project does"                # One-off query
claude -p "List all API endpoints" --output-format json   # Structured output
claude -p "Analyze this log" --output-format stream-json  # Streaming
```

Great for CI/CD, pre-commit hooks, and scripts.

### Fan Out Across Files
For large migrations:
1. Have Claude list all files needing migration
2. Loop with `claude -p "Migrate $file"` for each file
3. Use `--allowedTools` to scope permissions for batch operations

### Safe Autonomous Mode
```bash
claude --dangerously-skip-permissions
```

Best used in sandboxed containers without internet. Or use `/sandbox` for safer autonomous operation with defined boundaries.

---

## 9. Prompt Engineering Tips

### Be Specific & Direct
- Reference files with `@filename`
- Mention constraints upfront
- Point to example patterns in your codebase
- Describe the symptom, not just the problem

### Ask Strategic Questions
- "How does logging work in this codebase?"
- "What edge cases does this function handle?"
- "Why was this approach chosen instead of Y?"

### Interview for Complex Features
```
I want to build [brief description]. Interview me in detail.
Ask about technical implementation, UI/UX, edge cases, and tradeoffs.
Keep interviewing until we've covered everything, then write a spec.
```

Then start a fresh session to execute with clean context.

---

## 10. Quick Start Checklist for Maximum Efficiency

1. **Now**: Run `/init` to generate a quality CLAUDE.md
2. **Now**: Set up permissions: `/permissions` to allowlist safe commands
3. **Setup**: Install code intelligence plugin for your language (if typed)
4. **Setup**: Connect frequently-used MCP servers: `/mcp add`
5. **Setup**: Create skills for domain-specific workflows in `.claude/skills/`
6. **Daily**: Use `/clear` between unrelated tasks
7. **Daily**: Check `/context` if performance degrades
8. **Daily**: Use `/rename` before clearing so you can resume later
9. **Always**: Give Claude something to verify against (tests, screenshots, expected output)
10. **Always**: Be specific upfront to minimize corrections
