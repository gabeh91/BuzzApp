Buzz — Post-Competitor Validation Context for AI Agents

Purpose

This document captures the product and strategy context discussed after the competitor-validation point of the conversation.

It is intended for AI agents who need to create implementation plans, product specs, feature designs, technical tickets, or architecture recommendations for Buzz.

⸻
1. Updated Product Positioning

Buzz should not be positioned as a generic friend-finding app, event app, or city guide.

The sharper positioning is:

Buzz helps people who are new to a city turn a specific interest into a real-world plan with other people.

The core behavioural promise is:

Buzz does not just help users meet people. It helps them make the plan happen.

This distinction matters because the broader “make friends / discover events / meet people nearby” space is crowded. Buzz needs to own a more specific wedge: interest intent → people → plan → attendance.
⸻
2. Competitive Validation Summary

The idea is not unique at the broad category level. Adjacent competitors include:

- friend-finding apps
- event discovery apps
- activity/group apps
- AI/personality-based matching products
- local discovery products
- real-world social planning products

The strategic risk is that Buzz could sound like:

Bumble BFF + Meetup + Timeleft + Butter + local recommendations + AI + lead generation

That is too broad for MVP.

The differentiated wedge is:

A new-to-city user selects an activity they want to try, activates that interest, and Buzz helps form a small, realistic plan with nearby compatible people.

This should guide product, technical, and MVP decisions.
⸻
3. Core Differentiation Principles

Buzz should stand out by being:

3.1 Plan-first, not chat-first

Most social apps match people and then leave them to message each other.

Buzz should create or suggest the plan first.

Example:

3 people nearby want to try tennis.
Suggested plan:
Beginner hit-up at Fawkner Park
Saturday 10am
Court hire link included


3.2 Activity-first, not friendship-first

The friendship is allowed to emerge naturally from the activity.

The product should avoid the awkwardness of “friend dating” by focusing on the shared thing people want to do.

3.3 Small-group-first, not one-to-one-first

Default group size should likely be 3–5 people.

This reduces pressure, improves perceived safety, and makes the experience feel more like an activity group than a forced one-to-one social interaction.

3.4 Availability-aware

Interest activation should ask when the user is actually free.

Example options:

Tonight
This weekend
Weekday evenings
Next 7 days
Specific date/time


Matching should prioritise people with overlapping availability.

3.5 Action and attendance matter

Buzz should optimise for real-world follow-through, not vanity metrics such as likes, swipes, or profile views.

Important product outcomes:

interest activated
group formed
plan proposed
attendance confirmed
activity happened
users would meet again

⸻
4. Standout Feature Ideas

The following features were identified as ways to make Buzz more differentiated.

4.1 Plan-first matching

Buzz should suggest a concrete plan when there are enough compatible users.

Flow:

User activates interest
→ Buzz finds compatible users
→ Buzz suggests time/place/group
→ Users confirm
→ Group chat opens
→ Activity happens


This should be prioritised over generic chat.
⸻
4.2 Availability-based activation

When activating an interest, users should be prompted for availability.

This reduces dead matches and avoids groups where everyone is interested but no one can attend.

Data to capture:

availability window
preferred time of day
weekend/weekday preference
urgency

⸻
4.3 Small-group matching by default

Default matching should favour small groups of 3–5 people.

This helps with:

- safety
- awkwardness reduction
- group momentum
- attendance probability
- easier business-backed plans
⸻
4.4 Activity concierge tools

Once a group forms, Buzz should help coordinate.

Possible tools:

vote on time
vote on venue
confirm attendance
send reminders
share plan details
show map/location
check in after activity


This is a key differentiator because many apps stop at discovery.
⸻
4.5 Anti-flake mechanics

Buzz should introduce light behavioural mechanics to reduce no-shows.

Possible mechanics:

soft RSVP commitment
confirmation reminders
attendance streaks
limited active plans
waitlist replacements
post-activity feedback


Avoid harsh public scores. Keep the tone positive.
⸻
4.6 No-chat-needed mode

Some users do not want to make cold conversation before joining.

Buzz should support joining a plan without requiring pre-chat.

Example:

Join Saturday beginner climbing group.
No pre-chat required.
Group chat opens when 3 people confirm.

⸻
4.7 New-to-city status

The app should capture and display a user’s stage of arrival.

Examples:

Moved 2 weeks ago
Moved 3 months ago
Back in the city
Starting over
Travelling for 6 months


This helps match people by social intent and life stage, not just hobbies.
⸻
4.8 City starter packs

Buzz can recommend structured “starter packs” for new arrivals.

Examples:

Your first 30 days in Melbourne
Sporty newcomer pack
Creative newcomer pack
Budget-friendly weekend pack
International student starter pack
Sober-social pack


These should eventually connect to activities, neighbourhoods, verified hosts, and business-backed plans.
⸻
5. Gamification and Reliability System

The user liked the idea of gamifying attendance and reliability.

The recommended model is a progression system based on positive real-world behaviour.

5.1 Suggested progression

New Arrival
→ Active Member
→ Reliable Regular
→ Community Host
→ Paid Host


5.2 What users earn credit for

Users can build trust/reliability by:

showing up to confirmed activities
confirming attendance on time
not cancelling last-minute
receiving positive feedback
helping organise a group
hosting activities
having no serious reports
attending multiple activity types


5.3 Language guidance

Avoid making it feel like a harsh rating or social credit score.

Prefer:

Attendance streak
Trusted member
Reliable regular
Host eligible
Verified host


Avoid:

Reliability score: 67%
Friendship rating
Social score


5.4 Why this matters

The reliability system can solve multiple product problems:

trust
safety
retention
reduced flaking
host supply
community quality
future monetisation


5.5 Host pathway

The reliability system should eventually unlock the ability to become a host.

A potential pathway:

Level 1 — New Arrival
Can join activities.

Level 2 — Active Member
Has attended 2 confirmed activities.

Level 3 — Reliable Regular
Has attended 5 activities with strong feedback.

Level 4 — Community Host
Can organise official Buzz groups.

Level 5 — Paid Host
Can earn money by hosting beginner-friendly activities or newcomer sessions.


This connects to the original “Verified Locals” idea but makes trust earned through behaviour rather than only self-claimed.
⸻
6. Business-Backed Starter Plans

Business-backed starter plans were explored in depth and are considered a strong differentiator.

The concept:

Local businesses do not just advertise. They provide useful beginner-friendly plans that help new arrivals act on their declared interests.

Example:

Beginner climbing night
Hosted at Urban Climb
4 newcomer spots
No experience needed
Buzz group chat opens once 3 people join


This feels like a plan, not an ad.
⸻
6.1 Why starter plans are powerful

They solve problems for multiple sides.

For users:

What should I do?
Where should I go?
Who should I go with?
Will it be awkward?
Is it beginner-friendly?


For businesses:

These users explicitly said they want to try this activity.


For Buzz:

Cold start support
commercial path
structured real-world plans
attendance data
partner network


For safety:

known venue
set time
group format
host/business involvement
public setting

⸻
6.2 Types of starter plans

Business-hosted starter plans

The business runs the activity.

Examples:

surf school lesson
climbing gym intro night
singing school trial class
cooking class
boxing gym beginner session


Buzz-hosted starter plans

Buzz or a verified host runs the activity, possibly using a local venue.

Examples:

coffee walk
museum visit
bar crawl
beach walk
board game night
neighbourhood tour


Hybrid plans

A business provides the venue/activity and a Buzz host helps the group feel comfortable.

Example:

Beginner pottery night
Hosted by ceramics studio
Buzz host meets newcomers at the door
Group chat opens before the session


This may be the strongest early format.
⸻
6.3 Where starter plans appear

Starter plans should be shown only in high-intent contexts.

Good placements:

after interest activation
when not enough organic matches exist
during onboarding after interest selection
inside group chat after group formation
inside city starter packs


Bad placement:

generic ad feed
random sponsored banner
irrelevant promotion

⸻
6.4 MVP treatment of starter plans

Starter plans should probably be Phase 1.5, not the very first MVP core loop.

Recommended MVP treatment:

model the schema early
create admin/manual entry capability
feature-flag user-facing UI
test manually with 3–5 Melbourne businesses
do not build a full booking marketplace yet

⸻
6.5 Starter plan schema

Suggested tables:

starter_plans
starter_plan_members
starter_plan_hosts
business_leads


Suggested starter_plans fields:

id
city_id
interest_id
business_id nullable
host_user_id nullable
title
description
starts_at
ends_at
location
address
capacity_min
capacity_max
price_cents
status
plan_type
created_at


Plan types:

