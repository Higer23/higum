import { database } from "@/firebase/clientApp";
import { PostVote } from "@/types/post";
import { get, ref } from "firebase/database";

/**
 * Retrieves all votes cast by a user within a specific community
 * from Realtime Database.
 */
export const getCommunityPostVotes = async (
  userId: string,
  communityId: string
): Promise<PostVote[]> => {
  try {
    if (!userId || !communityId) {
      return [];
    }

    const snapshot = await get(
      ref(database, `postVotes/${userId}`)
    );

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    const votes: PostVote[] = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...(value as PostVote),
      }))
      .filter(
        (vote) =>
          vote.communityId &&
          vote.communityId === communityId
      );

    return votes;
  } catch (error) {
    console.error("Error getting community post votes:", error);
    return [];
  }
};

export default getCommunityPostVotes;
