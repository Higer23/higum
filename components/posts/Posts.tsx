/* eslint-disable react-hooks/exhaustive-deps */
import { Community } from "@/types/community";
import { auth } from "@/firebase/clientApp";
import useCommunityPermissions from "@/hooks/community/useCommunityPermissions";
import usePostState from "@/hooks/posts/usePostState";
import usePostSelection from "@/hooks/posts/usePostSelection";
import usePostVote from "@/hooks/posts/usePostVote";
import usePostDeletion from "@/hooks/posts/usePostDeletion";
import usePostVoteSync from "@/hooks/posts/usePostVoteSync";
import usePostsFeed from "@/hooks/posts/usePostsFeed";
import { Button, Stack, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import PostLoader from "../loaders/post-loader/PostLoader";
import PostItem from "./post-item/PostItem";

type PostsProps = {
  communityData: Community;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);

  const { postStateValue, setPostStateValue } = usePostState();
  const { onSelectPost } = usePostSelection(setPostStateValue);
  const { onVote } = usePostVote(postStateValue, setPostStateValue);
  const { onDeletePost } = usePostDeletion(setPostStateValue);

  usePostVoteSync(setPostStateValue);

  const { isAdmin, canPost } = useCommunityPermissions(communityData);

  const { loading, fetchPosts, noMorePosts } = usePostsFeed({
    communityId: communityData.id,
  });

  useEffect(() => {
    fetchPosts();
  }, [communityData]);

  return (
    <>
      {loading && postStateValue.posts.length === 0 ? (
        <PostLoader />
      ) : (
        <Stack gap={3}>
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.uid === item.creatorId}
              userIsAdmin={isAdmin}
              userVoteValue={
                postStateValue.postVotes.find(
                  (vote) => vote.postId === item.id
                )?.voteValue
              }
              onVote={onVote}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
              votingDisabled={!canPost}
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
  );
};

export default Posts;