business_hosted
buzz_hosted
hybrid
user_generated


Suggested starter_plan_members fields:

id
starter_plan_id
user_id
status
joined_at
checked_in_at
cancelled_at


Statuses:

interested
joined
confirmed
attended
cancelled
no_show

⸻
6.6 Monetisation through starter plans

Potential models:

cost per joined user
cost per confirmed attendee
cost per group formed
sponsored starter plan
exclusive category partner


Important principle:

Sponsorship can boost relevance, but should never override user fit.
⸻
7. Non-Ad Revenue Streams

The goal is to monetise without shouting ads at users or asking them to pay on-platform early.

Recommended revenue streams:

7.1 Partner-funded starter plans

Businesses pay to create useful beginner-friendly plans.

Example:

Beginner climbing night
4 newcomer spots
Hosted at partner climbing gym
No experience needed

⸻
7.2 Lead fee only after real intent

Bill only when meaningful actions happen.

Billable actions:

user joins a starter plan
group forms around a business category
user requests more info
user clicks booking link
user attends/checks in
user asks to be contacted

⸻
7.3 Paid host marketplace

Reliable users or verified locals become paid hosts.

Examples:

first Fitzroy night out
beginner surf morning
newcomer coffee walk
Sunday tennis hit-up
international student city intro


Buzz can take a platform fee or have businesses sponsor the host.
⸻
7.4 Business-sponsored hosts

A business pays for a Buzz host to bring a group to their venue or activity.

Example:

A climbing gym sponsors a beginner night.
Buzz provides the group and trusted host.
The gym gets first-time customers.
Users get a safe, structured plan.

⸻
7.5 Sponsored first-time offers

Businesses provide newcomer-specific offers.

Examples:

First boxing class free
Bring your Buzz group and get gloves included
Beginner singing trial for new arrivals


Buzz earns referral or redemption fees.
⸻
7.6 Category exclusivity

One business per category per city becomes the default partner for starter plans.

Example:

Official beginner climbing partner — Melbourne
Official beginner surf partner — Melbourne
Official singing partner — Melbourne


This should be framed as preferred activity infrastructure, not banner advertising.
⸻
7.7 B2B relocation partnerships

Potential payers:

relocation agencies
student accommodation providers
universities
serviced apartments
employers
moving companies
Airbnb hosts
real estate agencies


Offer:

Welcome-to-Melbourne social onboarding
International student settlement pack
Corporate relocation social integration
New tenant city starter pack

⸻
7.8 Employer-sponsored city onboarding

Companies hiring interstate/international employees may pay to help employees settle socially.

Pitch:

Employees who settle socially are more likely to stay.
Buzz helps new hires build a life outside work.


Possible package:

per relocated employee fee
company-branded onboarding link
recommended activities
newcomer groups
verified local hosts

⸻
7.9 University/student accommodation partnerships

Strong fit for international students.

Possible products:

semester onboarding package
student accommodation social layer
orientation week activity groups
sponsored newcomer events

⸻
7.10 Venue/group booking commission

When Buzz forms a group and sends them to a class, court, studio, or venue, Buzz can take a commission.

Examples:

court booking
surf lesson
pottery class
escape room
cooking class
climbing session
language class

⸻
7.11 Filled-seat revenue

Businesses with spare class/event capacity can pay Buzz to fill relevant spots.

Example:

A beginner yoga class has 5 open spots tonight.
Buzz shows it only to users who selected yoga/wellness and are free tonight.


This is demand matching, not advertising.
⸻
7.12 Aggregated local demand insights

Later-stage only, with strict privacy boundaries.

Example insights:

300 new arrivals in Melbourne selected climbing this month
high demand in Fitzroy/Brunswick
most popular availability: Tuesday/Thursday evenings


Never expose individual user data.
⸻
7.13 Sponsored city starter packs

Brands or institutions sponsor useful onboarding packs.

Example:

Your first 30 days in Melbourne
Powered by [partner]


Best partners:

relocation agencies
universities
student accommodation
coworking spaces
gyms
lifestyle brands

⸻
7.14 Partner dashboard / CRM

Once businesses are receiving leads or groups, charge for better tools:

lead tracking
attendance reporting
conversion analytics
upcoming demand by interest
plan creation tools
message templates
performance dashboard

⸻
8. Neighbourhood Matching Reintroduced into MVP

Neighbourhood matching was identified as important and should be brought back into MVP in a lightweight form.

Reason:

Without neighbourhood matching, Buzz risks becoming mostly a friend/activity app. With neighbourhood matching, it feels more like a city integration platform.

The MVP loop should become:

quiz
→ suburb recommendations
→ interest selection
→ interest activation
→ people/groups/plans

⸻
8.1 MVP neighbourhood matching approach

Keep it simple and deterministic.

Do not build:

full AI city guide
deep rental search
real estate platform
complex commute planning
local Q&A engine


Build:

quiz answers
→ lifestyle tags
→ suburb scores
→ top 3 suburb recommendations
→ reasons why

⸻
8.2 Recommended language

Avoid saying:

You should live here


Prefer:

Suburbs you may enjoy exploring
Your best-fit areas to explore
Suburbs that match your lifestyle
Places you might feel at home


This reduces accuracy pressure and avoids requiring full housing/real estate data.
⸻
8.3 Example suburb scoring

Suburb data can be stored as weighted lifestyle tags.

Example:

Fitzroy:
nightlife +5
music +5
food +4
creative +5
walkability +4
budget -2
quiet -3

South Yarra:
fitness +5
coffee +4
parks +4
public_transport +5
nightlife +3
budget -3

St Kilda:
beach +5
nightlife +4
outdoors +4
music +3
public_transport +3
quiet -2


Quiz answers map to tags:

User likes beach → beach +5
User likes running → outdoors +3, fitness +4
User likes live music → music +5, nightlife +2
User prefers quiet → quiet +5, nightlife -2
User is budget-conscious → budget +5


Then the system returns top suburbs by score.
⸻
8.4 Neighbourhood matching UI

After quiz completion, show:

Your Melbourne fit

Top suburbs:
1. Fitzroy
2. South Yarra
3. Brunswick

Top interests to activate:
1. Live music
2. Coffee walks
3. Beginner tennis


Each suburb should include:

fit label or match score
why it suits the user
best interests nearby
starter plans nearby, later
people/groups nearby, later


Example:

Fitzroy — Strong match

You might like Fitzroy because you selected live music, food, nightlife, creative activities and casual social settings.

⸻
8.5 Suggested schema additions

suburbs
suburb_tags
quiz_tags
user_suburb_matches


Suggested suburbs fields:

id
city_id
name
description
latitude
longitude
average_rent_band
transport_score
walkability_score
nightlife_score
safety_notes
created_at


Suggested suburb_tags fields:

suburb_id
tag
weight


Suggested user_suburb_matches fields:

user_id
suburb_id
score
reasons
created_at

⸻
9. Updated MVP Scope

The MVP should now include lightweight neighbourhood matching.

In MVP

sign up / local dev profile
basic profile creation
20-question personality quiz placeholder
Melbourne-only city setup
8–10 starter interests
deterministic suburb recommendations
interest selection
same-city + same-interest people matching
interest activation button
invite matched users
accept as friend or agree to organise activity
create group
in-app group chat
basic attendance confirmation


Schema/placeholders/feature-flagged, but not primary MVP

AI match explanations
business-backed starter plans
paid hosts
verified locals
local knowledge Q&A
promoted events
paid lead attribution
subscriptions
advanced business dashboard
full city guide

⸻
10. Updated Technical Direction

The technical direction remains:

React Native / Expo in monorepo
Supabase-first backend
Postgres/PostGIS
Supabase Edge Functions
GitHub Actions for CI/CD
Railway optional later
Turborepo + pnpm
plug-and-play CLI
AI server-side only
mock AI locally


Key technical implications from the newer product discussion:

10.1 Add suburb matching tables and seed data

Seed Melbourne suburbs with tag weights.

10.2 Add feature flags

Default flags:

business_recommendations=false
promoted_events=false
lead_attribution=false
ai_match_cards=false
local_knowledge_qa=false
verified_locals=false
subscriptions=false
starter_plans=false or hidden
paid_hosts=false


10.3 Keep starter plan schema early

Even if UI is disabled, design the database to support future starter plans.

10.4 Add reliability/attendance model early

At minimum, include fields/tables that allow tracking:

confirmed attendance
attended
cancelled
no_show
post-activity feedback
attendance streak
host eligibility


Do not make reliability a harsh public score in MVP.
⸻
11. Product Guardrails

AI agents should avoid overbuilding.

