# Buzz

> Helping people build meaningful local connections through shared interests and real-world experiences.

Buzz is a location-based social platform designed to make meeting like-minded people in a new city feel natural. Rather than focusing on endless messaging or passive content consumption, Buzz encourages people to discover activities they're genuinely interested in and connect with others who want to do the same.

This repository represents an active side project where I experiment with product ideas, software architecture and modern mobile engineering practices.

---

## Why I Built Buzz

Moving to a new city can be isolating.

Existing social platforms are excellent at keeping people connected with existing friends, but far less effective at helping people build new, genuine relationships in the real world.

Buzz explores a different approach.

Instead of asking users to browse profiles or join large anonymous communities, the app is built around intent:

> *"I want to go hiking this weekend."*

> *"I'd love to learn photography."*

> *"Who's interested in trying this café?"*

The goal is to reduce the friction involved in turning shared interests into real-world experiences.

---

# Core Principles

Buzz has been designed around a small number of product principles.

### Interest First

People connect through shared interests, not profiles.

The platform attempts to surface opportunities based on what users actually want to do rather than who they already know.

### Real World Before Digital

The objective isn't increasing screen time.

The application should encourage users to spend less time inside the app and more time participating in real-world activities.

### Small Communities Scale Better

Large social feeds often become noisy.

Buzz focuses on smaller, local interactions that feel relevant to where someone lives today.

### Trust Is Earned

Community health is more important than growth.

Features such as reliability scores, attendance streaks and moderation are intended to reward positive participation rather than maximise engagement at any cost.

---

# Technical Overview

Buzz is being built as a modern React Native application using an architecture intended to remain maintainable as the product grows.

Current areas of focus include:

- React Native
- TypeScript
- Expo
- Supabase
- Modern component architecture
- Feature-based organisation
- AI-assisted development workflows

As the project evolves, additional backend services, automation and deployment tooling will continue to be introduced.

---

# Architecture Philosophy

Rather than prematurely optimising for scale, Buzz favours simple, understandable architecture that can evolve over time.

Some guiding principles include:

- Clear separation of presentation and business logic
- Small, composable components
- Feature-based organisation
- Strong TypeScript usage
- Reusable UI primitives
- Keeping complexity proportional to product maturity

I generally prefer evolving architecture through real product requirements rather than introducing unnecessary abstractions early.

---

# Engineering Decisions

Throughout the project I try to make conscious engineering trade-offs rather than simply adopting the latest technologies.

Some examples include:

- Choosing Expo to maximise development velocity during product validation.
- Using Supabase to reduce operational complexity while iterating quickly.
- Prioritising maintainability over premature optimisation.
- Focusing on feature delivery before introducing additional infrastructure.

These decisions are expected to evolve as the product matures.

---

# AI-Assisted Development

AI is part of my daily engineering workflow throughout this project.

Rather than generating entire features, I use tools such as Claude and Codex to assist with:

- brainstorming architecture
- exploring implementation options
- identifying edge cases
- reviewing code
- improving documentation
- challenging design decisions
- accelerating repetitive development tasks

Engineering judgement remains the most important part of the process. AI helps accelerate thinking rather than replace it.

---

# Current Status

Buzz is an active side project and remains under ongoing development.

Not every planned feature has been implemented, and parts of the architecture will continue to evolve as ideas are validated.

Some planned areas include:

- interest matching
- neighbourhood recommendations
- event creation
- trust and reputation system
- AI-assisted recommendations
- notification infrastructure
- onboarding improvements

---

# Lessons Learned

One of the most enjoyable aspects of building Buzz has been balancing product thinking with engineering decisions.

Every technical choice ultimately supports a product decision.

The project has reinforced the importance of:

- solving business problems before technical ones
- avoiding unnecessary complexity
- shipping incrementally
- validating assumptions early
- treating maintainability as a feature

---

# Running Locally

```bash
git clone https://github.com/gabeh91/BuzzApp

cd BuzzApp

npm install

npx expo start
```

(Additional environment configuration may be required depending on local services.)

---

# Future Direction

Buzz continues to evolve as I explore new product ideas and engineering approaches.

The repository intentionally reflects an iterative development process rather than a finished product.

---

## About Me

I'm a Senior Software Engineer based in Melbourne, Australia, with experience building web, mobile and backend applications across healthcare, SaaS and enterprise environments.

This repository represents one of the ways I continue exploring new ideas outside of work while experimenting with architecture, product thinking and modern software engineering practices.

If you'd like to discuss the project or connect, feel free to reach out.
