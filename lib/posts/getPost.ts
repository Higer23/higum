import { database } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { get, ref } from "firebase/database";

/**
 * Retrieves a single post from Firebase Realtime Database.
 * Returns null if the post does not exist.
 */
export const getPost = async (
  postId: string
): Promise<Post | null> => {
  try {
    const snapshot = await get(
      ref(database, `posts/${postId}`)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: postId,
      ...(snapshot.val() as Post),
    };
  } catch (error) {
    console.error("getPost:", error);
    return null;
  }
};
