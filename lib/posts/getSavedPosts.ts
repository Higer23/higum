import { database } from "@/firebase/clientApp";
import { SavedPost } from "@/types/savedPost";
import { get, ref } from "firebase/database";

/**
 * Retrieves all saved posts for a user from Firebase Realtime Database.
 */
export const getSavedPosts = async (
  userId: string
): Promise<SavedPost[]> => {
  try {
    const snapshot = await get(
      ref(database, `savedPosts/${userId}`)
    );

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();

    const savedPosts: SavedPost[] = Object.entries(data).map(
      ([id, value]) => ({
        id,
        ...(value as SavedPost),
      })
    );

    return savedPosts;
  } catch (error) {
    console.error("getSavedPosts:", error);
    return [];
  }
};
