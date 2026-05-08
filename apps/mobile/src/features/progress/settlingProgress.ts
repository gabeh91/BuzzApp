export type SettlingProgressInput = {
  quizCompleted: boolean;
  suburbFitViewed: boolean;
  interestActivated: boolean;
  groupJoined: boolean;
  attendanceConfirmed: boolean;
  feedbackCompleted: boolean;
};

export type SettlingProgressMilestone = {
  id:
    | "quiz_completed"
    | "suburb_fit_viewed"
    | "interest_activated"
    | "group_joined"
    | "attendance_confirmed"
    | "feedback_completed";
  label: string;
  completed: boolean;
};

export type SettlingProgress = {
  completedCount: number;
  totalCount: number;
  percent: number;
  milestones: SettlingProgressMilestone[];
  nextStep: SettlingProgressMilestone | null;
};

export const createSettlingProgress = ({
  attendanceConfirmed,
  feedbackCompleted,
  groupJoined,
  interestActivated,
  quizCompleted,
  suburbFitViewed
}: SettlingProgressInput): SettlingProgress => {
  const milestones: SettlingProgressMilestone[] = [
    { id: "quiz_completed", label: "Complete profile quiz", completed: quizCompleted },
    { id: "suburb_fit_viewed", label: "Review suburb fit", completed: suburbFitViewed },
    { id: "interest_activated", label: "Activate an interest", completed: interestActivated },
    { id: "group_joined", label: "Join a group", completed: groupJoined },
    { id: "attendance_confirmed", label: "Confirm attendance", completed: attendanceConfirmed },
    { id: "feedback_completed", label: "Complete post-plan feedback", completed: feedbackCompleted }
  ];
  const completedCount = milestones.filter((milestone) => milestone.completed).length;
  const totalCount = milestones.length;

  return {
    completedCount,
    totalCount,
    percent: Math.round((completedCount / totalCount) * 100),
    milestones,
    nextStep: milestones.find((milestone) => !milestone.completed) ?? null
  };
};
