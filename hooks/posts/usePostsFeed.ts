import { postStateAtom } from "@/atoms/postsAtom";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
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
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [noMorePosts, setNoMorePosts] = useState(false);

  const showToast = useCustomToast();

  const fetchPosts = async (initial = false) => {
    if (loading) return;
    if (!initial && noMorePosts) return;
    if (!initial && !lastVisible) return;

    setLoading(true);

    try {
      const { posts, newLastVisible } = await getPostsLib(
        communityId,
        communityIds,
        isGenericHome,
        initial ? null : lastVisible
      );

      if (initial) {
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }));
      } else {
        setPostStateValue((prev) => ({
          ...prev,
          posts: [...prev.posts, ...(posts as Post[])],
        }));
      }

      if (newLastVisible) {
        setLastVisible(newLastVisible);
      }

      setNoMorePosts(posts.length < 10);
    } catch (error: any) {
      console.error("Firestore Error:", error);
      alert(error?.message || "Unknown Firestore Error");

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
    setLastVisible(null);

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
