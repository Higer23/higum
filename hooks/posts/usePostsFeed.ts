import { postStateAtom } from "@/atoms/postsAtom";
import { useSetAtom } from "jotai";
import { useEffect, useState, useCallback } from "react";
import useCustomToast from "../useCustomToast";
import { Post } from "@/types/post";
import { getPosts } from "@/lib/posts/getPosts";

type UsePostsFeedProps = {
  communityId?: string;
  communityIds?: string[];
  isGenericHome?: boolean;
};

const PAGE_SIZE = 10;

const usePostsFeed = ({
  communityId,
  communityIds,
  isGenericHome,
}: UsePostsFeedProps) => {
  const setPostStateValue = useSetAtom(postStateAtom);

  const [loading, setLoading] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const showToast = useCustomToast();

  const fetchPosts = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const result = await getPosts(
        communityId,
        communityIds,
        isGenericHome
      );

      const posts = (result?.posts || []) as Post[];

      setPostStateValue((prev) => ({
        ...prev,
        posts,
      }));

      setNoMorePosts(posts.length < PAGE_SIZE);
    } catch (error: any) {
      console.error("usePostsFeed:", error);

      showToast({
        title: "Posts could not be loaded",
        description:
          error?.message ?? "An unexpected error occurred while loading posts.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    communityId,
    communityIds,
    isGenericHome,
    setPostStateValue,
    showToast,
  ]);

  useEffect(() => {
    setNoMorePosts(false);

    setPostStateValue((prev) => ({
      ...prev,
      posts: [],
    }));
  }, [
    communityId,
    communityIds,
    isGenericHome,
    setPostStateValue,
  ]);

  return {
    loading,
    fetchPosts,
    noMorePosts,
  };
};

export default usePostsFeed;