Do not build these too early:

full AI local Q&A
complex recommendation engine
paid subscription system
Stripe marketplace
full booking system
advanced CRM
multi-city expansion tooling
complex host payout system
native ads
real estate/rental search
heavy custom backend monolith


Prioritise:

quiz
suburb recommendations
interest activation
small-group matching
group chat
attendance/reliability primitives
clean schema for later starter plans

⸻
12. Recommended Implementation Planning Sequence

AI agents creating implementation plans should work in this order:

Phase 1 — Local runnable MVP foundation

Expo app
Next.js admin
Supabase local config
schema/migrations
seed data
local env/bootstrap
interests list
basic profile


Phase 2 — Quiz and suburb matching

20-question quiz placeholder
quiz answer storage
lifestyle tag mapping
Melbourne suburb seed data
suburb scoring function
top 3 suburb results UI


Phase 3 — Interest activation and matching

user interests
activate interest
same-city/same-interest matching
availability capture
candidate records
accept/decline


Phase 4 — Groups and chat

activity groups
group members
group messages
basic group chat UI
plan confirmation


Phase 5 — Attendance and reliability primitives

RSVP confirmation
attendance status
post-activity feedback
attendance streak
host eligibility placeholder


Phase 6 — Starter plans, feature-flagged

starter plan schema
admin/manual plan creation
business-backed plan placeholders
show only behind feature flag


Phase 7 — Optional infra/configure

Railway hosting
GitHub deploy workflows
AI provider configuration
Sentry/PostHog
Stripe
push provider

⸻
13. Most Important Current Product Thesis

Buzz should be built around this loop:

I just moved to Melbourne.
I answer a quiz.
Buzz tells me which suburbs I might enjoy.
I select interests I want to try.
I activate one.
Buzz finds compatible nearby people.
Buzz helps us form a small plan.
We attend.
My reliability grows.
Eventually reliable people can host.
Businesses can support useful starter plans.


Everything else should serve that loop.
⸻
14. Key Success Metrics

Early metrics should track real-world intent and follow-through:

quiz completion rate
suburb recommendation viewed
interest selected
interest activated
matched users pinged
accept rate
group formed
group chat opened
plan proposed
attendance confirmed
activity marked as happened
post-activity positive feedback
repeat activation
attendance streak growth


Avoid over-indexing on:

profile views
likes
chat messages without plans
generic app opens

⸻
15. Summary for Agents

Buzz is not just a friend app.

Buzz is a city integration product that should help new arrivals:

understand where they fit
choose what they want to try
find people to do it with
turn intent into an actual plan
build trust through attendance
eventually unlock hosts and partner-backed plans


The MVP should now include lightweight neighbourhood matching because it reinforces the city-integration promise.

The most important product differentiator is not AI, ads, or subscriptions.

It is:

plan-first social activation for people new to a city.
⸻
16. Additional Gamification Ideas That Do Not Feel Gimmicky

Gamification in Buzz should reward real-world progress, not shallow app usage.

The principle is:

Gamify becoming more settled, more reliable, and more helpful — not swiping, scrolling, or collecting meaningless badges.

Good gamification should feel like:

I’m building a life in this city.


Not:

I’m playing a social app.

⸻
16.1 Settling Journey

Create a soft progress path around becoming settled in a new city.

Example milestones:

First interest activated
First group joined
First activity attended
First suburb explored
First repeat plan
First person met twice


This can power a “Settling In” progress screen.

Example UI copy:

You’re finding your feet in Melbourne:

✓ Picked your interests
✓ Found your best-fit suburbs
✓ Joined your first plan
○ Attend your first activity
○ Meet someone for a second activity


This works because it mirrors the emotional journey of moving cities.
⸻
16.2 Attendance Streaks

Attendance streaks are a strong mechanic because they reward reliability and real-world follow-through.

Example signals:

3-plan attendance streak
5 confirmed activities attended
2 weekends in a row
Reliable this month


Use positive framing.

Prefer:

Current streak
Best streak
Reliable this month


Avoid harsh messaging like:

You lost your streak
Your reliability dropped

⸻
16.3 Trust Tiers

Use human-friendly trust labels instead of public numeric scores.

Example progression:

New Arrival
Active Member
Reliable Regular
Community Host
Verified Host


Trust tiers should be earned through:

attending confirmed plans
positive feedback
avoiding no-shows
helping groups form
hosting successful plans


These tiers support safety, status, and future host eligibility without making the app feel gimmicky.
⸻
16.4 Exploration Milestones

Tie progress to the city itself.

Examples:

Explored 3 suburbs
Tried 2 new venues
Joined plans in 2 different neighbourhoods
Completed your first Melbourne weekend


Frame this as:

Your Melbourne Map


rather than “achievements.”

This reinforces Buzz as a city integration platform, not only a friend app.
⸻
16.5 Interest Journeys

Each interest can have its own progression path.

Example for tennis:

Curious
First hit-up joined
Played twice
Found a regular group


Example for climbing:

Want to try
Intro session booked
First climb completed
Joined a beginner group


This gives users momentum around specific hobbies.
⸻
16.6 “Try Something New” Prompts

Use gentle nudges based on user interests and comfort zone.

Examples:

You’ve done two coffee plans. Want to try something more active this weekend?


You said you wanted to try singing. There are 3 other people interested this week.


This is gamification as guidance, not points.
⸻
16.7 Group Momentum Meter

For forming plans, show progress toward viability.

Examples:

Beginner tennis this Saturday
2 of 4 people interested
1 more needed to unlock group chat


This plan goes ahead when 3 people confirm.


This creates urgency and social proof without feeling like a game.
⸻
16.8 Host Eligibility Path

If reliable users can eventually become paid hosts, show a transparent path.

Example:

Host eligibility

✓ Attend 5 activities
✓ Receive positive feedback from 3 groups
✓ Complete profile verification
○ Host one trial activity


This is meaningful because it unlocks a real opportunity, not a cosmetic badge.
⸻
16.9 Contribution Credits

Reward users for helping the community.

Examples:

welcomed a new member
suggested a venue
helped pick a time
hosted a group
left useful feedback
reported an issue responsibly


This supports community quality and creates more ways for helpful users to progress.
⸻
16.10 City Confidence

City confidence can be a private progress indicator.

Inputs:

suburbs explored
activities attended
groups joined
repeat connections
saved places
confidence in city preferences


Suggested language:

You’re getting to know Melbourne.
City confidence: Growing


Use labels rather than hard numbers:

Just landed
Finding your feet
Getting comfortable
Feeling local


Avoid public scores.
⸻
16.11 Repeat Connection Milestones

Reward repeat social connection, not just meeting many people.

Examples:

met someone again
joined a second activity with the same person
formed a regular group


Example copy:

You and Sarah have joined 2 plans together.
Your tennis group has met 3 times.


This is more meaningful than likes or profile views.
⸻
16.12 Seasonal or City Challenges

Use lightly and locally.

Examples:

Melbourne winter challenge:
Try 3 indoor activities this month.

Summer newcomer challenge:
Beach walk, outdoor movie, beginner tennis.


These should feel like city discovery prompts rather than game quests.
⸻
16.13 Recommended Gamification Bundle

The strongest bundle is:

Settling Journey
+ Attendance Streaks
+ Trust Tiers
+ Host Eligibility
+ City Exploration Milestones


This creates a progression system that feels native to the product.
⸻
16.14 Gamification to Avoid

Avoid mechanics that reward shallow app behaviour:

daily login streaks
swipe counts
profile views
leaderboards
public popularity rankings
random badges
points for sending messages
competitive friend scores


These would make Buzz feel gimmicky and could damage trust.
⸻
16.15 Product Language Guidance

Use calm, adult language.

Prefer:

Milestones
Progress
Reliability
Trusted member
Host eligible
City confidence
Settling journey


Avoid:

XP
coins
power-ups
quests
leaderboards
achievement unlocked


The system should feel useful, not childish.
⸻
16.16 MVP Gamification Recommendation

For MVP, build only the foundations:

attendance status
attendance streak
settling milestones
trust tier placeholder
host eligibility placeholder


The first visible version could simply show:

Your progress in Melbourne

✓ Completed your quiz
✓ Found your best-fit suburbs
✓ Activated your first interest
○ Attend your first plan
○ Join your first group
○ Meet someone again


That is enough to create motivation without overbuilding a gamified layer.
⸻
17. City Configuration Layer for Future Rollouts

Buzz should support future city launches through configuration, not hardcoded city logic.

The principle is:

One app. Many city configs. Each city is its own market.

