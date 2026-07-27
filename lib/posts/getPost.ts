import { database } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { ref, get } from "firebase/database";

export const getPost = async (postId: string) => {
  const snapshot = await get(ref(database, `posts/${postId}`));

  if (snapshot.exists()) {
    return {
      id: postId,
      ...(snapshot.val() as Post),
    };
  }

  return null;
};
