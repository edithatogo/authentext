# Research Baseline: Document-Aware Editing

Checked on: 2026-08-03

| Source                                                                                                                                                     | Scope                                 | Design implication                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GOV.UK: Understand content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/) | Government and public-service content | Begin with user need, task, and service context rather than applying style rules in isolation.                                                       |
| [Google developer documentation style guide](https://developers.google.com/style)                                                                          | Technical documentation               | Project-specific guidance takes precedence; profiles should distinguish task and concept documentation and support global, accessible readers.       |
| [Google: Headings and titles](https://developers.google.com/style/headings)                                                                                | Technical content structure           | Task-oriented and conceptual documents require different heading and information structures.                                                         |
| [EQUATOR: What is a reporting guideline?](https://www.equator-network.org/about-us/what-is-a-reporting-guideline/)                                         | Health research manuscripts           | Select minimum reporting requirements by study type and keep completeness checks distinct from style edits.                                          |
| [EQUATOR reporting-guideline search](https://www.equator-network.org/reporting-guidelines/)                                                                | Specialised research designs          | Use a governed resolver instead of embedding one universal academic checklist.                                                                       |
| [`blader/humanizer@523374d`](https://github.com/blader/humanizer/tree/523374dee72d67c7b2b5f858ea0094ffda49c3ac)                                            | Original Humanizer upstream           | Retain voice calibration, invocation modes, false-positive guidance, and a bounded audit while rejecting universal bans and authorship implications. |
| [`Aboudjem/humanizer-skill@9a7f35b`](https://github.com/Aboudjem/humanizer-skill/tree/9a7f35b7b9ad8c3abd71f10757ec9f91fb8ae165)                            | Community implementation              | Use purpose and voice as profile inputs, cluster ordinary findings, and treat short samples cautiously; do not adopt AI-tell scoring.                |
| [`harshaneel/humanize@4ec7973`](https://github.com/harshaneel/humanize/tree/4ec797314537ec9c2105f276d4561d240a0390ba)                                      | Research-oriented implementation      | Adopt structural-first review, register calibration, and one audit loop; reject detector optimisation and invented specificity.                      |
| [`andreaskonopka/humanizer@862609a`](https://github.com/andreaskonopka/humanizer/tree/862609a2caf3cadb63b9bef78576e6f5a1ed4e19)                            | Compact multilingual implementation   | Preserve language-aware typography, structure-before-vocabulary, factual checks, and explicit non-evasion boundaries.                                |

## Limits

This is architecture evidence, not a complete profile corpus. Implementation
must verify each additional authority, record licensing and scope, and avoid
presenting recommendations as binding requirements. Public guidance can change;
every source record therefore needs a retrieval date and drift state.

Detailed adopt, adapt, and reject decisions are recorded in
[`ecosystem-review.md`](./ecosystem-review.md).
