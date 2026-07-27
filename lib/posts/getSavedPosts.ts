import { database } from "@/firebase/clientApp";
import { SavedPost } from "@/types/savedPost";
import { get, ref } from "firebase/database";

/**
 * Retrieves all posts saved by a user from Realtime Database.
 */
export const getSavedPosts = async (
  userId: string
): Promise<SavedPost[]> => {
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
};