Melbourne should be the default seeded city, but the system must support adding new cities through data/config rather than app code changes.
⸻
17.1 Core Idea

Do not hardcode behaviour like:

if city === "Melbourne" show these suburbs/interests/businesses


Instead, the app should ask the backend:

What city is this user in, and what configuration applies here?


The backend should return a city context object.

Example:

{
  "city": "Melbourne",
  "country": "Australia",
  "timezone": "Australia/Melbourne",
  "currency": "AUD",
  "launchStatus": "active",
  "enabledFeatures": {
    "neighbourhoodMatching": true,
    "starterPlans": true,
    "verifiedHosts": false,
    "businessPartners": true,
    "localKnowledgeQa": false
  },
  "defaultInterests": ["tennis", "climbing", "coffee", "running"],
  "activeSuburbs": ["Fitzroy", "Brunswick", "South Yarra", "St Kilda"],
  "copy": {
    "welcome": "Find your people in Melbourne",
    "starterPackTitle": "Your first 30 days in Melbourne"
  }
}


The mobile app should render dynamically from this config.
⸻
17.2 City Detection Strategy

Use multiple layers.

User-selected city

During onboarding, ask:

Where have you moved to?


This should be the primary source of truth.

Device location

If the user allows location access, detect their current city and suggest it.

Example:

Looks like you’re in Melbourne. Is this where you’re settling in?


Do not silently assume. Users may be travelling.

Profile city

Store the chosen city on the profile:

profile.city_id = Melbourne


This drives matching, suburbs, interests, starter plans, and business recommendations.

Travel detection later

If a Melbourne user opens the app in Sydney:

You seem to be in Sydney. Want to explore Buzz here temporarily?


This supports future travel/temporary mode without breaking the settling-in use case.
⸻
17.3 City/Market Data Model

Add a configuration-driven city model.

cities

id
name
country_code
timezone
currency
default_latitude
default_longitude
launch_status
created_at
updated_at


Launch statuses:

planned
waitlist
private_beta
active
paused
retired


city_settings

city_id
matching_radius_km
default_group_size_min
default_group_size_max
activation_expiry_hours
requires_invite
is_waitlist_enabled
copy_json
feature_flags_json
created_at
updated_at


city_feature_flags

city_id
feature_key
enabled
payload_json


Example features:

neighbourhood_matching
starter_plans
verified_hosts
business_partners
paid_hosts
local_knowledge_qa
promoted_events
city_starter_packs


suburbs

id
city_id
name
description
latitude
longitude
active


suburb_tags

suburb_id
tag
weight


city_interests

city_id
interest_id
is_active
sort_order
launch_priority


This matters because each city may prioritise different activities.

Examples:

Sydney: surfing, beach walks, pilates, tennis
Melbourne: coffee, running, climbing, live music
Gold Coast: surfing, beach fitness, social sport


city_partner_categories

city_id
interest_id
category_name
exclusive_partner_available
active


city_launch_checklist

Operational rollout table:

city_id
has_suburbs_seeded
has_interests_seeded
has_partner_targets
has_hosts_seeded
has_landing_page
has_waitlist
ready_for_beta
ready_for_public_launch

⸻
17.4 App Behaviour

The app should load city config early.

Flow:

App opens
→ determine selected/current city
→ fetch city config
→ apply feature flags/copy/defaults
→ render city-specific experience


Backend/API functions:

getAppConfig(cityId)
getOnboardingConfig(cityId)
getInterestConfig(cityId)
getNeighbourhoodConfig(cityId)
getStarterPlanConfig(cityId)


The app should cache this locally and refresh periodically.
⸻
17.5 City Rollout Should Be Data Entry, Not Code Changes

Launching a new city should not require a new app release.

An admin/city manager should be able to configure:

city name
timezone
currency
suburbs
suburb tags
default interests
starter plan categories
business partner categories
host availability
feature flags
waitlist/active status
city-specific copy


Then flip:

launch_status = active


The mobile app should pick up the new city automatically.
⸻
17.6 Admin Dashboard Requirements

The admin app should eventually include a City Manager section.

Features:

Create city
Set launch status
Manage suburbs
Manage suburb tags
Manage active interests
Manage city feature flags
Manage starter plans
Manage business partners
Manage hosts
Preview city onboarding
Preview city recommendations


This creates the Uber-like behaviour where the same app adapts to each market.
⸻
17.7 City Configuration Examples

Melbourne

{
  "launchStatus": "active",
  "matchingRadiusKm": 10,
  "defaultGroupSize": [3, 5],
  "enabledFeatures": {
    "neighbourhoodMatching": true,
    "starterPlans": true,
    "verifiedHosts": false
  },
  "priorityInterests": [
    "coffee",
    "running",
    "tennis",
    "climbing",
    "live_music",
    "language_exchange",
    "pottery",
    "fitness"
  ]
}


Sydney

{
  "launchStatus": "waitlist",
  "matchingRadiusKm": 12,
  "defaultGroupSize": [3, 5],
  "enabledFeatures": {
    "neighbourhoodMatching": true,
    "starterPlans": false,
    "verifiedHosts": false
  },
  "priorityInterests": [
    "surfing",
    "beach_walks",
    "running",
    "tennis",
    "pilates",
    "coffee",
    "climbing"
  ]
}


Brisbane

{
  "launchStatus": "planned",
  "matchingRadiusKm": 15,
  "enabledFeatures": {
    "neighbourhoodMatching": false,
    "starterPlans": false
  }
}

⸻
17.8 Waitlist Mode

Inactive cities should not show a broken product.

If a user opens Buzz in a city that is not active yet, show:

Buzz isn’t live in Brisbane yet.
Join the waitlist and tell us what you want to try.


Still collect:

email
city
interests
arrival status
suburb preferences


This data helps prioritise future launches.
⸻
17.9 Feature Flags by City

Feature flags should be city-scoped.

Example:

Melbourne:
neighbourhood matching = on
starter plans = on
business partners = on

Sydney:
neighbourhood matching = on
starter plans = off
business partners = waitlist

Brisbane:
waitlist only


This makes rollouts safer and easier to stage.
⸻
17.10 Matching Must Be City-Scoped

All matching queries should include city context.

Example filter:

city_id = current_city_id
interest_id = activated_interest_id
not settled
available
not blocked
within radius


Avoid global matching unless explicitly adding travel mode.
⸻
17.11 Neighbourhood Matching Must Be City-Specific

Suburb recommendations should use:

quiz tags
+
city suburb tags
+
city-specific weights


Do not rely on generic scoring only. A tag like “beach” behaves differently in Melbourne, Sydney, Brisbane, and the Gold Coast.
⸻
17.12 Backend Function: get-city-context

Add a backend function:

get-city-context


Input:

{
  "cityId": "uuid",
  "lat": -37.8136,
  "lng": 144.9631
}


Output:

{
  "city": {},
  "settings": {},
  "featureFlags": {},
  "activeInterests": [],
  "suburbs": [],
  "starterPlanConfig": {},
  "copy": {}
}


This should be used by the app during startup and onboarding.
⸻
17.13 City Templates

To make rollouts fast, create city templates.

Example templates:

large_urban_australia
student_heavy_city
beach_city
regional_city
international_hub


A template should include:

default interests
default group size
recommended feature flags
default onboarding copy
starter plan categories
launch checklist


A new city should start from a template and then be customised.
⸻
17.14 Repeatable City Rollout Process

A future city launch should look like:

1. Create city in admin
2. Select city template
3. Add 15–30 suburbs
4. Tag suburbs
5. Select 8–10 launch interests
6. Add landing/waitlist mode
7. Recruit first hosts/partners
8. Seed starter plans
9. Turn on private beta
10. Turn on public launch

⸻
17.15 MVP Version of City Config

For MVP, build:

cities
city_settings
city_feature_flags
suburbs
suburb_tags
city_interests
get-city-context function
admin city config placeholder
Melbourne seed data
waitlist mode for inactive cities


Do not build:

complex multi-city marketplace operations
advanced city analytics
automatic expansion logic
franchise-style city management

⸻
17.16 Requirement for AI Agents

All city-specific behaviour must be configuration-driven.

Do not hardcode Melbourne-specific logic in the mobile app.

Melbourne should be the default seeded city, but every system should support future cities through data/config.

The app should behave like:

One app.
Many city configs.
Each city is its own market.

⸻
18. Updated Implementation Planning Sequence

AI agents should now include the gamification and city configuration foundations in implementation planning.

Recommended order:

Phase 1 — Local runnable MVP foundation

Expo app
Next.js admin
Supabase local config
schema/migrations
seed data
local env/bootstrap
city config model
Melbourne seed city
interests list
basic profile


