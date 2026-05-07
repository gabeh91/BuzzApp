import type { BaseTranslation } from "typesafe-i18n";

const en = {
  brand: {
    name: "Buzz"
  },
  common: {
    back: "Back",
    continue: "Continue",
    progress: {
      step: "Step {current:number} of {total:number}",
      question: "Question {current:number} of {total:number}"
    }
  },
  onboarding: {
    actions: {
      finishQuiz: "Finish quiz",
      nextQuestion: "Next question",
      useInterest: "Use this interest",
      activating: "Activating...",
      activateInterest: "Activate interest",
      enterBuzz: "Enter Buzz"
    },
    profile: {
      metaLabel: "Your starting point",
      meta: "{city:string} - Ready to meet around real plans",
      body: "A lightweight profile helps Buzz shape suggestions around your city, pace, and interests."
    },
    howItWorks: {
      itemOne: "Choose what you actually want to do.",
      itemTwo: "Activate when you are open to a plan.",
      itemThree: "Match into a small activity group."
    },
    interests: {
      loading: "Finding interests for your city",
      error: "Showing starter interests for now",
      ready: "Choose what feels doable this week"
    },
    activation: {
      eyebrow: "Ready signal",
      chooseInterestFirst: "Choose an interest first"
    },
    matchPreview: {
      empty: "Activate an interest to preview your first suggested plan.",
      eyebrow: "First plan",
      suggestedNextStep: "Suggested next step"
    },
    steps: {
      welcome: {
        eyebrow: "Welcome to Buzz",
        title: "A softer way to find your people in a new city.",
        body: "Start with what you actually want to do. Buzz turns interests into low-pressure reasons to meet."
      },
      intent: {
        eyebrow: "Your intent",
        title: "Tell Buzz why you are here.",
        body: "New to town, returning after time away, or just widening your circle. The activity comes first."
      },
      howItWorks: {
        eyebrow: "How it works",
        title: "Pick interests, activate one, then meet around a plan.",
        body: "Buzz avoids cold friend-swiping. You match around shared momentum: tennis, coffee, climbing, singing, or whatever feels right."
      },
      profile: {
        eyebrow: "Profile basics",
        title: "Create a lightweight local profile.",
        body: "Add just enough context for Buzz to shape your first suggestions around where you are and how you like to spend time."
      },
      quizIntro: {
        eyebrow: "Discovery quiz",
        title: "A few quick questions so matches feel less random.",
        body: "The quiz captures practical signals like energy, availability, planning style, and group comfort."
      },
      quiz: {
        eyebrow: "Quiz",
        title: "Answer as you are, not as you think you should be.",
        body: "Your answers help Buzz understand your energy, planning style, availability, and group comfort."
      },
      interests: {
        eyebrow: "Interests",
        title: "Choose what you would genuinely do this week.",
        body: "Start with something you would actually say yes to if the right people and plan appeared."
      },
      activation: {
        eyebrow: "Activation",
        title: "Activate one interest when you are open to doing it.",
        body: "Activation is the core behaviour: a clear signal that you are ready for a plan, not just browsing."
      },
      matchPreview: {
        eyebrow: "First match",
        title: "Buzz forms a practical next step.",
        body: "Your first preview keeps the next step practical: who it suits, why it fits, and what to do next."
      }
    }
  },
  home: {
    firstPlan: "First plan",
    titleActivated: "You activated {interest:string}.",
    titleReady: "Your Buzz profile is ready.",
    activatedBody: "Buzz has enough context to start shaping low-pressure plans around this interest.",
    readyBody: "Complete onboarding to unlock your first suggested plan.",
    suggestedNextStep: "Suggested next step",
    emptyPlan: "No suggested plan yet.",
    reviewOnboarding: "Review onboarding",
    fallbackInterest: "your next interest"
  },
  interests: {
    activation: {
      initial: "Pick one interest to activate when you are open to doing it.",
      selected: "{interest:string} is ready when you are.",
      activating: "Activating your interest...",
      complete: "{interest:string} is active. Buzz will use it to shape your next suggestion.",
      chooseBeforeActivating: "Choose an interest before activating."
    }
  },
  quiz: {
    summary: "You seem best matched to {socialStyle:string}, {energy:string} plans, and {activityIntent:string} activities.",
    traitLabels: {
      energy: {
        low: "lower-pressure",
        medium: "balanced-energy",
        high: "high-momentum"
      },
      planning: {
        spontaneous: "spontaneous",
        balanced: "lightly planned",
        planned: "planned"
      },
      socialStyle: {
        oneOnOne: "one-on-one",
        smallGroup: "small groups",
        largeGroup: "bigger groups"
      },
      availability: {
        weekday: "weekday",
        weekend: "weekend",
        mixed: "mixed"
      },
      activityIntent: {
        learn: "learning-led",
        practice: "routine-building",
        social: "social"
      }
    },
    questions: {
      energyAfterWork: {
        prompt: "After work, what usually feels most realistic?",
        options: {
          quietReset: {
            label: "A quiet reset",
            supportingText: "Low-pressure plans land best."
          },
          easyOuting: {
            label: "An easy outing",
            supportingText: "You like something social but contained."
          },
          properPlan: {
            label: "A proper plan",
            supportingText: "If it is worthwhile, you are in."
          }
        }
      },
      weekendRhythm: {
        prompt: "Your ideal weekend rhythm is closest to...",
        options: {
          slowStart: {
            label: "Slow start, one good thing",
            supportingText: "A single intentional plan works."
          },
          looseList: {
            label: "A loose list",
            supportingText: "You like options without pressure."
          },
          fullCalendar: {
            label: "A full calendar",
            supportingText: "You are happy stacking plans."
          }
        }
      },
      planningStyle: {
        prompt: "How far ahead do you prefer to lock plans in?",
        options: {
          sameDay: {
            label: "Same day is fine",
            supportingText: "Spontaneous plans feel natural."
          },
          fewDays: {
            label: "A few days ahead",
            supportingText: "A little structure helps."
          },
          weekPlus: {
            label: "A week or more",
            supportingText: "You like clear plans."
          }
        }
      },
      newCityNeed: {
        prompt: "What would help you feel more settled?",
        options: {
          regularPlaces: {
            label: "Regular places",
            supportingText: "You want familiar local anchors."
          },
          newSkills: {
            label: "New skills",
            supportingText: "Learning gives you momentum."
          },
          activeRoutine: {
            label: "An active routine",
            supportingText: "You want repeatable activities."
          }
        }
      },
      firstMeetFormat: {
        prompt: "For a first meet-up, you would rather...",
        options: {
          onePerson: {
            label: "Meet one person",
            supportingText: "Focused and easy to read."
          },
          smallCrew: {
            label: "Join a small crew",
            supportingText: "Enough energy without overwhelm."
          },
          biggerGroup: {
            label: "Go where there is a crowd",
            supportingText: "More people feels easier."
          }
        }
      },
      conversationStyle: {
        prompt: "Good conversation usually happens when...",
        options: {
          deepChat: {
            label: "There is time to go deeper",
            supportingText: "One-on-one plans fit."
          },
          sharedTask: {
            label: "You are doing something together",
            supportingText: "Activity-led groups fit."
          },
          lightEnergy: {
            label: "The room has momentum",
            supportingText: "Bigger group energy helps."
          }
        }
      },
      groupComfort: {
        prompt: "Walking into a new group, you prefer...",
        options: {
          knownPerson: {
            label: "Knowing one person first",
            supportingText: "A smaller bridge matters."
          },
          clearPlan: {
            label: "A clear plan or activity",
            supportingText: "Structure makes groups easier."
          },
          openRoom: {
            label: "An open room with options",
            supportingText: "You can find your own rhythm."
          }
        }
      },
      socialFrequency: {
        prompt: "Right now, you want social plans...",
        options: {
          occasionally: {
            label: "Occasionally",
            supportingText: "Quality over frequency."
          },
          weekly: {
            label: "Weekly",
            supportingText: "A steady cadence sounds good."
          },
          often: {
            label: "Often",
            supportingText: "You want momentum quickly."
          }
        }
      },
      weekdayAvailability: {
        prompt: "Weekdays are usually...",
        options: {
          notIdeal: {
            label: "Not ideal",
            supportingText: "Weekends will be stronger."
          },
          someEvenings: {
            label: "Some evenings work",
            supportingText: "Mixed availability fits."
          },
          veryFlexible: {
            label: "Pretty flexible",
            supportingText: "Weekday plans are realistic."
          }
        }
      },
      weekendAvailability: {
        prompt: "Weekends are usually...",
        options: {
          protected: {
            label: "Protected downtime",
            supportingText: "Lower-pressure plans matter."
          },
          partlyOpen: {
            label: "Partly open",
            supportingText: "One good plan works."
          },
          bestTime: {
            label: "The best time to meet",
            supportingText: "Weekend activities fit."
          }
        }
      },
      scheduleReliability: {
        prompt: "When you say yes to a plan...",
        options: {
          needFlex: {
            label: "I need flexibility",
            supportingText: "Loose plans are safer."
          },
          usuallyGood: {
            label: "I am usually good",
            supportingText: "Balanced planning fits."
          },
          lockedIn: {
            label: "It is locked in",
            supportingText: "Planned groups fit."
          }
        }
      },
      travelRadius: {
        prompt: "How far would you travel for the right activity?",
        options: {
          nearby: {
            label: "Nearby only",
            supportingText: "Local matches matter most."
          },
          acrossTown: {
            label: "Across town sometimes",
            supportingText: "You will travel for fit."
          },
          whereverGood: {
            label: "Wherever it is good",
            supportingText: "Strong intent opens options."
          }
        }
      },
      activityLearning: {
        prompt: "Trying something new feels...",
        options: {
          gentle: {
            label: "Good if it is gentle",
            supportingText: "Beginner-friendly matters."
          },
          exciting: {
            label: "Exciting with the right people",
            supportingText: "Learning socially fits."
          },
          veryMe: {
            label: "Very me",
            supportingText: "You like active discovery."
          }
        }
      },
      activityRepeat: {
        prompt: "If an activity clicks, you would...",
        options: {
          keepCasual: {
            label: "Keep it casual",
            supportingText: "No pressure to make it a routine."
          },
          doAgain: {
            label: "Do it again soon",
            supportingText: "Repeat plans could work."
          },
          buildRoutine: {
            label: "Build a routine",
            supportingText: "Consistency motivates you."
          }
        }
      },
      activityVibe: {
        prompt: "The best activity vibe is...",
        options: {
          calm: {
            label: "Calm and easy",
            supportingText: "Low-pressure is key."
          },
          warm: {
            label: "Warm and social",
            supportingText: "Connection matters."
          },
          energetic: {
            label: "Energetic and memorable",
            supportingText: "Momentum matters."
          }
        }
      },
      skillLevel: {
        prompt: "Joining around a skill, you prefer...",
        options: {
          beginner: {
            label: "Beginner-friendly",
            supportingText: "Learning with others helps."
          },
          mixed: {
            label: "Mixed levels",
            supportingText: "Social fit matters more."
          },
          focused: {
            label: "A focused session",
            supportingText: "Practice matters."
          }
        }
      },
      foodCoffee: {
        prompt: "Food or coffee plans feel like...",
        options: {
          safeFirst: {
            label: "A safe first step",
            supportingText: "Easy one-on-one plans fit."
          },
          groupAnchor: {
            label: "A good group anchor",
            supportingText: "Small group intros fit."
          },
          backup: {
            label: "A backup option",
            supportingText: "More active plans may fit better."
          }
        }
      },
      outdoorIndoor: {
        prompt: "You are more drawn to...",
        options: {
          indoor: {
            label: "Indoor and cosy",
            supportingText: "Low-friction plans fit."
          },
          either: {
            label: "Either, with good people",
            supportingText: "Social fit leads."
          },
          outdoor: {
            label: "Outdoor and active",
            supportingText: "Higher-energy plans fit."
          }
        }
      },
      followThrough: {
        prompt: "After a good first activity, you would like...",
        options: {
          leaveOpen: {
            label: "Leave it open",
            supportingText: "No forced continuity."
          },
          suggestNext: {
            label: "Suggest a next one",
            supportingText: "A natural follow-up helps."
          },
          makeRegular: {
            label: "Make it regular",
            supportingText: "A routine could stick."
          }
        }
      },
      buzzOutcome: {
        prompt: "If Buzz works for you, it will help you...",
        options: {
          feelAtHome: {
            label: "Feel more at home",
            supportingText: "Belonging is the goal."
          },
          tryThings: {
            label: "Try things I have been putting off",
            supportingText: "Discovery is the goal."
          },
          buildRhythm: {
            label: "Build a rhythm in the city",
            supportingText: "Routine is the goal."
          }
        }
      }
    }
  }
} as const satisfies BaseTranslation;

export default en;
