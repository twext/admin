# AGENT.md

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Say the thing, not the importance of the thing](#say-the-thing-not-the-importance-of-the-thing)
- [Don't oversell notability or coverage](#dont-oversell-notability-or-coverage)
- [Avoid stock transition and hedge words](#avoid-stock-transition-and-hedge-words)
- [Skip the canned structure](#skip-the-canned-structure)
- [Prefer plain constructions over inflated ones](#prefer-plain-constructions-over-inflated-ones)
- [Don't manufacture false contrast](#dont-manufacture-false-contrast)
- [Formatting](#formatting)
- [Specificity over polish](#specificity-over-polish)
- [Attribution](#attribution)
- [Before submitting](#before-submitting)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

Guidelines for agents writing documentation in this repo. Goal: read like a developer wrote it after using the thing, not like it was generated to describe the thing. This section covers docs (READMEs, guides, changelogs, comments).

## Say the thing, not the importance of the thing

Don't narrate significance. State what something does or how to use it.

- Bad: "This module plays a crucial role in the authentication pipeline, ensuring robust and secure access."
- Good: "This module validates JWTs and rejects expired ones."

Cut sentences whose only job is to tell the reader something matters, represents a shift, or reflects a broader pattern.

## Don't oversell notability or coverage

Skip lines that just assert legitimacy or attention: "widely used," "actively maintained," "growing community," "gaining traction." If a claim like that is true and relevant, back it with a number (stars, downloads, version count) or leave it out.

## Avoid stock transition and hedge words

Words that show up constantly in generated text and rarely in text written by someone who actually did the work: `delve`, `boasts`, `crucial`, `pivotal`, `underscore`, `showcase`, `robust`, `seamless`, `leverage`, `streamline`, `foster`, `enhance` (as a filler verb), `landscape` (as an abstract noun), `tapestry`, `testament to`, `plays a vital role`.

## Skip the canned structure

- No "Conclusion" or "Summary" section that just restates what was already said, unless the doc is long enough to genuinely need a recap.
- No "Challenges" or "Future Outlook" section that follows the shape "Despite X, faces several challenges... nonetheless positioned to..." unless there's something specific to say.
- No rule-of-three padding ("fast, reliable, and scalable") when one or two of those are the actual claims and the third is filler.
- Section headers should describe content, not perform enthusiasm.

## Prefer plain constructions over inflated ones

- "X is a Y that does Z" over "X serves as a Y, enabling Z."
- "has" over "boasts," "offers," "features" (when those are just standing in for "has").
- "used" over "utilized," "tried" over "attempted," "moved" over "relocated." Plain verbs, not their fancier synonyms.
- Simple `is`/`has` sentences are fine. Don't dress them up.

## Don't manufacture false contrast

Skip "not just X, but Y" and "it's not X — it's Y" constructions unless the contrast is real and the reader actually expected X.

## Formatting

- Don't bold every key term in a paragraph. Bold sparingly, for things a skimming reader genuinely needs to catch.
- Avoid emoji as bullet decoration or section markers.
- Lists should hold genuinely parallel, separate items.

## Specificity over polish

If a detail is unusual, technical, or specific, keep it — don't smooth it into a generic statement to sound more "encyclopedic." Vague positive language is easier to write than specific accurate language, which is exactly why it's a tell.

## Attribution

Don't attribute claims to vague authorities ("developers have noted...", "users report...") to make a point sound backed by consensus. If you can't cite a specific source, just state it plainly.

## Before submitting

Read it back and ask: would a maintainer who just wrote this by hand actually phrase it this way? If a sentence only exists to sound thorough or reassuring rather than to convey information, cut it.
