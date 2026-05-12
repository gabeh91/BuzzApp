import { buzzSupabase } from "@/lib/supabase";
import {
  loadPeopleMatches,
  sendConnectionRequest,
  type LoadPeopleMatchesInput,
  type PeopleRpcClient,
  type SendConnectionRequestInput,
} from "./peopleFeed";

const peopleRpcClient = buzzSupabase as unknown as PeopleRpcClient;

export const loadPeopleMatchesFromSupabase = async (
  input: LoadPeopleMatchesInput,
) => {
  return loadPeopleMatches(input, peopleRpcClient);
};

export const sendConnectionRequestToSupabase = async (
  input: SendConnectionRequestInput,
) => {
  return sendConnectionRequest(input, peopleRpcClient);
};
