import { database } from "@/firebase/clientApp";
import { Comment } from "@/types/comment";
import { get, ref } from "firebase/database";

/**
 * Retrieves all comments for a post from Realtime Database.
 * Comments are returned newest first.
 */
export const getComments = async (
  postId: string
): Promise<Comment[]> => {
  const snapshot = await get(ref(database, "comments"));

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();

  const comments: Comment[] = Object.entries(data)
    .map(([id, value]) => ({
      id,
      ...(value as Comment),
    }))
    .filter((comment) => comment.postId === postId)
    .sort(
      (a, b) =>
        Number(b.createdAt || 0) -
        Number(a.createdAt || 0)
    );

  return comments;
};