Phase 2 — Quiz, city context, and suburb matching

get-city-context function
20-question quiz placeholder
quiz answer storage
lifestyle tag mapping
Melbourne suburb seed data
suburb scoring function
top 3 suburb results UI


Phase 3 — Interest activation and matching

user interests
activate interest
same-city/same-interest matching
availability capture
candidate records
accept/decline


Phase 4 — Groups and chat

activity groups
group members
group messages
basic group chat UI
plan confirmation


Phase 5 — Attendance, trust, and progress primitives

RSVP confirmation
attendance status
post-activity feedback
attendance streak
settling journey milestones
trust tier placeholder
host eligibility placeholder


Phase 6 — Starter plans, feature-flagged

starter plan schema
admin/manual plan creation
business-backed plan placeholders
show only behind feature flag


Phase 7 — City rollout tooling

admin city manager placeholder
city feature flags
city launch checklist
waitlist mode for inactive cities
city templates


Phase 8 — Optional infra/configure

Railway hosting
GitHub deploy workflows
AI provider configuration
Sentry/PostHog
Stripe
push provider

⸻
19. Updated Product Thesis

Buzz should be built around this loop:

I just moved to Melbourne.
I answer a quiz.
Buzz detects or asks for my city.
Buzz loads the Melbourne config.
Buzz tells me which suburbs I might enjoy.
I select interests I want to try.
I activate one.
Buzz finds compatible nearby people in the same city.
Buzz helps us form a small plan.
We attend.
My reliability and settling progress grow.
Eventually reliable people can host.
Businesses can support useful starter plans.
Future cities can be launched through configuration.


Everything else should serve that loop.
⸻
20. Safety Features and Offline Meeting Protocol

Because Buzz helps users meet strangers offline, safety must be treated as core product infrastructure, not a later settings-page feature.

The product should feel like:

Buzz helps me meet people, but only in structured, low-pressure, public, accountable ways.


Not:

Buzz throws strangers together and hopes for the best.

⸻
20.1 Safety Principles

Buzz should be designed around these rules:

Group-first by default
Public places by default
User control at every step
No exact location exposure
Progressive trust, not blind trust
Easy exit paths
Fast reporting and blocking
Post-activity accountability

⸻
20.2 Group-First Safety Model

The safest default is small groups, not one-to-one meetups.

Recommended default group size:

3–5 people


Why this matters:

less romantic/dating ambiguity
less pressure
safer for women and vulnerable users
more natural socially
less awkward if one person does not click


MVP default:

Buzz only forms small groups by default.


Later:

1:1 meetups unlock only for trusted users or mutual opt-in.

⸻
20.3 Public-Place Default

Every plan should default to public or partner locations.

Preferred locations:

cafés
gyms
climbing centres
tennis courts
parks during daylight
community spaces
classes
business-backed venues


Avoid or restrict:

private homes
isolated locations
late-night isolated walks
unverified addresses
unmoderated house parties


For MVP, private-location plans should be blocked.

Plan cards should clearly label:

Public venue
Partner venue
Hosted activity
Unverified location

⸻
20.4 No Exact Home Location

Users should never see each other’s exact location.

Use city/suburb/distance bands only:

Same suburb
Nearby
1–3 km away
3–5 km away
Melbourne inner north


Avoid:

Exact pin
Exact address
Live location by default
“500m from you”


The backend can use precise location for matching, but the UI should only expose approximate context.
⸻
20.5 Safety Onboarding

During onboarding, users should understand the safety model without feeling scared.

Suggested copy:

Buzz works best in small groups and public places.
Never share private addresses early.
Use the app to confirm plans.
Report or block anyone who makes you uncomfortable.

⸻
20.6 Verification Levels

Verification should be progressive.

Level 0 — Basic profile

email verified
profile completed
interests selected


Level 1 — Phone verified

phone number verified


Level 2 — Identity confidence

Possible options:

selfie check
photo consistency check
social account link
student/work email verification


Level 3 — Trusted member

Earned through:

attended activities
positive feedback
no serious reports
reliable confirmations


Level 4 — Host verified

Required for official Buzz hosts.

May require:

manual review
ID check through third-party provider
training checklist
host code of conduct


MVP should support at least:

email verification
profile completeness
phone verification optional
trust tier placeholder

⸻
20.7 Profile Safety Controls

Every profile should support:

block
report
hide from this person
hide exact suburb
pause visibility
settled/inactive toggle


Blocking should be absolute:

blocked users cannot view profile
blocked users cannot match
blocked users cannot join same group
blocked users cannot message
blocked users are removed from future recommendations


Reporting should be available from:

profile
chat
activity group
post-activity feedback
notification/ping

⸻
20.8 Interest Activation Safety

Interest activation should not be an unrestricted broadcast.

Rules:

rate-limit activations
limit number of people pinged
respect blocks
respect visibility settings
respect age/safety boundaries
respect trust requirements for certain activities


Suggested MVP limits:

new user can activate up to 3 interests/day
maximum 10 pings per activation
no repeat pinging same person within 7 days


Higher-risk activities should have stricter defaults:

nightlife
drinks
hiking
late-night events
driving somewhere


Possible rules:

groups only
public venue required
minimum 3 confirmed people
no exact location sharing
stronger reminder/check-in

⸻
20.9 Group Chat Safety

Group chat should open only after there is a valid plan or enough mutual interest.

Safety features:

report message
block user
leave group
mute group
moderation hooks
toxicity/spam detection later


MVP restrictions:

text only
no unsolicited images
limit external links or warning-gate them
no mass direct messaging

⸻
20.10 Plan Confirmation Protocol

Before an activity happens, the app should create a structured plan card.

Plan card fields:

activity
date/time
public location
group members
host, if any
confirmation status
safety reminders


User confirmation options:

I’m going
Maybe
Can’t make it


Suggested reminder copy:

Only attend if the plan is in a public place.
Tell someone where you’re going.
You can leave the group or report anytime.

⸻
20.11 Safety Check-Ins

Use lightweight check-ins for MVP.

Before activity:

Reminder: your plan is today at 6pm.
Confirm you’re still going.


After activity:

Did this happen?
Did you feel safe?
Would you meet this group again?
Any issues to report?


Post-activity options:

All good
Someone didn’t show
Something felt off
Report an issue
Block someone


Later, for higher-risk plans:

share plan with friend
check-in timer
emergency contact prompt


Do not imply Buzz is an emergency service unless that capability truly exists.
⸻
20.12 Share My Plan

Users should be able to share a safety summary externally.

Example:

I’m going to beginner climbing at Urban Climb Collingwood
Saturday 10am
Group of 4 through Buzz
Expected finish: 11:30am


This can be shared via SMS, iMessage, WhatsApp, or system share sheet.

Do not include other users’ private details.
⸻
20.13 Host Safety Protocol

If Buzz introduces verified/paid hosts, host safety standards need to be explicit.

Host requirements:

verified identity
clear profile
minimum reliability history
no serious reports
host training checklist
public-place activities only
post-activity feedback reviewed


Host responsibilities:

arrive first
welcome attendees
keep activity public and inclusive
do not pressure users to continue elsewhere
report incidents
mark attendance accurately


Host tools:

remove participant from group
report incident
cancel plan
contact Buzz support
mark no-show

⸻
20.14 Business/Venue Safety

Business-backed starter plans are useful because they create safer, structured environments.

Partner venues should have:

public address
business profile
contact person
opening hours
activity details
refund/cancellation rules if relevant


Buzz should prefer partner venues for early activities because they add accountability.
⸻
20.15 Moderation and Enforcement

Buzz needs a simple enforcement ladder.

User statuses:

active
limited
under_review
suspended
banned


Moderation actions:

warning
temporary messaging limit
temporary activation limit
group removal
suspension
ban


Trigger events:

multiple reports
harassment
threats
sexual misconduct
spam/scams
repeated no-shows
fake profile
unsafe venue suggestion


MVP can start manual, but the schema should support moderation states.
⸻
20.16 Incident Reporting Flow

Report reasons:

harassment
inappropriate messages
felt unsafe
did not show up
fake profile
spam/scam
unsafe plan/location
discrimination
other


Follow-up fields:

what happened?
where did it happen?
who was involved?
do you want to block this person?
do you want Buzz to follow up?


After report:

We’ve received your report.
You will not be matched with this person again.
If you are in immediate danger, contact local emergency services.


Buzz should not claim to provide emergency response unless it can actually do so.
⸻
20.17 Privacy and Data Minimisation

Collect what is needed:

