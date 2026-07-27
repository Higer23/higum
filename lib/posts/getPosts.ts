import { database } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { get, ref } from "firebase/database";

const PAGE_SIZE = 10;

export const getPosts = async (
  communityId?: string,
  communityIds?: string[],
  isGenericHome?: boolean,
  lastVisible?: string | null
) => {
  try {
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

    // Community filtresi
    if (communityId) {
      posts = posts.filter((post) => post.communityId === communityId);
    }

    // Kullanıcının üye olduğu communityler
    else if (communityIds?.length) {
      posts = posts.filter((post) =>
        communityIds.includes(post.communityId)
      );
    }

    // Sıralama
    posts.sort((a, b) => {
      if (isGenericHome) {
        return (b.voteStatus ?? 0) - (a.voteStatus ?? 0);
      }

      return Number(b.createTime ?? 0) - Number(a.createTime ?? 0);
    });

    // Sayfalama
    let startIndex = 0;

    if (lastVisible) {
      const index = posts.findIndex((p) => p.id === lastVisible);

      if (index >= 0) {
        startIndex = index + 1;
      }
    }

    const paginatedPosts = posts.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );

    const newLastVisible =
      paginatedPosts.length > 0
        ? paginatedPosts[paginatedPosts.length - 1].id
        : null;

    return {
      posts: paginatedPosts,
      newLastVisible,
    };
  } catch (error) {
    console.error("getPosts:", error);

    return {
      posts: [],
      newLastVisible: null,
    };
  }
};
