# Project Workflow

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` _before_ implementation
3. **Test-Driven Development:** Write unit tests before implementing functionality
4. **Evidence-Based Coverage:** Use meaningful tests and repository-defined
   thresholds; never claim coverage that the current harness does not measure
5. **User Experience First:** Every decision should prioritize user experience
6. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for watch-mode tools (tests, linters) to ensure single execution.

## Repository-Specific Profile

This section is normative for Authentext and takes precedence over generic
examples later in this document.

- Work only in the maintained surfaces listed in `AGENTS.md`.
- Treat `src/` as canonical and root skill files as generated artifacts.
- Every current track contains `spec.md`, `plan.md`, `metadata.json`, and
  `index.md`; add stable-ID requirements and design artifacts when the work
  needs them.
- `conductor/index.md` is the project handshake and `conductor/tracks.md` is the
  track registry.
- Use checks appropriate to a documentation-first Node.js skill library.
- Do not use empty checkpoint commits. Attach phase evidence to the last real
  functional commit and record its SHA in the plan.
- Do not mark work complete from checkboxes, Project fields, or experimental
  task trackers alone. Verify repository files, tests, hosted runs, and any
  external gate that the claim requires.
- Tags, releases, registry submissions, and public publication require separate
  explicit approval.

## Task Workflow

All tasks follow a strict lifecycle:

### Standard Task Workflow

1. **Select Task:** Choose the next available task from `plan.md` in sequential order

2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`

3. **Write Failing Tests (Red Phase):**
   - Create a new test file for the feature or bug fix.
   - Write one or more unit tests that clearly define the expected behavior and acceptance criteria for the task.
   - **CRITICAL:** Run the tests and confirm that they fail as expected. This is the "Red" phase of TDD. Do not proceed until you have failing tests.

4. **Implement to Pass Tests (Green Phase):**
   - Write the minimum amount of application code necessary to make the failing tests pass.
   - Run the test suite again and confirm that all tests now pass. This is the "Green" phase.

5. **Refactor (Optional but Recommended):**
   - With the safety of passing tests, refactor the implementation code and the test code to improve clarity, remove duplication, and enhance performance without changing the external behavior.
   - Rerun tests to ensure they still pass after refactoring.

6. **Verify Coverage:** Run coverage reports using the project's chosen tools. For example, in a Python project, this might look like:

   ```bash
   pytest --cov=app --cov-report=html
   ```

   Target: 100% coverage for new code. The specific tools and commands will vary by language and framework.

7. **Document Deviations:** If implementation differs from tech stack:
   - **STOP** implementation
   - Update `tech-stack.md` with new design
   - Add dated note explaining the change
   - Resume implementation

8. **Commit Code Changes:**
   - Stage all code changes related to the task.
   - Propose a clear, concise commit message e.g, `feat(ui): Create basic HTML structure for calculator`.
   - Perform the commit.

9. **Attach Task Summary with Git Notes:**
   - **Step 9.1: Get Commit Hash:** Obtain the hash of the _just-completed commit_ (`git log -1 --format="%H"`).
   - **Step 9.2: Draft Note Content:** Create a detailed summary for the completed task. This should include the task name, a summary of changes, a list of all created/modified files, and the core "why" for the change.
   - **Step 9.3: Attach Note:** Use the `git notes` command to attach the summary to the commit.

     ```bash
     # The note content from the previous step is passed via the -m flag.
     git notes add -m "<note content>" <commit_hash>
     ```

10. **Get and Record Task Commit SHA:**
    - **Step 10.1: Update Plan:** Read `plan.md`, find the line for the completed task, update its status from `[~]` to `[x]`, and append the first 7 characters of the _just-completed commit's_ commit hash.
    - **Step 10.2: Write Plan:** Write the updated content back to `plan.md`.

11. **Commit Plan Update:**
    - **Action:** Stage the modified `plan.md` file.
    - **Action:** Commit this change with a descriptive message (e.g., `conductor(plan): Mark task 'Create user model' as complete`).

### Phase Completion Verification and Checkpointing Protocol

**Trigger:** This protocol is executed immediately after a task is completed that also concludes a phase in `plan.md`.

1. **Announce Protocol Start:** Inform the user that the phase is complete and the verification and checkpointing protocol has begun.

2. **Trigger Conductor Review:** (Optional but recommended)
   - Execute `/conductor:review` to perform an automated review of the completed phase.
   - Address any issues or recommendations identified by the review.

3. **Ensure Test Coverage for Phase Changes:**
   - **Step 3.1: Determine Phase Scope:** To identify the files changed in this phase, you must first find the starting point. Read `plan.md` to find the Git commit SHA of the _previous_ phase's checkpoint. If no previous checkpoint exists, the scope is all changes since the first commit.
   - **Step 3.2: List Changed Files:** Execute `git diff --name-only <previous_checkpoint_sha> HEAD` to get a precise list of all files modified during this phase.
   - **Step 3.3: Verify and Create Tests:** For each file in the list:
     - **CRITICAL:** First, check its extension. Exclude non-code files (e.g., `.json`, `.md`, `.yaml`).
     - For each remaining code file, verify a corresponding test file exists.
     - If a test file is missing, you **must** create one. Before writing the test, **first, analyze other test files in the repository to determine the correct naming convention and testing style.** The new tests **must** validate the functionality described in this phase's tasks (`plan.md`).