profile
city/suburb
approximate location for matching
attendance status
reports
blocks
basic trust signals


Avoid exposing:

exact home location
real-time location by default
private phone number
personal email
full legal name unless required for host verification

⸻
20.18 Age Boundaries

For MVP, strongly recommend:

18+ only


This simplifies safety, moderation, liability, and offline meetup risk.

University students can still be targeted if they are aged 18+.
⸻
20.19 Activity Risk Levels

Activities should have risk categories.

Low risk

coffee
board games
language exchange
group class at venue
gym trial class


Medium risk

nightlife
drinks
late events
outdoor walks
beach activities


Higher risk

hiking
driving trips
private parties
remote locations


MVP should focus on low/medium-risk activities and public venues.

Higher-risk activities can be blocked or require host verification later.
⸻
20.20 Safety Data Model Additions

user_safety_settings

user_id
show_suburb
allow_direct_messages
allow_one_to_one_invites
share_distance_band
blocked_by_default_for_unverified
created_at
updated_at


user_verifications

id
user_id
verification_type
status
provider
verified_at
created_at


Verification types:

email
phone
selfie
id
student_email
work_email
manual_host_review


reports

id
reporter_id
reported_user_id
group_id
message_id
plan_id
reason
details
status
created_at
reviewed_at
reviewed_by


moderation_actions

id
user_id
action_type
reason
created_by
expires_at
created_at


plan_safety_checks

id
plan_id
user_id
pre_confirmed_at
post_activity_status
felt_safe
would_meet_again
reported_issue
created_at


user_reliability

user_id
confirmed_count
attended_count
no_show_count
cancelled_late_count
attendance_streak
trust_tier
host_eligible
updated_at


activity_risk_levels

interest_id
risk_level
requires_group
requires_public_place
requires_verified_host
minimum_group_size

⸻
20.21 Safety Rules in Matching

Matching must check:

not blocked either direction
not suspended
profile visible
same city
age constraints satisfied
trust constraints satisfied
activity risk constraints satisfied
no recent report conflict


Example rules:

If activity requires group:
  do not allow 1:1 plan

If activity requires verified host:
  only show hosted starter plans

If user is limited:
  prevent activations and messages

⸻
20.22 MVP Safety Feature Set

Include in MVP:

18+ only
group-first matching
public-place guidance
no exact location exposure
block user
report user
leave group
profile visibility controls
rate-limited interest activation
text-only group chat
structured plan card
pre-plan confirmation
post-plan safety check
attendance/reliability primitives
manual admin moderation
activity risk levels


Do not overbuild in MVP:

real-time emergency tracking
AI surveillance
complex ID verification
automated banning
full trust marketplace

⸻
20.23 Safety Product Positioning

Safety should be a visible differentiator:

Buzz is built for small-group, public, low-pressure activities — with reliability, reporting and post-plan accountability built in.

This is much stronger than bolting on a block button later.
⸻
21. Bring a Friend — Deep Link Invite Specification

“Bring a Friend” is a high-priority growth and safety mechanic.

It lets an existing user invite someone they already know into a specific plan, group, interest, or starter activity via a contextual deep link.

The core idea:

Buzz users do not invite people to an app. They invite them to a plan.

This is more organic than a generic referral system.
⸻
21.1 Why Bring a Friend Matters

Bring a Friend solves three major problems:

Cold start

Each user can pull another trusted person into the network.

Safety

Meeting strangers feels less intimidating when users can bring someone they already know.

Conversion

The invite has a clear reason:

I’m doing this thing. Come with me.


Rather than:

Download this social app.

⸻
21.2 Product Principle

Most apps ask:

Invite your friends to Buzz.


Buzz should ask:

Want to bring someone to this plan?


The user is not promoting Buzz. They are inviting someone to do something.
⸻
21.3 Core User Flow

Step 1 — User joins or creates a plan

Example:

Beginner climbing night
Thursday 6:30pm
4 people max
2 spots left


Step 2 — Buzz prompts

Want to bring a friend?
Plans feel easier with someone you know.


CTA:

Bring a friend


Step 3 — User shares deep link

Suggested share copy:

I’m joining a beginner climbing group on Buzz this Thursday. Want to come with me?


Example link:

https://buzz.app/join/plan/<inviteToken>


Step 4 — Friend opens link

If app is installed:

Open Buzz → plan preview


If app is not installed:

Web preview → App Store / Play Store → install → deferred deep link → plan preview


For MVP, web fallback can preserve the invite token through sign-up/install.

Step 5 — Friend sees low-friction preview

Before full signup, show enough context to understand the value.

Example:

Gabe invited you to join a beginner climbing plan on Buzz.

Beginner climbing night
Thursday 6:30pm
Collingwood
Small group
Public venue
First-timers welcome
2 spots left


CTA:

Join Gabe


Secondary:

Learn about Buzz


Step 6 — Friend signs up and joins

After signup/login:

You’re in.
Group chat opens when 3 people confirm.

⸻
21.4 Critical UX Rule

The invited friend should not need to complete full onboarding before seeing why they were invited.

Bad flow:

Install app
→ create account
→ quiz
→ profile
→ finally see invite


Good flow:

Open link
→ see plan
→ understand value
→ create lightweight account
→ join
→ complete full quiz later


The invite target preview must come before the full onboarding wall.
⸻
21.5 Invite Types

Plan invite

Most important.

Join this tennis plan with me.


Used for:

activity groups
starter plans
hosted events
business-backed beginner sessions


Interest invite

Useful before a plan exists.

I want to try climbing. Want to activate it with me?


Flow:

friend joins interest pool
→ Buzz tries to form a group


Suburb/starter pack invite

Useful for neighbourhood matching.

Buzz says I should explore Fitzroy. Want to do the Fitzroy starter pack with me?


General Buzz invite

Lowest priority.

I’m using Buzz to settle into Melbourne. You should join.


General app invites should be secondary to contextual plan/interest invites.
⸻
21.6 Safety Benefits

Bring a Friend should be positioned as a safety-positive feature.

Example copy:

Bring someone you trust.
New plans can feel easier with a friend.


Benefits:

less anxiety
more comfort
better attendance
less flaking
stronger initial trust
more group momentum


This also helps solo users because one person inviting a friend makes the whole group feel more stable.
⸻
21.7 Anti-Abuse Controls

Invites need strict guardrails.

Invite limits

Suggested limits:

max 3 friend invites per plan
max 10 pending invites per user per week


Capacity

If a plan has limited spots:

friend can only join if capacity allows


If full:

Join waitlist
Start a similar plan
Activate this interest


Expiry

Invite links should expire.

plan invite expires when plan starts
interest invite expires after 7 days


Tokenised links

Never rely on raw IDs only.

Use:

invite_token
plan_id or target_id
inviter_id
expires_at
max_uses


Safety restrictions

Rules:

blocked users cannot join the same private/small group
reported/suspended users cannot use invites
limited users have reduced invite privileges

⸻
21.8 Data Model

invites

id
invite_token
inviter_user_id
invitee_user_id nullable
invitee_email_or_phone_hash nullable
target_type
target_id
city_id
status
max_uses
use_count
expires_at
created_at
accepted_at
revoked_at


Target types:

plan
activity_group
interest_activation
starter_plan
city_starter_pack
general


Statuses:

active
accepted
expired
revoked
blocked
capacity_full


invite_events

id
invite_id
event_type
metadata_json
created_at


Event types:

created
shared
opened
install_started
signup_started
signup_completed
accepted
joined_group
expired
revoked
capacity_full
blocked


This supports analytics and viral-loop measurement.
⸻
21.9 Deep Link Requirements

Use universal links / app links.

Recommended paths:

/join/plan/:inviteToken
/join/group/:inviteToken
/join/interest/:inviteToken
/join/starter-pack/:inviteToken


The system should support:

installed app deep link
web fallback
app store fallback
deferred deep linking


For MVP, a simple web landing page that preserves the invite token is sufficient.
⸻
21.10 Invite Landing Page Requirements

The web preview should show enough context to convert.

Example content:

Gabe invited you to join a beginner climbing plan on Buzz.

Beginner climbing night
Thursday 6:30pm
Collingwood
Small group
Public venue
First-timers welcome


CTA:

Join Gabe


Secondary CTA:

Learn about Buzz


Avoid making the landing page feel like a generic app ad.
⸻
21.11 UX Copy Examples

Invite button:

Bring a friend


Prompt after joining a plan:

Plans are easier with someone you know.
Want to bring a friend?


Share message:

I’m joining a beginner climbing group on Buzz this Thursday. Want to come with me?


Friend landing page:

