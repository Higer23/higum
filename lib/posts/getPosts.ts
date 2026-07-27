import { database } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { get, ref } from "firebase/database";

export const getPosts = async (
  communityId?: string,
  communityIds?: string[],
  isGenericHome?: boolean,
  lastVisible?: any
) => {
  const snapshot = await get(ref(database, "posts"));

  if (!snapshot.exists()) {
    return {
      posts: [],
      newLastVisible: null,
    };
  }

  const data = snapshot.val();

  let posts: Post[] = Object.entries(data).map(([id, value]) => ({
    id,
    ...(value as Post),
  }));

  if (communityId) {
    posts = posts.filter((post) => post.communityId === communityId);
  } else if (communityIds && communityIds.length > 0) {
    posts = posts.filter((post) =>
      communityIds.includes(post.communityId)
    );
  }

  if (isGenericHome) {
    posts.sort((a, b) => (b.voteStatus || 0) - (a.voteStatus || 0));
  } else {
    posts.sort(
      (a, b) => Number(b.createTime || 0) - Number(a.createTime || 0)
    );
  }

  return {
    posts: posts.slice(0, 10),
    newLastVisible: null,
  };
};
