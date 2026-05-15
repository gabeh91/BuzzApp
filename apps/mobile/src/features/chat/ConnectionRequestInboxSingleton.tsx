import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useBuzzAuth } from "@/auth/AuthProvider";

import {
  useConnectionRequests,
  type ConnectionRequestResponse,
  type ConnectionRequestResponseResult,
  type ConnectionRequestSummary,
} from "./useConnectionRequests";

export type {
  ConnectionRequestResponse,
  ConnectionRequestResponseResult,
  ConnectionRequestSummary,
};

type ConnectionRequestInboxContextValue = {
  loading: boolean;
  responding: boolean;
  respondToConnectionRequest: (
    requestId: string,
    response: ConnectionRequestResponse,
  ) => Promise<ConnectionRequestResponseResult>;
  requests: ConnectionRequestSummary[];
  refetch: () => Promise<void>;
};

const ConnectionRequestInboxContext =
  createContext<ConnectionRequestInboxContextValue | null>(null);

export const ConnectionRequestInboxSingleton = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isAuthenticated, user } = useBuzzAuth();
  const inbox = useConnectionRequests({
    enabled: isAuthenticated,
    userId: user.id,
  });

  const value = useMemo(
    () => ({
      loading: inbox.loading,
      refetch: inbox.refetch,
      responding: inbox.responding,
      respondToConnectionRequest: inbox.respondToConnectionRequest,
      requests: inbox.requests,
    }),
    [
      inbox.loading,
      inbox.refetch,
      inbox.responding,
      inbox.respondToConnectionRequest,
      inbox.requests,
    ],
  );

  return (
    <ConnectionRequestInboxContext.Provider value={value}>
      {children}
    </ConnectionRequestInboxContext.Provider>
  );
};

export const useConnectionRequestInbox =
  (): ConnectionRequestInboxContextValue => {
    const value = useContext(ConnectionRequestInboxContext);

    if (!value) {
      throw new Error(
        "useConnectionRequestInbox must be used within ConnectionRequestInboxSingleton",
      );
    }

    return value;
  };