Gabe invited you to a Buzz plan.
Join the group, meet a few new people, and try something beginner-friendly.


If plan is full:

This plan is full, but you can join the waitlist or start another climbing group with Gabe.

⸻
21.12 Relationship to Gamification

Bring a Friend can feed into contribution milestones, but avoid spammy referral points.

Good signals:

helped someone join their first plan
brought a friend to a group
helped a plan reach minimum numbers


Avoid:

earn 100 points per invite
invite 10 friends for a badge
referral leaderboard


Potential milestone:

Community Builder
Helped 3 people attend their first Buzz plan

⸻
21.13 Relationship to Host Pathway

Reliable members who regularly bring good people and help plans happen may progress toward host eligibility.

Signals:

invited friend attended
friend received positive feedback
plan reached minimum group size because of invite
user did not spam invites


This connects organic growth to community quality.
⸻
21.14 Relationship to Business-Backed Starter Plans

Bring a Friend is especially useful for partner plans.

Example:

Beginner pottery night
4 spots left
Bring a friend and join together


Businesses benefit because users are more likely to attend if they come with someone they know.

Possible monetisation:

business pays per confirmed attendee
business pays per pair joined
business sponsors bring-a-friend starter plans


Example offer:

Bring a friend: first session includes free gear hire


This feels useful rather than ad-like.
⸻
21.15 MVP Scope

Include a basic version in MVP or very early Phase 1.5.

MVP scope

invite friend button on plan/group
share sheet support
deep link token generation
web fallback page
friend can join plan/group after signup
capacity checks
expiry
basic invite analytics


Not MVP

full referral rewards
complex deferred deep linking attribution
contact book import
paid invite incentives
leaderboards
bulk invites

⸻
21.16 Key Technical Flow

User taps Bring a friend
→ backend creates invite token
→ app opens native share sheet
→ friend opens link
→ web/app resolves token
→ show target preview
→ signup/login
→ backend validates invite
→ capacity/block/safety checks
→ friend joins group/plan
→ invite marked accepted

⸻
21.17 Safety Checks Before Accepting Invite

Before an invited user joins:

invite active
invite not expired
target exists
target has capacity
inviter is still a member
invitee is not blocked by group members
invitee is not suspended
activity allows external invites
plan has not started
city is active or invite is allowed in waitlist mode
age requirements satisfied
activity risk rules satisfied

⸻
21.18 Backend Functions / API

Recommended functions:

create-invite
resolve-invite
accept-invite
revoke-invite
track-invite-event


create-invite

Input:

{
  "targetType": "activity_group",
  "targetId": "uuid",
  "maxUses": 1
}


Returns:

{
  "inviteId": "uuid",
  "inviteToken": "secure-token",
  "shareUrl": "https://buzz.app/join/group/secure-token",
  "expiresAt": "timestamp"
}


resolve-invite

Used by app/web landing page.

Input:

{
  "inviteToken": "secure-token"
}


Returns a safe preview object:

{
  "status": "active",
  "targetType": "activity_group",
  "title": "Beginner climbing night",
  "city": "Melbourne",
  "suburb": "Collingwood",
  "startsAt": "timestamp",
  "publicVenue": true,
  "spotsRemaining": 2,
  "inviterDisplayName": "Gabe"
}


Do not expose private group/user details.

accept-invite

Input:

{
  "inviteToken": "secure-token"
}


Performs safety/capacity checks and joins the user if valid.

revoke-invite

Allows inviter or system/admin to revoke a link.

track-invite-event

Records funnel events.
⸻
21.19 Analytics

Track:

invite_created
invite_shared
invite_opened
invite_preview_viewed
invite_signup_started
invite_signup_completed
invite_accepted
invite_joined_group
invite_capacity_full
invite_expired
invite_blocked
invite_revoked


Key metrics:

invites created per active user
invite open rate
invite signup conversion
invite accept rate
invite-to-attendance rate
plans reaching minimum size because of invites
invited users who return later


The most important metric is not invites sent. It is:

invited users who attend a real plan

⸻
21.20 Abuse and Privacy Notes

Do not implement contact book upload in MVP.

Do not allow bulk invites in MVP.

Do not expose recipient email/phone unless explicitly provided and consented.

Do not show the invited friend the full group member list before signup unless privacy rules allow.

Do not let suspended/limited users create invites.

Do not let invite links bypass safety gates.
⸻
21.21 Recommendation

Make Bring a Friend a core growth/safety mechanic.

In product, call it:

Bring a Friend


Under the hood, treat it as:

contextual invite system
deep link entry point
group growth mechanic
safety comfort feature
early viral loop


It belongs close to MVP because it helps solve cold start without relying entirely on paid acquisition.
⸻
22. Updated Implementation Planning Sequence With Safety and Bring a Friend

Agents should include safety and invite foundations in the implementation plan.

Phase 1 — Local runnable MVP foundation

Expo app
Next.js admin
Supabase local config
schema/migrations
seed data
local env/bootstrap
city config model
Melbourne seed city
interests list
basic profile
safety settings table
reports/blocks tables


Phase 2 — Quiz, city context, and suburb matching

get-city-context function
20-question quiz placeholder
quiz answer storage
lifestyle tag mapping
Melbourne suburb seed data
suburb scoring function
top 3 suburb results UI


Phase 3 — Interest activation and matching

user interests
activate interest
same-city/same-interest matching
availability capture
candidate records
rate-limits
block-aware matching
activity risk rules
accept/decline


Phase 4 — Groups, chat, and safety

activity groups
group members
group messages
text-only group chat
leave group
report from chat/group
structured plan card
pre-plan confirmation
post-plan safety check


Phase 5 — Bring a Friend

invite friend button on group/plan
create-invite function
resolve-invite function
accept-invite function
deep link routes
web fallback preview
share sheet support
capacity checks
block/safety checks
invite analytics


Phase 6 — Attendance, trust, and progress primitives

RSVP confirmation
attendance status
post-activity feedback
attendance streak
settling journey milestones
trust tier placeholder
host eligibility placeholder


Phase 7 — Starter plans, feature-flagged

starter plan schema
admin/manual plan creation
business-backed plan placeholders
show only behind feature flag


Phase 8 — City rollout tooling

admin city manager placeholder
city feature flags
city launch checklist
waitlist mode for inactive cities
city templates


Phase 9 — Optional infra/configure

Railway hosting
GitHub deploy workflows
AI provider configuration
Sentry/PostHog
Stripe
push provider

⸻
23. Updated Product Thesis With Safety and Bring a Friend

Buzz should be built around this loop:

I just moved to Melbourne.
I answer a quiz.
Buzz detects or asks for my city.
Buzz loads the Melbourne config.
Buzz tells me which suburbs I might enjoy.
I select interests I want to try.
I activate one.
Buzz finds compatible nearby people in the same city.
Buzz helps us form a small, public, low-pressure plan.
I can bring a friend if I want extra comfort.
We attend.
The app checks that everything felt safe.
My reliability and settling progress grow.
Eventually reliable people can host.
Businesses can support useful starter plans.
Future cities can be launched through configuration.


Everything else should serve that loop.
⸻
24. Unique Strategic Hook — Buzz as a Social Landing System

The strongest new product hook is to position Buzz not as a friend app, event app, or local guide, but as a social landing system for people who have just moved city.

Core positioning:

Buzz helps you land in a city and build a life there, step by step.

This creates a more ownable product category than “make friends” or “discover events.”

Suggested category language:

social onboarding for a new city
city landing system
settling-in companion
first 30 days in a new city


The product should feel like:

I’m not just using an app.
I’m making progress in my new city.

⸻
24.1 The Landing Plan

The key product wrapper should be a personalised Landing Plan.

When a user joins, Buzz gives them a personalised 30-day settling-in plan based on:

city
arrival status
personality quiz
interests
availability
social comfort level
budget
preferred suburbs
whether they know anyone yet


Example:

Your first 30 days in Melbourne

Week 1: Find your areas
- Explore Fitzroy or Brunswick
- Join one low-pressure coffee walk
- Activate one easy interest

Week 2: Try your first group activity
- Beginner climbing night
- Language exchange
- Sunday tennis hit-up

Week 3: Build repeat connection
- Rejoin someone you met
- Try a second activity
- Save 3 local spots

Week 4: Start feeling local
- Join a recurring group
- Bring a friend
- Attend a hosted starter plan


This should be the main way the quiz result is packaged.

Instead of:

Here are your matches.


Buzz should say:

Here is your first 30 days in Melbourne.

⸻
24.2 Why the Landing Plan Matters

The Landing Plan differentiates Buzz from competitors because it combines:

