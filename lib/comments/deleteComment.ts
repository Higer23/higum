import { database } from "@/firebase/clientApp";
import { get, ref, remove, runTransaction } from "firebase/database";

/**
 * Deletes a comment and all of its descendants from Realtime Database.
 * Also decreases the comment count on the related post.
 */
export const deleteComment = async (
  commentId: string,
  postId: string,
  descendantIds: string[]
): Promise<number> => {
  const allIdsToDelete = [commentId, ...descendantIds];

  // Yorumu ve alt yorumları sil
  await Promise.all(
    allIdsToDelete.map((id) =>
      remove(ref(database, `comments/${id}`))
    )
  );

  // numberOfComments değerini güncelle
  const postRef = ref(database, `posts/${postId}`);

  await runTransaction(postRef, (post: any) => {
    if (post) {
      post.numberOfComments = Math.max(
        0,
        (post.numberOfComments || 0) - allIdsToDelete.length
      );
    }

    return post;
  });

  return allIdsToDelete.length;
};
