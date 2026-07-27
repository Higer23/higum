import { database } from "@/firebase/clientApp";
import { PostVote } from "@/types/post";
import { get, ref } from "firebase/database";

/**
 * Retrieves all votes for the specified posts cast by a user
 * from Realtime Database.
 */
export const getPostVotes = async (
  userId: string,
  postIds: string[]
): Promise<PostVote[]> => {
  try {
    if (!userId || postIds.length === 0) {
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
          vote.postId &&
          postIds.includes(vote.postId)
      );

    return votes;
  } catch (error) {
    console.error("Error getting post votes:", error);
    return [];
  }
};
