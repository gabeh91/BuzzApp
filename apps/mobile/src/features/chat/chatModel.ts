export type ChatModerationStatus = "clean" | "flagged" | "blocked";

export type ChatDraft = {
  body: string;
  canSend: boolean;
  moderationStatus: ChatModerationStatus;
  reason?: "blocked" | "empty";
};

const blockedTerms = ["idiot", "stupid", "moron"];

const containsBlockedTerm = (body: string): boolean => {
  const normalized = body.toLowerCase();
  return blockedTerms.some((term) => new RegExp(`\\b${term}\\b`, "i").test(normalized));
};

export const createChatDraft = (rawBody: string): ChatDraft => {
  const body = rawBody.trim();

  if (!body) {
    return {
      body,
      canSend: false,
      moderationStatus: "clean",
      reason: "empty"
    };
  }

  if (containsBlockedTerm(body)) {
    return {
      body,
      canSend: false,
      moderationStatus: "blocked",
      reason: "blocked"
    };
  }

  return {
    body,
    canSend: true,
    moderationStatus: "clean"
  };
};
