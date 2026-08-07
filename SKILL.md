---
name: gemini-thinking-control
description: Reduce or eliminate Gemini's thinking token verbosity and "announcing every thought" behavior in Antigravity. Use this skill whenever the user complains about Gemini narrating its reasoning, thinking out loud, being too verbose, wasting tokens, epiphanies showing up in output, or wants to make Gemini more concise and direct. Also trigger when the user asks how to reduce token usage in Antigravity or control Gemini's reasoning output.
---

# Gemini Thinking Control

A skill for diagnosing and fixing Gemini's verbose thinking/reasoning output in Antigravity.

## What's Happening

Gemini 2.5 Pro has a built-in "thinking" mode — it reasons through problems before answering. This reasoning leaks into output as narrated thoughts, epiphanies, and step-by-step internal monologue. It costs tokens and clutters responses.

## Fix Strategies (in order of effectiveness)

### 1. Set `thinkingBudget: 0` in config
If Antigravity exposes model config (a settings file, `.antigravity/config.json`, or similar):
```json
{
  "thinkingConfig": {
    "thinkingBudget": 0
  }
}
```
This fully disables thinking. Only works on models that support it (2.5 Pro, 2.5 Flash).

### 2. Switch to a non-thinking model
In Antigravity's model selector, prefer:
- `gemini-2.5-flash` — thinking off by default, much cheaper
- `gemini-2.0-flash-lite` — no thinking at all, fastest and cheapest
- Avoid `gemini-2.5-pro` unless you need deep reasoning

### 3. Add a system prompt instruction
In Antigravity's system prompt or custom instructions field:
```
Do not narrate your reasoning process. Do not announce steps, insights, or epiphanies. Respond directly and concisely with the final answer only.
```
This doesn't eliminate thinking tokens (you still pay for them) but stops them from polluting the visible output.

### 4. Use a lower-temperature setting
Higher temperature can amplify verbosity. Try setting temperature to `0.2–0.5` for more focused, direct output.

---

## Diagnosing Which Fix to Use

| Symptom | Likely cause | Best fix |
|---|---|---|
| Thoughts visible in chat | Thinking output not filtered | System prompt instruction (#3) |
| High token usage even on simple tasks | Thinking budget too high | `thinkingBudget: 0` (#1) |
| Slow responses | Large thinking budget | Switch model (#2) |
| Can't find config file | Antigravity may not expose it | System prompt (#3) |

---

## Token Cost Reference

- Gemini 2.5 Pro thinking tokens: billed at input token rate
- Thinking can add thousands of tokens per response
- `thinkingBudget: 0` = zero thinking tokens billed
- Flash models = ~10–20x cheaper than Pro

---

## Notes

- If Antigravity doesn't expose model config directly, the system prompt approach (#3) is the most accessible fix.
- Thinking tokens are hidden from the visible output by default in some Antigravity versions — but you're still paying for them. Check your usage dashboard to confirm.
- If the problem persists after trying these, Antigravity may be hardcoding the model or thinking config — in that case, raise it as a feature request to the Antigravity team.
