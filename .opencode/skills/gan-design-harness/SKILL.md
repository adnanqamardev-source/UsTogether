# GAN Design Harness

This skill implements a GAN-inspired Generator-Evaluator agent harness for building high-quality designs autonomously.
It uses a generator agent to create design proposals and an evaluator agent to critique them based on a weighted rubric.
The process iterates until the design crosses a quality threshold.

## When to Use

Use this skill when you want to iteratively improve a design (e.g., UI/UX, architecture, content) through a generator-evaluator feedback loop.

## How It Works

1. **Generator Agent**: Creates a design proposal based on the current brief and rubric.
2. **Evaluator Agent**: Critiques the proposal using a weighted rubric and provides a score and feedback.
3. **Iteration**: If the score is below the threshold, the generator revises the design based on the evaluator's feedback.
4. **Termination**: The loop stops when the design meets or exceeds the quality threshold or after a maximum number of iterations.

## Rubric

The design is evaluated on four criteria with the following weights:

- **Visual Appeal (0.35)**: Aesthetics, color theory, typography, spacing, and overall visual harmony.
- **Usability (0.30)**: Ease of use, accessibility, intuitive navigation, and user flow.
- **Innovation (0.25)**: Creativity, novelty, and how well the design pushes boundaries while remaining practical.
- **Alignment with Brief (0.10)**: How well the design meets the specific goals and constraints outlined in the brief.

## Files

- `spec.md`: The design brief that outlines the goals, constraints, and requirements for the redesign.
- `eval-rubric.md`: The detailed rubric used by the evaluator agent to score designs.

## Usage

To use this skill, ensure you have:
1. A `spec.md` file in the skill directory describing the design brief.
2. An `eval-rubric.md` file in the skill directory describing the evaluation criteria.

Then, invoke the skill via the agent harness to start the GAN loop.

## Example Workflow

1. User writes `spec.md` and `eval-rubric.md` in `.opencode/skills/gan-design-harness/`.
2. The generator agent reads the brief and produces an initial design proposal.
3. The evaluator agent scores the proposal and provides feedback.
4. If the score is below the threshold (e.g., 0.80), the generator revises the design.
5. Steps 2-4 repeat until the design meets the threshold or max iterations are reached.
6. The final design is outputted for implementation.

## Notes

- The harness is designed to be reusable across different design tasks by changing the brief and rubric.
- The weights in the rubric can be adjusted to emphasize different aspects of the design.
- The generator and evaluator agents are specialized instances of the general agent, prompted to act in their respective roles.