import { database } from "@/firebase/clientApp";
import { Post, PostVote } from "@/types/post";
import {
  ref,
  runTransaction,
  set,
  remove,
  update,
} from "firebase/database";

export const handlePostVote = async (
  userId: string,
  post: Post,
  vote: number,
  communityId: string,
  existingVote?: PostVote
) => {
  let voteChange = vote;

  let newVote: PostVote | undefined;

  let voteIdToDelete: string | undefined;

  const voteId = existingVote?.id ?? `${userId}_${post.id}`;

  const voteRef = ref(
    database,
    `postVotes/${userId}/${voteId}`
  );

  if (!existingVote) {
    newVote = {
      id: voteId,
      postId: post.id!,
      communityId,
      voteValue: vote,
    };

    await set(voteRef, newVote);
  } else {
    if (existingVote.voteValue === vote) {
      await remove(voteRef);

      voteChange = -vote;
      voteIdToDelete = existingVote.id;
    } else {
      await update(voteRef, {
        voteValue: vote,
      });

      voteChange = vote * 2;

      newVote = {
        ...existingVote,
        voteValue: vote,
      };
    }
  }

  // Oy sayısını güvenli şekilde güncelle
  const voteStatusRef = ref(
    database,
    `posts/${post.id}/voteStatus`
  );

  await runTransaction(voteStatusRef, (currentValue) => {
    return (currentValue || 0) + voteChange;
  });

  return {
    voteChange,
    newVote,
    voteIdToDelete,
  };
};
