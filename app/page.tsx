"use client";

import CreatePostLink from "@/components/community/CreatePostLink";
import PersonalHome from "@/components/community/PersonalHome";
import Recommendations from "@/components/community/recommendations/Recommendations";
import PageContent from "@/components/layout/PageContent";
import PostLoader from "@/components/loaders/post-loader/PostLoader";
import PostItem from "@/components/posts/post-item/PostItem";
import { auth } from "@/firebase/clientApp";
import useCommunityState from "@/hooks/community/useCommunityState";
import usePostDeletion from "@/hooks/posts/usePostDeletion";
import usePostSelection from "@/hooks/posts/usePostSelection";
import usePostState from "@/hooks/posts/usePostState";
import usePostVote from "@/hooks/posts/usePostVote";
import usePostVoteSync from "@/hooks/posts/usePostVoteSync";
import usePostsFeed from "@/hooks/posts/usePostsFeed";
import useCustomToast from "@/hooks/useCustomToast";
import { Button, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user, loadingUser] = useAuthState(auth);

  const { communityStateValue } = useCommunityState();
  const { postStateValue, setPostStateValue } = usePostState();

  const { onSelectPost } = usePostSelection(setPostStateValue);
  const { onVote, getPostVotes } = usePostVote(
    postStateValue,
    setPostStateValue
  );

  const { onDeletePost } = usePostDeletion(setPostStateValue);

  usePostVoteSync(setPostStateValue);
  useCustomToast();

  const communityIds = useMemo(
    () => communityStateValue.mySnippets.map((s) => s.communityId),
    [communityStateValue.mySnippets]
  );

  const { loading, fetchPosts, noMorePosts } = usePostsFeed({
    communityIds: user && communityIds.length > 0 ? communityIds : undefined,
    isGenericHome: !user || communityIds.length === 0,
  });

  useEffect(() => {
    if (communityStateValue.snippetFetched) {
      fetchPosts();
    }
  }, [communityStateValue.snippetFetched, user, communityIds.length]);

  useEffect(() => {
    if (!user && !loadingUser) {
      fetchPosts();
    }
  }, [user, loadingUser]);

  useEffect(() => {
    if (user && postStateValue.posts.length) {
      const postIds = postStateValue.posts.map((post) => post.id!);

      getPostVotes(postIds);

      return () => {
        setPostStateValue((prev) => ({
          ...prev,
          postVotes: [],
        }));
      };
    }
  }, [user, postStateValue.posts]);

  return (
    <PageContent>
      <>
        <CreatePostLink />

        {loading && postStateValue.posts.length === 0 ? (
          <PostLoader />
        ) : (
          <Stack gap={3}>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                userIsAdmin={
                  !!communityStateValue.mySnippets.find(
                    (snippet) => snippet.communityId === post.communityId
                  )?.isAdmin
                }
                showCommunityImage
              />
            ))}

            {!noMorePosts ? (
              <Button
                onClick={() => fetchPosts()}
                loading={loading}
                variant="outline"
                width="100%"
                my={4}
              >
                Load More
              </Button>
            ) : (
              <Text textAlign="center" p={2} fontSize="sm" color="gray.500">
                No more posts
              </Text>
            )}
          </Stack>
        )}
      </>

      <Stack gap={2}>
        <Recommendations />
        <PersonalHome />
      </Stack>
    </PageContent>
  );
}