4. **Execute Automated Tests with Proactive Debugging:**
   - Before execution, you **must** announce the exact shell command you will use to run the tests.
   - **Example Announcement:** "I will now run the automated test suite to verify the phase. **Command:** `CI=true npm test`"
   - Execute the announced command.
   - If tests fail, you **must** inform the user and begin debugging. You may attempt to propose a fix a **maximum of two times**. If the tests still fail after your second proposed fix, you **must stop**, report the persistent failure, and ask the user for guidance.

5. **Automated Verification Instead of Manual Steps:**
   - **CRITICAL:** Analyze `product.md`, `product-guidelines.md`, and `plan.md` to determine the user-facing goals of the completed phase.
   - Design and run automated verification steps that cover the user-facing goals (e.g., CLI checks, scriptable smoke tests, snapshot validation).
   - If a verification step cannot be automated, the phase cannot be marked complete. Document the gap and stop for user guidance.

6. **Identify the Phase Evidence Commit:**
   - Do not create an empty checkpoint commit.
   - Identify the final real functional commit for the phase.
   - If verification produced a necessary repository change, commit that change
     normally and use it as the evidence commit.

7. **Attach Auditable Verification Report using Git Notes:**
   - **Step 7.1: Draft Note Content:** Create a detailed verification report including the automated test command(s), the automated verification steps executed, and their results.
   - **Step 7.2: Attach Note:** Use the `git notes` command and the full commit
     hash from the previous step to attach the full report to the evidence
     commit.

8. **Get and Record Phase Checkpoint SHA:**
   - **Step 8.1: Get Commit Hash:** Obtain the hash of the phase evidence
     commit.
   - **Step 8.2: Update Plan:** Read `plan.md`, find the heading for the completed phase, and append the first 7 characters of the commit hash in the format `[checkpoint: <sha>]`.
   - **Step 8.3: Write Plan:** Write the updated content back to `plan.md`.

9. **Commit Plan Update:**
   - **Action:** Stage the modified `plan.md` file.
   - **Action:** Commit this change with a descriptive message following the format `conductor(plan): Mark phase '<PHASE NAME>' as complete`.

10. **Announce Completion:** Inform the user that the phase is complete and
    identify the evidence commit and attached verification note.

### Track Completion, Archiving, and Sequencing Protocol

**Trigger:** This protocol runs after all phases in a track's `plan.md` are completed.

1. **Trigger Conductor Review:**
   - Execute `/conductor:review` to perform an automated review of the completed track.
   - Address any issues or recommendations identified by the review.

2. **Finalize Track Status:**
   - Update the track's `metadata.json` status to `archived`.
   - Append the completion date to the metadata `updated_at`.

3. **Archive in `conductor/tracks.md`:**
   - Move the track entry from the active list to a new `Archived Tracks` section.
   - Mark it as completed with `[x]` and append the 7-char commit SHA of the archive commit.

4. **Create an Archive Commit:**
   - Stage changes (metadata + `tracks.md`).
   - Commit with a message like `conductor(archive): Archive <track_id>`.

5. **Proceed to Next Sequential Track:**
   - Select the next track in order from `conductor/tracks.md`.
   - Mark its first pending task as `[~]` and begin execution.

### Commit Enforcement

- Every task completion must have a commit.
- No task or phase may be marked complete without a corresponding commit SHA.

### Quality Gates

Before marking any task complete, verify:

- [ ] All tests pass
- [ ] Measured coverage meets the repository-defined threshold, when applicable
- [ ] Code follows project's code style guidelines (as defined in `code_styleguides/`)
- [ ] All public functions/methods are documented (e.g., docstrings, JSDoc, GoDoc)
- [ ] Type safety is enforced (e.g., type hints, TypeScript types, Go types)
- [ ] No linting or static analysis errors (using the project's configured tools)
- [ ] Works correctly on mobile (if applicable)
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

## Development Commands

These commands are the current repository contract.

### Setup

```powershell
npm ci
```

### Daily Development

```powershell
npm run sync
npm run validate
npm test
```

### Before Committing

```powershell
npm run sync
npm run validate
npm run lint:all
npm test
```

### Conductor Automation Commands

```bash
# Archive a completed track after review
node scripts/archive_track.js <track_id>

# Progress to the next track after completing current one
node scripts/progress_to_next_track.js <completed_track_id>

# Complete end-to-end workflow: review, archive, and progress
node scripts/complete_workflow.js <track_id>
```

## Testing Requirements

### Unit Testing

- Every module must have corresponding tests.
- Use appropriate test setup/teardown mechanisms (e.g., fixtures, beforeEach/afterEach).
- Mock external dependencies.
- Test both success and failure cases.

### Integration Testing

- Test skill compilation, discovery, routing, and generated-file integrity.
- Test official Agent Skills validation and distribution preview.
- Test positive, near-miss, negative, restraint, and literal-preservation cases.
- Verify external services only in explicit, bounded integration lanes.

### Mobile Testing

Not applicable to the current skill-maintenance library. If a future track adds
a user interface, that track must define its own device and accessibility
requirements.

## Code Review Process

### Self-Review Checklist

Before requesting review:

1. **Functionality**
   - Feature works as specified
   - Edge cases handled
   - Error messages are user-friendly

2. **Code Quality**
   - Follows style guide
   - DRY principle applied
   - Clear variable/function names
   - Appropriate comments

3. **Testing**
   - Unit tests comprehensive
   - Integration tests pass
   - Measured coverage meets the configured threshold, when applicable

4. **Security**
   - No hardcoded secrets
   - Input validation present
   - SQL injection prevented
   - XSS protection in place

5. **Performance**
   - Database queries optimized
   - Images optimized
   - Caching implemented where needed

6. **Portability**
   - Portable skill validates independently of host overlays
   - Generated output is deterministic on supported platforms
   - Technical literals and editorial constraints are preserved

## Commit Guidelines

### Message Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

### Examples

```bash
git commit -m "feat(auth): Add remember me functionality"
git commit -m "fix(posts): Correct excerpt generation for short posts"
git commit -m "test(comments): Add tests for emoji reaction limits"
git commit -m "style(mobile): Improve button touch targets"
```

## Definition of Done

A task is complete when:

1. All code implemented to specification
2. Unit tests written and passing
3. Code coverage meets project requirements
4. Documentation complete (if applicable)
5. Code passes all configured linting and static analysis checks
6. Portable and cross-platform behavior is verified where applicable
7. Implementation notes added to `plan.md`
8. Changes committed with proper message
9. Git note with task summary attached to the commit
10. `/conductor:review` has been executed and any issues addressed

## Emergency Procedures

### Critical Bug in Production

1. Create hotfix branch from main
2. Write failing test for bug
3. Implement minimal fix
4. Test thoroughly including mobile
5. Deploy immediately
6. Document in plan.md

### Data Loss

1. Stop all write operations
2. Restore from latest backup
3. Verify data integrity
4. Document incident
5. Update backup procedures

### Security Breach

1. Rotate all secrets immediately
2. Review access logs
3. Patch vulnerability
4. Notify affected users (if any)
5. Document and update security procedures

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Coverage 100%
- [ ] No linting errors
- [ ] Mobile testing complete
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created

### Deployment Steps

1. Merge feature branch to main
2. Tag release with version
3. Push to deployment service
4. Run database migrations
5. Verify deployment
6. Test critical paths
7. Monitor for errors

### Post-Deployment

1. Monitor analytics
2. Check error logs
3. Gather user feedback
4. Plan next iteration

## Automation and Workflow Enhancement

The conductor workflow includes automation scripts to streamline the review, archiving, and track progression process:

- **Review Integration:** The `/conductor:review` command is integrated into the Definition of Done and phase completion protocols
- **Automatic Archiving:** Completed tracks are automatically moved to the archived section in `conductor/tracks.md`
- **Progressive Advancement:** The system automatically progresses to the next available track after completion
- **Git Integration:** All changes are properly committed with appropriate commit messages

### Automation Scripts

1. `scripts/archive_track.js` - Archives completed tracks and updates their status
2. `scripts/progress_to_next_track.js` - Moves to the next available track in priority order
3. `scripts/complete_workflow.js` - Executes the complete workflow: review, archive, and progress

## Continuous Improvement

- Review workflow weekly
- Update based on pain points
- Document lessons learned
- Optimize for user happiness
- Keep things simple and maintainable

## GitHub Mirror Protocol

GitHub is the hosted coordination mirror for Conductor.

1. Use one issue per track and one native subissue per phase.
2. Put stable hidden markers in issue bodies before creating relationships.
3. Search markers before creating issues so synchronization is idempotent.
4. Add all repository issues and native subissues to the dedicated Project.
5. Record track ID, item type, MoSCoW, Conductor state, evidence state,
   upstream channel, and sync date when applicable.
6. Keep completed historical tracks and phases closed. Disclose stale archived
   metadata rather than rewriting historical files.
7. Keep implementation issues open until repository-owned acceptance is
   evidenced; keep external gates explicit.
8. Write the resulting URLs and node relationships to
   `conductor/github-mapping.json`.

## Experimental Feature Protocol

- Experimental Gemini task tracking, worktrees, model steering, context
  management, registry, and extension reloading are execution aids.
- Durable task state remains in Conductor files and GitHub issue relationships.
- Experimental settings must be reversible and must not become release
  requirements without a reviewed track change.
- Portable Authentext frontmatter must not depend on host-only experimental
  fields.
