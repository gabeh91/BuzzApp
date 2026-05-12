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
  authModal: {
    close: "Close sign-in",
    noticeEmailConfirmation:
      "Account created. Check your email, then sign in here when you are ready.",
    errors: {
      unableStartSignIn: "We could not start sign-in. Try again.",
      unableSendCode: "We could not send the code. Try again.",
      unableSignIn:
        "We could not sign you in. Check your details or try again.",
    },
    start: {
      continueWithApple: "Continue with Apple",
      continueWithGoogle: "Continue with Google",
      continueWithFacebook: "Continue with Facebook",
      dividerEmail: "Or use email",
      emailLabel: "Email",
      passwordLabel: "Password",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "Password",
      signingIn: "Signing in...",
      signInCta: "Sign in",
      createAccount: "Create account",
      creatingAccount: "Creating account...",
      sendEmailCode: "Email me a code",
      sendingEmailCode: "Sending code...",
      openingProvider: "Opening...",
    },
    intents: {
      save_profile: {
        eyebrow: "Account",
        title: "Sign in or create an account",
        body: "Already have an account? Sign in below. New here? Create one—your quiz and picks from this session can carry over once you are signed in.",
      },
      activate_interest: {
        eyebrow: "Activate",
        title: "Sign in or create an account",
        body: "Sign in or create an account to turn on this interest and join the list for a small plan near you.",
      },
      attend_activity: {
        eyebrow: "Join in",
        title: "Sign in or create an account",
        body: "Sign in or create an account to respond to plans and update your attendance.",
      },
      invite_friend: {
        eyebrow: "Invite",
        title: "Sign in or create an account",
        body: "Sign in or create an account to invite someone you trust to a group.",
      },
      chat: {
        eyebrow: "Say hi",
        title: "Sign in or create an account",
        body: "Sign in or create an account to send a hi and keep the conversation on your account.",
      },
      safety_action: {
        eyebrow: "Safety",
        title: "Sign in or create an account",
        body: "Sign in or create an account to report or block from your account.",
      },
      post_activity_feedback: {
        eyebrow: "Feedback",
        title: "Sign in or create an account",
        body: "Sign in or create an account to share how the plan went.",
      },
    },
    code: {
      eyebrow: "Check your email",
      title: "Enter your code",
      bodyWithEmail:
        "We sent a 6-digit code to {email:string}. Enter it below.",
      bodyMissingEmail: "Go back and enter your email so we can send a code.",
      fieldLabel: "Code",
      continue: "Continue",
      checking: "Checking...",
      sendNewCode: "Send a new code",
      differentEmail: "Use a different email",
      resendNotice: "We sent a new code.",
      errors: {
        codeInvalid: "That code did not work. Try again or request a new code.",
        resendFailed: "We could not resend the code. Try again.",
      },
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
    eyebrow: "Almost there",
    title: "Finish a few questions",
    body: "A short quiz helps us suggest suburbs, activities, and people that fit how you like to spend time—not a generic feed.",
    completeQuiz: "Complete quiz",
    notNow: "Not now",
  },
  profileQuizOverwritePrompt: {
    eyebrow: "Quiz answers",
    title: "Keep your previous quiz answers?",
    body: "This account already has saved quiz answers. Use the new answers from this device, or keep the answers already on your profile.",
    overwrite: "Use new answers",
    overwriting: "Saving new answers...",
    keepExisting: "Keep previous answers",
    keeping: "Keeping previous...",
    failed: "We could not update your quiz choice yet. Try again.",
  },
  profileQuiz: {
    eyebrow: "Your answers",
    title: "Pick up the quiz",
    body: "Answer the rest now, or close and return when you have a quiet moment.",
    saving: "Saving...",
    saved: "Quiz saved.",
    failed: "We could not save your quiz yet. Try again.",
    actions: {
      close: "Close",
      finish: "Finish quiz",
      next: "Next question",
    },
  },
  onboarding: {
    actions: {
      finishQuiz: "Finish quiz",
      nextQuestion: "Next question",
      useInterest: "Use this interest",
      activating: "Turning on...",
      signInToActivate: "Sign in to continue",
      signInExisting: "Already have an account? Sign in",
      activateInterest: "Say I'm in",
      browseBuzz: "Look around first",
      enterBuzz: "Go to home",
    },
    howItWorks: {
      itemOne: "Choose what you actually want to do.",
      itemTwo: "Say when you are open for a plan.",
      itemThree: "Meet in a small group around that activity.",
    },
    interests: {
      loading: "Finding interests for your city",
      error: "Using a starter list for now",
      ready: "Choose what feels doable this week",
    },
    activation: {
      eyebrow: "Ready when you are",
      chooseInterestFirst: "Choose an interest first",
      availability: {
        label: "When works",
        thisWeek: "This week",
        weekend: "Weekend",
        daytime: "Daytime",
      },
    },
    matchPreview: {
      empty:
        "Choose an interest you are open to and we will suggest a simple first plan.",
      eyebrow: "First plan",
      suggestedNextStep: "Suggested next step",
    },
    steps: {
      welcome: {
        eyebrow: "Welcome to Buzz",
        title: "A softer way to find your people in a new city.",
        body: "Buzz helps you find like-minded people to join you in the things you love to do.",
      },
      howItWorks: {
        eyebrow: "How it works",
        title:
          "Pick something you want to do, say when you are free, then meet around a plan.",
        body: "Think tennis, coffee, climbing, singing—whatever feels doable with the right people.",
      },
      quizIntro: {
        eyebrow: "A few questions",
        title: "So suggestions feel less random.",
        body: "We ask about energy, availability, how you plan, and what size group feels comfortable—nothing tricky.",
      },
      quiz: {
        eyebrow: "Your style",
        title: "Answer as you are, not as you think you should be.",
        body: "Honest answers help us line up people and plans that fit how you actually like to spend time.",
      },
      interests: {
        eyebrow: "Interests",
        title: "Choose what you would genuinely do this week.",
        body: "Start with something you would actually say yes to if the right people and plan appeared.",
      },
      activation: {
        eyebrow: "Say you are in",
        title: "Pick one thing you are open to doing soon.",
        body: "This tells people you are up for a real plan—not just browsing.",
      },
      matchPreview: {
        eyebrow: "First match",
        title: "Here is a practical next step.",
        body: "We will show who it suits, why it could work, and a simple way to get started.",
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
    titleReady: "You are set to keep exploring.",
    activatedBody: "Here are practical next steps around this interest.",
    readyBody:
      "Finish your first steps to see a suggested plan tailored to you.",
    browsingBody:
      "Look around for now. Sign in when you want to join or say you are in for a plan.",
    suggestedNextStep: "Suggested next step",
    emptyPlan: "No suggested plan yet.",
    inactiveInterestTitle: "Keep browsing around {interest:string}.",
    waitingForCandidateTitle: "Explore your best-fit suburbs",
    waitingForCandidateBody:
      "Keep {interest:string} on while we look for people who fit your pace and timing.",
    reviewOnboarding: "Finish first steps",
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
      fallbackReason: "Suggested from your city and lifestyle answers.",
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
      title: "What you are open to",
      active: "{interest:string} is on.",
      selected: "{interest:string} is lined up when you are ready.",
      empty: "Choose something you would genuinely do this week.",
      bodyActive: "You are open to a practical plan around this interest.",
      bodySelected:
        "Turn it on when you want us to look for a small plan with the right people.",
      bodyEmpty: "Start with something that feels easy to say yes to.",
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
    subtitle: "Connection requests and group chats live in one place.",
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
    subtitle: "Your local rhythm, interests, and availability in one place.",
    auth: {
      title: "Sign in or create an account",
      body: "Save your quiz and interests to your account, send requests, and join plans. Already registered? Sign in below.",
      signIn: "Sign in to save",
      biometricTitle: "Unlock with biometrics",
      biometricBody:
        "Use your device unlock after sign-in to reopen Buzz with your saved session.",
      enableBiometric: "Enable biometric unlock",
      biometricSaving: "Enabling...",
      biometricFailed: "Biometric unlock is not available on this device yet.",
      signOutTitle: "Account",
      signOutBody: "Sign out on this device when you are finished.",
      signOut: "Log out",
      signingOut: "Logging out...",
      signOutFailed: "We could not log you out yet. Try again in a moment.",
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
      fallbackReason: "Suggested from your city and lifestyle answers.",
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
    formingStatus: "Getting the group together",
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
      title: "The plan",
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
      joinBody: "Open the app to review the invite before you join.",
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
      initial: "Pick one interest you are open to doing soon.",
      selected: "{interest:string} is lined up when you are.",
      activating: "Turning this on...",
      complete:
        "{interest:string} is on. Your next suggestion can start from this.",
      chooseBeforeActivating: "Choose an interest first.",
      failed: "We could not activate that interest yet. Try again in a moment.",
    },
  },
  quiz: {
    summary:
      "You lean toward {socialStyle:string}, {energy:string} plans, and {activityIntent:string} activities.",
    traitLabels: {
      energy: {
        low: "lower-pressure",
        medium: "balanced pace",
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
        learn: "learning together",
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
