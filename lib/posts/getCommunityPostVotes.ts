import { database } from "@/firebase/clientApp";
import { PostVote } from "@/types/post";
import { get, ref } from "firebase/database";

/**
 * Kullanıcının belirli bir community içindeki tüm oylarını getirir.
 */
export const getCommunityPostVotes = async (
  userId: string,
  communityId: string
): Promise<PostVote[]> => {
  try {
    const snapshot = await get(ref(database, `postVotes/${userId}`));

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    const postVotes: PostVote[] = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...(value as PostVote),
      }))
      .filter((vote) => vote.communityId === communityId);

    return postVotes;
  } catch (error) {
    console.error("getCommunityPostVotes:", error);
    return [];
  }
};
