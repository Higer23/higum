import { database } from "@/firebase/clientApp";
import { PostVote } from "@/types/post";
import { get, ref } from "firebase/database";

/**
 * Kullanıcının belirtilen postlara verdiği oyları getirir.
 */
export const getPostVotes = async (
  userId: string,
  postIds: string[]
): Promise<PostVote[]> => {
  try {
    const snapshot = await get(ref(database, `postVotes/${userId}`));

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    const votes: PostVote[] = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...(value as PostVote),
      }))
      .filter((vote) => postIds.includes(vote.postId));

    return votes;
  } catch (error) {
    console.error("getPostVotes:", error);
    return [];
  }
};
