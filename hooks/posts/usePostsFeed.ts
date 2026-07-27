import { postStateAtom } from "@/atoms/postsAtom";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import useCustomToast from "../useCustomToast";
import { Post } from "@/types/post";
import { getPosts as getPostsLib } from "@/lib/posts/getPosts";

type UsePostsFeedProps = {
  communityId?: string;
  communityIds?: string[];
  isGenericHome?: boolean;
};

const usePostsFeed = ({
  communityId,
  communityIds,
  isGenericHome,
}: UsePostsFeedProps) => {
  const setPostStateValue = useSetAtom(postStateAtom);

  const [loading, setLoading] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const showToast = useCustomToast();

  const fetchPosts = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { posts } = await getPostsLib(
        communityId,
        communityIds,
        isGenericHome
      );

      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));

      // Eğer 10'dan az post geldiyse daha fazla yok demektir.
      setNoMorePosts(posts.length < 10);
    } catch (error: any) {
      console.error("Error fetching posts:", error);

      showToast({
        title: "Could not Fetch Posts",
        description: error?.message || "There was an error fetching posts",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNoMorePosts(false);

    setPostStateValue((prev) => ({
      ...prev,
      posts: [],
    }));
  }, [communityId, communityIds, isGenericHome, setPostStateValue]);

  return {
    loading,
    fetchPosts,
    noMorePosts,
  };
};

export default usePostsFeed;
