import { database } from "@/firebase/clientApp";
import { Comment } from "@/types/comment";
import { get, query, ref, orderByChild, equalTo } from "firebase/database";

/**
 * Retrieves all comments for a specific post
 * from Firebase Realtime Database.
 */
export const getComments = async (
  postId: string
): Promise<Comment[]> => {
  try {
    const commentsQuery = query(
      ref(database, "comments"),
      orderByChild("postId"),
      equalTo(postId)
    );

    const snapshot = await get(commentsQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    const comments: Comment[] = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...(value as Comment),
      }))
      .sort(
        (a, b) =>
          Number(b.createdAt ?? 0) -
          Number(a.createdAt ?? 0)
      );

    return comments;
  } catch (error) {
    console.error("getComments:", error);
    return [];
  }
};
