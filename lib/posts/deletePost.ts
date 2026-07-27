import { database, storage } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { ref as dbRef, remove, get } from "firebase/database";
import { deleteObject, ref as storageRef } from "firebase/storage";

/**
 * Deletes a post and all related data from Realtime Database.
 */
export const deletePost = async (post: Post): Promise<void> => {
  if (!post.id) {
    throw new Error("Post ID is missing.");
  }

  // Resmi sil
  if (post.imageURL) {
    try {
      await deleteObject(storageRef(storage, `posts/${post.id}/image`));
    } catch (error) {
      console.warn("Image already deleted or not found.", error);
    }
  }

  // Postu sil
  await remove(dbRef(database, `posts/${post.id}`));

  // Yorumlari sil
  const commentsSnapshot = await get(dbRef(database, "comments"));

  if (commentsSnapshot.exists()) {
    const comments = commentsSnapshot.val();

    const deletePromises: Promise<void>[] = [];

    Object.entries(comments).forEach(([commentId, value]: any) => {
      if (value.postId === post.id) {
        deletePromises.push(
          remove(dbRef(database, `comments/${commentId}`))
        );
      }
    });

    await Promise.all(deletePromises);
  }

  // Vote kayıtlarını sil
  const votesSnapshot = await get(dbRef(database, "postVotes"));

  if (votesSnapshot.exists()) {
    const votes = votesSnapshot.val();

    const deleteVotePromises: Promise<void>[] = [];

    Object.entries(votes).forEach(([voteId, value]: any) => {
      if (value.postId === post.id) {
        deleteVotePromises.push(
          remove(dbRef(database, `postVotes/${voteId}`))
        );
      }
    });

    await Promise.all(deleteVotePromises);
  }

  // Kaydedilen postlardan sil
  const savedSnapshot = await get(dbRef(database, "savedPosts"));

  if (savedSnapshot.exists()) {
    const users = savedSnapshot.val();

    const deleteSavedPromises: Promise<void>[] = [];

    Object.keys(users).forEach((uid) => {
      deleteSavedPromises.push(
        remove(dbRef(database, `savedPosts/${uid}/${post.id}`))
      );
    });

    await Promise.all(deleteSavedPromises);
  }
};
