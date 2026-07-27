import { database } from "@/firebase/clientApp";
import { ref, remove } from "firebase/database";

/**
 * Removes a saved post from a user's saved posts
 * in Firebase Realtime Database.
 */
export const unsavePost = async (
  userId: string,
  postId: string
): Promise<void> => {
  try {
    await remove(
      ref(database, `savedPosts/${userId}/${postId}`)
    );
  } catch (error) {
    console.error("unsavePost:", error);
    throw error;
  }
};