suburb recommendations
interest activation
small-group plans
starter activities
attendance progress
repeat connections
host pathway
city confidence


It turns Buzz into a guided relocation/social integration journey.

This helps:

onboarding clarity
retention
emotional relevance
B2B positioning
city rollout structure
monetisation through sponsored onboarding moments

⸻
24.3 Social Onboarding as the B2B Story

The strongest B2B story becomes:

Buzz provides social onboarding for people new to a city.

Potential payers:

universities
student accommodation providers
relocation companies
employers
serviced apartments
real estate groups
international student programs
coworking spaces
Airbnb / short-stay operators


They are not buying ads. They are buying a better settling-in experience for new arrivals.

Example B2B product:

Welcome-to-Melbourne Landing Plan
- best-fit suburbs
- beginner-friendly social plans
- hosted starter activities
- verified locals/hosts
- group formation around interests

⸻
24.4 Settling OS / City Progress Dashboard

The user should eventually have a private progress dashboard.

Possible names:

Your Melbourne Landing
Your Settling Plan
Your City Progress
Your First 30 Days


It can track:

suburbs explored
interests activated
plans joined
people met twice
groups formed
attendance streak
trusted member progress
host eligibility
city confidence


This should be framed as progress, not game points.

Example:

Your Melbourne Landing

✓ Completed your quiz
✓ Found your best-fit suburbs
✓ Activated climbing
✓ Joined your first plan
○ Attend your first activity
○ Meet someone again
○ Try a plan in a second suburb

⸻
24.5 The Second Meeting Mechanic

A unique differentiator is optimising for second interactions, not just first meetings.

Most social apps measure:

matches
messages
first meetups


Buzz should care about:

Did you see someone again?


After a plan, ask:

Would you do something with anyone from this group again?


If two users mutually say yes:

You and Mia both said you’d meet again.
Want to join another beginner tennis plan together?


This turns one-off activities into actual friendships.

Important metric:

repeat connection rate


This should become one of the core success metrics.
⸻
24.6 Social Confidence Mode

Users who move cities have different comfort levels.

Buzz should ask:

How do you want to start?


Options:

Low pressure
- small groups
- daytime activities
- no pre-chat required
- public places only

Open to anything
- groups or 1:1 later
- more spontaneous plans
- nightlife can be included

Structured only
- hosted activities
- verified venues
- beginner-friendly plans


This should influence:

matching defaults
activity recommendations
risk filters
visibility settings
starter plans
notification tone


For MVP, this can be a simple onboarding preference field.
⸻
24.7 Plan Recipes

Buzz should use reusable plan recipes to make social planning easier and city rollouts more repeatable.

Examples:

Coffee walk
Beginner class
Try-it-together session
First suburb explore
Casual hit-up
Sunday reset
After-work sampler
Bring-a-friend plan
Hosted starter plan


Each recipe can define:

ideal group size
risk level
venue type
duration
best time
safety defaults
suggested copy
business partner category
city applicability


This enables the app to generate consistent low-pressure plans across different interests and cities.

Example:

Recipe: Coffee walk
- group size: 3–5
- risk: low
- venue type: cafe + public walking route
- duration: 60–90 mins
- best time: weekend morning
- safety: public-only, no 1:1 default
- useful for: newcomers, low-pressure mode, suburb exploration

⸻
24.8 Sponsored Onboarding Moments

The Landing Plan creates a non-ad monetisation surface.

Example:

Your first 30 days in Melbourne, supported by local partners.


Partners can fund useful moments:

first gym trial
first coffee walk
first language exchange
first climbing night
first neighbourhood tour
first hosted activity


This is not banner advertising. It is sponsored onboarding infrastructure.

The product should avoid generic ad placement and instead show partner support only where it directly helps the user complete their Landing Plan.
⸻
24.9 Local Proof Instead of Reviews

Buzz should avoid becoming Yelp-style review content.

Instead, show newcomer-specific proof.

For activities:

42 new arrivals tried climbing in Collingwood this month
18 came back for a second session
12 joined with a friend


For suburbs:

Popular with new arrivals who like:
live music, coffee, running, casual social plans


This proof is more relevant than generic ratings.
⸻
24.10 Settled But Still Useful

The settled toggle should become more nuanced.

When users become settled, they can choose:

Go quiet
Become a local helper
Host occasionally
Only show me high-fit plans
Invite me for my favourite interests


This keeps high-quality users in the ecosystem without making them feel trapped.

It also creates the host/local supply layer organically.
⸻
25. Landing Plan Implementation Requirements

The Landing Plan should be added to the product and technical plan.

It does not need to be overbuilt in MVP, but the initial app should have enough structure to show a simple personalised plan after onboarding.
⸻
25.1 MVP Landing Plan Scope

MVP should include:

quiz completion
city context
suburb recommendations
selected interests
social comfort mode
basic Landing Plan generation
simple 30-day checklist UI
progress state


The Landing Plan can initially be deterministic and template-based.

Do not require AI.
⸻
25.2 Suggested Data Model

landing_plans

id
user_id
city_id
status
generated_at
starts_at
ends_at
version
created_at
updated_at


Statuses:

active
completed
paused
archived


landing_plan_items

id
landing_plan_id
item_type
title
description
target_id nullable
week_number
sort_order
status
completed_at
created_at
updated_at


Item types:

explore_suburb
activate_interest
join_plan
attend_activity
bring_friend
meet_again
save_place
join_group
complete_profile


Item statuses:

pending
active
completed
skipped
expired


plan_recipes

id
key
title
description
risk_level
default_group_size_min
default_group_size_max
default_duration_minutes
venue_type
safety_defaults_json
city_applicability_json
created_at
updated_at


user_social_preferences

user_id
social_comfort_mode
allow_nightlife
prefer_hosted_plans
prefer_no_chat_needed
prefer_daytime
prefer_small_groups
budget_preference
created_at
updated_at


repeat_connection_preferences

id
user_id
other_user_id
source_plan_id
would_meet_again
matched_mutual_interest
created_at

⸻
25.3 Landing Plan Generation Logic

Initial deterministic generation can use:

city config
quiz tags
top suburb matches
selected interests
social comfort mode
availability
feature flags


Example generation:

Week 1:
- Explore top suburb
- Activate easiest low-pressure interest
- Join one no-chat-needed group

Week 2:
- Try one beginner activity
- Join one group plan
- Confirm attendance

Week 3:
- Meet someone again
- Try a second suburb
- Bring a friend to one plan

Week 4:
- Join a recurring activity
- Complete settling check-in
- Decide whether to stay active or go settled


AI can later improve wording and recommendations, but should not be required for MVP.
⸻
25.4 Product UI

After quiz completion, show:

Your first 30 days in Melbourne


Sections:

Best-fit suburbs
Suggested first interests
This week’s recommended step
Your progress


Example:

Your first 30 days in Melbourne

Best-fit suburbs:
1. Fitzroy
2. Brunswick
3. South Yarra

Start here:
✓ Pick your interests
○ Activate one interest
○ Join one beginner-friendly plan
○ Attend your first group

⸻
25.5 Updated Core Loop

The updated product loop is:

I just moved to Melbourne.
I answer a quiz.
Buzz detects or asks for my city.
Buzz loads the Melbourne config.
Buzz gives me a Landing Plan.
Buzz tells me which suburbs I might enjoy.
I select interests I want to try.
I activate one.
Buzz finds compatible nearby people in the same city.
Buzz helps us form a small, public, low-pressure plan.
I can bring a friend if I want extra comfort.
We attend.
The app checks that everything felt safe.
Buzz asks if I would meet anyone again.
My reliability and settling progress grow.
Eventually reliable people can host.
Businesses can support useful starter plans.
Future cities can be launched through configuration.

⸻
25.6 Updated Success Metrics

Add the following metrics:

landing_plan_generated
landing_plan_viewed
landing_plan_item_completed
first_week_step_completed
suburb_exploration_completed
repeat_connection_prompt_shown
repeat_connection_positive
repeat_connection_mutual
social_comfort_mode_selected


Most important new metric:

repeat connection rate


This is more meaningful than match rate because it shows whether Buzz is helping real relationships form.
⸻
25.7 Updated Agent Guidance

AI agents should treat the Landing Plan as the main wrapper around MVP features.

Do not build Buzz as a set of disconnected modules:

quiz
suburbs
interests
matches
groups
chat


Instead, build them as steps in a coherent settling journey:

quiz
→ Landing Plan
→ suburb fit
→ interest activation
→ small plan
→ attendance
→ repeat connection
→ settled/host pathway


The Landing Plan should become the user-facing product spine.