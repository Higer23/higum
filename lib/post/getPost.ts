import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import safeJsonStringify from "safe-json-stringify";
import { Post } from "@/types/post";

/**
 * Gets a single post by id.
 */
export async function getPost(postId: string): Promise<Post | null> {
  try {
    if (!postId) {
      console.error("getPost: postId is empty");
      return null;
    }

    const postRef = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      console.error(`getPost: Post not found (${postId})`);
      return null;
    }

    const post = {
      id: postSnap.id,
      ...postSnap.data(),
    };

    return JSON.parse(
      safeJsonStringify(post)
    ) as Post;
  } catch (error) {
    console.error("getPost failed:", error);
    return null;
  }
}
