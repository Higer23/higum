import { database } from "@/firebase/clientApp";
import { Comment } from "@/types/comment";
import { User } from "firebase/auth";
import {
  push,
  ref,
  runTransaction,
  set,
} from "firebase/database";

/**
 * Creates a comment in Firebase Realtime Database.
 */
export const createComment = async (
  user: User,
  communityId: string,
  postId: string,
  postTitle: string,
  commentText: string,
  depth: number,
  parentId?: string
): Promise<Comment> => {
  if (depth > 2) {
    throw new Error(
      "Maximum comment depth reached."
    );
  }

  const commentRef = push(ref(database, "comments"));

  const newComment: Comment = {
    id: commentRef.key!,
    creatorId: user.uid,

    creatorDisplayText:
      user.displayName ??
      user.email?.split("@")[0] ??
      "Anonymous",

    communityId,
    postId,
    postTitle,

    text: commentText,

    depth,

    parentId: parentId ?? null,

    createdAt: Date.now(),

    voteStatus: 0,

    edited: false,
  } as Comment;

  await set(commentRef, newComment);

  await runTransaction(
    ref(database, `posts/${postId}`),
    (post: any) => {
      if (post == null) return post;

      post.numberOfComments =
        (post.numberOfComments || 0) + 1;

      return post;
    }
  );

  return newComment;
};
