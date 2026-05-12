import type { BaseTranslation } from "typesafe-i18n";

const en = {
  brand: {
    name: "Buzz",
  },
  common: {
    back: "Back",
    continue: "Continue",
    progress: {
      step: "Step {current:number} of {total:number}",
      question: "Question {current:number} of {total:number}",
    },
  },
  navigation: {
    tabs: {
      discover: "Discover",
      discoverAccessibility: "Discover people and activities",
      activities: "Activities",
      activitiesAccessibility: "Activities and plans",
      chats: "Chats",
      chatsAccessibility: "Chats and requests",
      profile: "Profile",
      profileAccessibility: "Profile and progress",
    },
  },
  quizCompletionPrompt: {
    eyebrow: "Profile step",
    title: "Complete your quiz",
    body: "You can join through an invite now. Complete the quiz to keep suburb fit, activity ideas, and future matches personal to you.",
    completeQuiz: "Complete quiz",
    notNow: "Not now",
  },
  onboarding: {
    actions: {
      finishQuiz: "Finish quiz",
      nextQuestion: "Next question",
      useInterest: "Use this interest",
      activating: "Activating...",
      signInToActivate: "Sign in to activate",
      activateInterest: "Activate interest",
      browseBuzz: "Browse Buzz for now",
      enterBuzz: "Enter Buzz",
    },
    profile: {
      metaLabel: "Your starting point",
      meta: "{city:string} - Ready to meet around real plans",
      body: "Add your city, pace, and interests so first suggestions feel useful.",
    },
    howItWorks: {
      itemOne: "Choose what you actually want to do.",
      itemTwo: "Activate when you are open to a plan.",
      itemThree: "Match into a small activity group.",
    },
    interests: {
      loading: "Finding interests for your city",
      error: "Showing starter interests for now",
      ready: "Choose what feels doable this week",
    },
    activation: {
      eyebrow: "Ready signal",
      chooseInterestFirst: "Choose an interest first",
      availability: {
        label: "When works",
        thisWeek: "This week",
        weekend: "Weekend",
        daytime: "Daytime",
      },
    },
    matchPreview: {
      empty: "Activate an interest to preview your first suggested plan.",
      eyebrow: "First plan",
      suggestedNextStep: "Suggested next step",
    },
    steps: {
      welcome: {
        eyebrow: "Welcome to Buzz",
        title: "A softer way to find your people in a new city.",
        body: "Start with what you actually want to do, then turn one interest into an easy reason to meet.",
      },
      intent: {
        eyebrow: "Your intent",
        title: "Tell us why you are here.",
        body: "New to town, returning after time away, or just widening your circle. The activity comes first.",
      },
      howItWorks: {
        eyebrow: "How it works",
        title: "Pick interests, activate one, then meet around a plan.",
        body: "Match around shared momentum: tennis, coffee, climbing, singing, or whatever feels right.",
      },
      profile: {
        eyebrow: "Profile basics",
        title: "Create a lightweight local profile.",
        body: "Add just enough context for suggestions around where you are and how you like to spend time.",
      },
      quizIntro: {
        eyebrow: "Discovery quiz",
        title: "A few quick questions so matches feel less random.",
        body: "The quiz captures practical signals like energy, availability, planning style, and group comfort.",
      },
      quiz: {
        eyebrow: "Quiz",
        title: "Answer as you are, not as you think you should be.",
        body: "Your answers capture your energy, planning style, availability, and group comfort.",
      },
      interests: {
        eyebrow: "Interests",
        title: "Choose what you would genuinely do this week.",
        body: "Start with something you would actually say yes to if the right people and plan appeared.",
      },
      activation: {
        eyebrow: "Activation",
        title: "Activate one interest when you are open to doing it.",
        body: "Activating says you are ready for a plan, not just browsing.",
      },
      matchPreview: {
        eyebrow: "First match",
        title: "Your first next step stays practical.",
        body: "Your first preview keeps the next step practical: who it suits, why it fits, and what to do next.",
      },
    },
  },
  home: {
    people: {
      eyebrow: "Discover",
      title: "Your matches in {city:string}",
      body: "People with shared interests and a compatible pace.",
      loading: "Finding people for you",
      emptyTitle: "No people to show yet",
      emptyBody:
        "Choose an interest or complete your quiz to sharpen your matches.",
      error: "We could not load people right now. Pull down to try again.",
      sayHi: "Say hi",
      sending: "Sending...",
      sent: "Request sent",
      failed: "We could not send that yet. Try again in a moment.",
    },
    firstPlan: "First plan",
    titleActivated: "You activated {interest:string}.",
    titleReady: "Your Buzz profile is ready.",
    activatedBody:
      "You can now see practical next steps around this interest.",
    readyBody: "Complete onboarding to unlock your first suggested plan.",
    browsingBody:
      "Browse activities now and sign in when you are ready to join or activate a plan.",
    suggestedNextStep: "Suggested next step",
    emptyPlan: "No suggested plan yet.",
    inactiveInterestTitle: "Keep browsing around {interest:string}.",
    waitingForCandidateTitle: "Explore your best-fit suburbs",
    waitingForCandidateBody:
      "Keep {interest:string} active while Buzz looks for a real compatible plan.",
    reviewOnboarding: "Review onboarding",
    fallbackInterest: "your next interest",
    acceptPlan: "Accept plan",
    declinePlan: "Pass for now",
    acceptingPlan: "Accepting...",
    declinedPlan: "Plan passed for now.",
    matchActionFailed:
      "We could not update that plan yet. Try again in a moment.",
    landingPlan: {
      eyebrow: "Landing plan",
      first30Days: "Your first 30 days in {city:string}",
      next: "Next",
      done: "Done",
      pending: "Soon",
    },
    suburbFit: {
      title: "Best-fit suburbs",
      body: "Top areas to explore from your city and lifestyle answers.",
      fallbackReason: "Recommended city fit based on your onboarding profile.",
    },
    settlingProgress: {
      eyebrow: "Progress",
      title: "{percent:number}% settled",
      complete: "Your first loop is complete.",
      nextStep: "Next: {step:string}",
    },
  },
  peopleConnect: {
    eyebrow: "Say hi",
    profileLabel: "Match",
    fallbackName: "this person",
    title: "Send {name:string} a hi",
    body: "Choose a simple intro before sending a request.",
    justHi: {
      title: "Just say hi",
      body: "Send a low-pressure connection request.",
    },
    activity: {
      title: "Suggest an activity",
      body: "Pick one shared interest as an easy starting point.",
    },
    noSharedInterests: "Shared interests will appear here when available.",
    sharedInterestTitle: "Shared interest",
    messageTitle: "Optional note",
    messagePlaceholder: "Add a short note",
    defaultActivityMessage:
      "Would you be keen to do {interest:string} sometime?",
    send: "Send hi",
    sending: "Sending...",
    sentToast: "Hi sent to {name:string}.",
    failed: "We could not send that yet. Try again in a moment.",
  },
  activities: {
    eyebrow: "Activities",
    title: "Your activities",
    subtitle: "Keep track of interests you are open to and plans taking shape.",
    currentSignal: {
      title: "Current signal",
      active: "{interest:string} is active.",
      selected: "{interest:string} is ready when you are.",
      empty: "Choose an interest you would genuinely do this week.",
      bodyActive:
        "You are available for a practical plan around this interest.",
      bodySelected:
        "Activate when you are ready for Buzz to look for a real plan.",
      bodyEmpty:
        "Start with something that feels easy to say yes to.",
    },
    plans: {
      title: "Plans",
      active: "{plan:string}",
      empty: "Accepted plans and group activity updates will appear here.",
    },
  },
  chats: {
    eyebrow: "Chats",
    title: "Messages",
    subtitle: "Requests and group chats stay together here.",
    requests: {
      title: "Requests",
      empty: "Connection requests will appear here when someone says hi.",
    },
    groups: {
      title: "Group chats",
      empty: "Group chats will appear after a plan starts.",
    },
  },
  profile: {
    title: "Your profile",
    subtitle: "Keep your local plan and matching availability in one place.",
    auth: {
      title: "Save your profile",
      body: "Sign in to keep your quiz answers, selected interests, and matching availability attached to your account.",
      signIn: "Sign in to save",
      biometricTitle: "Unlock with biometrics",
      biometricBody:
        "Use your device unlock after sign-in to reopen Buzz with your saved session.",
      enableBiometric: "Enable biometric unlock",
      biometricSaving: "Enabling...",
      biometricFailed: "Biometric unlock is not available on this device yet.",
    },
    cityStartingPoint: {
      eyebrow: "Starting point",
      title: "Your {city:string} starting point",
      body: "Start with nearby areas, a few easy interests, and one practical next action.",
      areasTitle: "Areas you may enjoy exploring",
      interestsTitle: "Best interests to activate first",
      firstActionTitle: "Suggested first action",
      actionPickInterest:
        "Pick one interest you would genuinely show up for this week.",
      actionActivateSelected:
        "Activate {interest:string} when you are ready to form a small plan.",
      actionAfterActivation:
        "Keep your active interest warm while a practical group plan takes shape.",
    },
    landingPlan: {
      eyebrow: "Landing plan",
      first30Days: "Your first 30 days in {city:string}",
      next: "Next",
      done: "Done",
      pending: "Soon",
    },
    suburbFit: {
      title: "Best-fit suburbs",
      body: "Top areas to explore from your city and lifestyle answers.",
      fallbackReason: "Recommended city fit based on your onboarding profile.",
    },
    settlingProgress: {
      eyebrow: "Progress",
      title: "{percent:number}% settled",
      complete: "Your first loop is complete.",
      nextStep: "Next: {step:string}",
    },
    settled: {
      title: "Matching availability",
      body: "Pause new matching when you feel settled or are not looking for new plans.",
      markSettled: "Pause new matches",
      markAvailable: "Find new activities",
      active: "Available for new activities.",
      paused: "New matching paused.",
      saving: "Saving...",
      failed:
        "We could not update your availability yet. Try again in a moment.",
    },
  },
  groups: {
    eyebrow: "Activity group",
    title: "{interest:string} group",
    formingStatus: "Forming",
    formingBody: "A small plan is taking shape around this activity.",
    matchedWith: "Matched with {name:string}",
    suggestedPlan: "Suggested plan",
    nextStep: "Next step",
    nextStepBody:
      "Choose a simple time, place, and first step that feels easy to say yes to.",
    emptyMatch:
      "Your first group will appear after you accept a suggested plan.",
    backHome: "Back home",
    planCard: {
      title: "Plan card",
      timing: "Timing: {timing:string}",
      location: "Location: {location:string}",
      capacity: "Capacity: {min:number}-{max:number}",
      confirm: "Confirm",
      requestChanges: "Request changes",
      pending: "Waiting for group confirmation.",
      confirmed: "Plan confirmed.",
      needsChanges: "Changes requested before confirming.",
    },
    invites: {
      bringFriend: "Bring a friend",
      body: "Create a one-use group invite for someone you already trust.",
      create: "Create invite",
      creating: "Creating invite...",
      ready: "Invite link ready",
      shared: "Invite ready to share.",
      failed: "We could not create that invite yet. Try again in a moment.",
      joinTitle: "Join this Buzz group",
      joinBody: "Open Buzz to review the group invite before joining.",
      missingToken: "This invite link is missing a token.",
      resolving: "Checking invite...",
      resolveFailed: "This invite could not be opened.",
      accept: "Join group",
      accepting: "Joining...",
      accepted: "Invite accepted.",
      acceptFailed: "We could not join that group yet.",
    },
    attendance: {
      title: "Attendance",
      body: "Confirm what happened after the plan so future matches stay reliable.",
      confirmAttendance: "Confirm attendance",
      attendanceConfirmed: "Attendance confirmed.",
      attendanceFailed:
        "We could not confirm attendance yet. Try again in a moment.",
      postPlanSafety: "Post-plan safety check",
      feedbackFailed:
        "We could not save that check yet. Try again in a moment.",
      safetyCompleted: "Post-plan check completed.",
      reportIssue: "Report issue",
      issueReported: "Issue reported.",
    },
    safety: {
      title: "Safety",
      locationHidden:
        "Exact location stays hidden until a confirmed public plan is ready.",
      locationVisible: "Exact location is visible for this confirmed plan.",
      report: "Report",
      block: "Block",
      leave: "Leave group",
      reportReady: "Report draft ready for review.",
      reportSubmitted: "Report submitted.",
      reportFailed:
        "We could not submit that report yet. Try again in a moment.",
      reportUnavailable: "Add a reason before a report can be submitted.",
      blockReady: "{name:string} can be blocked before more matching.",
      blockSaved: "{name:string} will no longer be matched with you.",
      blockFailed: "We could not block that member yet. Try again in a moment.",
      blockUnavailable:
        "Block becomes available when a matched member is attached.",
      leaveReady: "You can leave this group before the plan is confirmed.",
      leaveConfirmed: "You have left this group.",
      leaveFailed: "We could not leave that group yet. Try again in a moment.",
    },
  },
  chat: {
    empty: "No messages yet.",
    composerPlaceholder: "Message the group",
    send: "Send",
    sending: "Sending",
    blocked: "Keep it respectful so the plan stays easy to join.",
  },
  interests: {
    activation: {
      initial: "Pick one interest to activate when you are open to doing it.",
      selected: "{interest:string} is ready when you are.",
      activating: "Activating your interest...",
      complete:
        "{interest:string} is active. Your next suggestion can start from this.",
      chooseBeforeActivating: "Choose an interest before activating.",
      failed: "We could not activate that interest yet. Try again in a moment.",
    },
  },
  quiz: {
    summary:
      "You seem best matched to {socialStyle:string}, {energy:string} plans, and {activityIntent:string} activities.",
    traitLabels: {
      energy: {
        low: "lower-pressure",
        medium: "balanced-energy",
        high: "high-momentum",
      },
      planning: {
        spontaneous: "spontaneous",
        balanced: "lightly planned",
        planned: "planned",
      },
      socialStyle: {
        oneOnOne: "one-on-one",
        smallGroup: "small groups",
        largeGroup: "bigger groups",
      },
      availability: {
        weekday: "weekday",
        weekend: "weekend",
        mixed: "mixed",
      },
      activityIntent: {
        learn: "learning-led",
        practice: "routine-building",
        social: "social",
      },
    },
    questions: {
      energyAfterWork: {
        prompt: "After work, what usually feels most realistic?",
        options: {
          quietReset: {
            label: "A quiet reset",
            supportingText: "Low-pressure plans land best.",
          },
          easyOuting: {
            label: "An easy outing",
            supportingText: "You like something social but contained.",
          },
          properPlan: {
            label: "A proper plan",
            supportingText: "If it is worthwhile, you are in.",
          },
        },
      },
      weekendRhythm: {
        prompt: "Your ideal weekend rhythm is closest to...",
        options: {
          slowStart: {
            label: "Slow start, one good thing",
            supportingText: "A single intentional plan works.",
          },
          looseList: {
            label: "A loose list",
            supportingText: "You like options without pressure.",
          },
          fullCalendar: {
            label: "A full calendar",
            supportingText: "You are happy stacking plans.",
          },
        },
      },
      planningStyle: {
        prompt: "How far ahead do you prefer to lock plans in?",
        options: {
          sameDay: {
            label: "Same day is fine",
            supportingText: "Spontaneous plans feel natural.",
          },
          fewDays: {
            label: "A few days ahead",
            supportingText: "A little structure helps.",
          },
          weekPlus: {
            label: "A week or more",
            supportingText: "You like clear plans.",
          },
        },
      },
      newCityNeed: {
        prompt: "What would help you feel more settled?",
        options: {
          regularPlaces: {
            label: "Regular places",
            supportingText: "You want familiar local anchors.",
          },
          newSkills: {
            label: "New skills",
            supportingText: "Learning gives you momentum.",
          },
          activeRoutine: {
            label: "An active routine",
            supportingText: "You want repeatable activities.",
          },
        },
      },
      firstMeetFormat: {
        prompt: "For a first meet-up, you would rather...",
        options: {
          onePerson: {
            label: "Meet one person",
            supportingText: "Focused and easy to read.",
          },
          smallCrew: {
            label: "Join a small crew",
            supportingText: "Enough energy without overwhelm.",
          },
          biggerGroup: {
            label: "Go where there is a crowd",
            supportingText: "More people feels easier.",
          },
        },
      },
      conversationStyle: {
        prompt: "Good conversation usually happens when...",
        options: {
          deepChat: {
            label: "There is time to go deeper",
            supportingText: "One-on-one plans fit.",
          },
          sharedTask: {
            label: "You are doing something together",
            supportingText: "Activity-led groups fit.",
          },
          lightEnergy: {
            label: "The room has momentum",
            supportingText: "Bigger group energy helps.",
          },
        },
      },
      groupComfort: {
        prompt: "Walking into a new group, you prefer...",
        options: {
          knownPerson: {
            label: "Knowing one person first",
            supportingText: "A smaller bridge matters.",
          },
          clearPlan: {
            label: "A clear plan or activity",
            supportingText: "Structure makes groups easier.",
          },
          openRoom: {
            label: "An open room with options",
            supportingText: "You can find your own rhythm.",
          },
        },
      },
      socialFrequency: {
        prompt: "Right now, you want social plans...",
        options: {
          occasionally: {
            label: "Occasionally",
            supportingText: "Quality over frequency.",
          },
          weekly: {
            label: "Weekly",
            supportingText: "A steady cadence sounds good.",
          },
          often: {
            label: "Often",
            supportingText: "You want momentum quickly.",
          },
        },
      },
      weekdayAvailability: {
        prompt: "Weekdays are usually...",
        options: {
          notIdeal: {
            label: "Not ideal",
            supportingText: "Weekends will be stronger.",
          },
          someEvenings: {
            label: "Some evenings work",
            supportingText: "Mixed availability fits.",
          },
          veryFlexible: {
            label: "Pretty flexible",
            supportingText: "Weekday plans are realistic.",
          },
        },
      },
      weekendAvailability: {
        prompt: "Weekends are usually...",
        options: {
          protected: {
            label: "Protected downtime",
            supportingText: "Lower-pressure plans matter.",
          },
          partlyOpen: {
            label: "Partly open",
            supportingText: "One good plan works.",
          },
          bestTime: {
            label: "The best time to meet",
            supportingText: "Weekend activities fit.",
          },
        },
      },
      scheduleReliability: {
        prompt: "When you say yes to a plan...",
        options: {
          needFlex: {
            label: "I need flexibility",
            supportingText: "Loose plans are safer.",
          },
          usuallyGood: {
            label: "I am usually good",
            supportingText: "Balanced planning fits.",
          },
          lockedIn: {
            label: "It is locked in",
            supportingText: "Planned groups fit.",
          },
        },
      },
      travelRadius: {
        prompt: "How far would you travel for the right activity?",
        options: {
          nearby: {
            label: "Nearby only",
            supportingText: "Local matches matter most.",
          },
          acrossTown: {
            label: "Across town sometimes",
            supportingText: "You will travel for fit.",
          },
          whereverGood: {
            label: "Wherever it is good",
            supportingText: "Strong intent opens options.",
          },
        },
      },
      activityLearning: {
        prompt: "Trying something new feels...",
        options: {
          gentle: {
            label: "Good if it is gentle",
            supportingText: "Beginner-friendly matters.",
          },
          exciting: {
            label: "Exciting with the right people",
            supportingText: "Learning socially fits.",
          },
          veryMe: {
            label: "Very me",
            supportingText: "You like active discovery.",
          },
        },
      },
      activityRepeat: {
        prompt: "If an activity clicks, you would...",
        options: {
          keepCasual: {
            label: "Keep it casual",
            supportingText: "No pressure to make it a routine.",
          },
          doAgain: {
            label: "Do it again soon",
            supportingText: "Repeat plans could work.",
          },
          buildRoutine: {
            label: "Build a routine",
            supportingText: "Consistency motivates you.",
          },
        },
      },
      activityVibe: {
        prompt: "The best activity vibe is...",
        options: {
          calm: {
            label: "Calm and easy",
            supportingText: "Low-pressure is key.",
          },
          warm: {
            label: "Warm and social",
            supportingText: "Connection matters.",
          },
          energetic: {
            label: "Energetic and memorable",
            supportingText: "Momentum matters.",
          },
        },
      },
      skillLevel: {
        prompt: "Joining around a skill, you prefer...",
        options: {
          beginner: {
            label: "Beginner-friendly",
            supportingText: "Learning with others helps.",
          },
          mixed: {
            label: "Mixed levels",
            supportingText: "Social fit matters more.",
          },
          focused: {
            label: "A focused session",
            supportingText: "Practice matters.",
          },
        },
      },
      foodCoffee: {
        prompt: "Food or coffee plans feel like...",
        options: {
          safeFirst: {
            label: "A safe first step",
            supportingText: "Easy one-on-one plans fit.",
          },
          groupAnchor: {
            label: "A good group anchor",
            supportingText: "Small group intros fit.",
          },
          backup: {
            label: "A backup option",
            supportingText: "More active plans may fit better.",
          },
        },
      },
      outdoorIndoor: {
        prompt: "You are more drawn to...",
        options: {
          indoor: {
            label: "Indoor and cosy",
            supportingText: "Low-friction plans fit.",
          },
          either: {
            label: "Either, with good people",
            supportingText: "Social fit leads.",
          },
          outdoor: {
            label: "Outdoor and active",
            supportingText: "Higher-energy plans fit.",
          },
        },
      },
      followThrough: {
        prompt: "After a good first activity, you would like...",
        options: {
          leaveOpen: {
            label: "Leave it open",
            supportingText: "No forced continuity.",
          },
          suggestNext: {
            label: "Suggest a next one",
            supportingText: "A natural follow-up helps.",
          },
          makeRegular: {
            label: "Make it regular",
            supportingText: "A routine could stick.",
          },
        },
      },
      buzzOutcome: {
        prompt: "If Buzz works for you, it will help you...",
        options: {
          feelAtHome: {
            label: "Feel more at home",
            supportingText: "Belonging is the goal.",
          },
          tryThings: {
            label: "Try things I have been putting off",
            supportingText: "Discovery is the goal.",
          },
          buildRhythm: {
            label: "Build a rhythm in the city",
            supportingText: "Routine is the goal.",
          },
        },
      },
    },
  },
} as const satisfies BaseTranslation;

export default en;
