import { database } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { SavedPost } from "@/types/savedPost";
import { ref, set } from "firebase/database";

/**
 * Saves a post to the user's saved posts in Realtime Database.
 */
export const savePost = async (
  userId: string,
  post: Post
): Promise<SavedPost> => {
  if (!post.id) {
    throw new Error("Post ID is missing.");
  }

  try {
    const newSavedPost: SavedPost = {
      id: post.id,
      postId: post.id,
      communityId: post.communityId,
      postTitle: post.title,
      communityImageURL: post.communityImageURL || "",
    };

    await set(
      ref(database, `savedPosts/${userId}/${post.id}`),
      newSavedPost
    );

    return newSavedPost;
  } catch (error) {
    console.error("savePost:", error);
    throw error;
  }
};
