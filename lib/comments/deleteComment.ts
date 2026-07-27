import { database } from "@/firebase/clientApp";
import {
  get,
  ref,
  remove,
  runTransaction,
} from "firebase/database";

/**
 * Deletes a comment and all of its descendants
 * from Firebase Realtime Database.
 * Updates the post comment count safely.
 */
export const deleteComment = async (
  commentId: string,
  postId: string,
  descendantIds: string[]
): Promise<number> => {
  try {
    const allIdsToDelete = [
      commentId,
      ...descendantIds,
    ];

    // Delete all comments
    await Promise.all(
      allIdsToDelete.map((id) =>
        remove(ref(database, `comments/${id}`))
      )
    );

    // Update comment counter
    const postRef = ref(database, `posts/${postId}`);

    await runTransaction(postRef, (post: any) => {
      if (!post) return post;

      post.numberOfComments = Math.max(
        0,
        (post.numberOfComments || 0) -
          allIdsToDelete.length
      );

      return post;
    });

    return allIdsToDelete.length;
  } catch (error) {
    console.error("deleteComment:", error);
    throw error;
  }
};
