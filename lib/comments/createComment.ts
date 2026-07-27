import { database } from "@/firebase/clientApp";
import { Comment } from "@/types/comment";
import { User } from "firebase/auth";
import {
  get,
  push,
  ref,
  runTransaction,
  set,
} from "firebase/database";

/**
 * Creates a new comment in Realtime Database
 * and increases the post comment count.
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
      "Maximum comment depth reached. You cannot reply to this comment."
    );
  }

  const commentRef = push(ref(database, "comments"));

  const newComment: Comment = {
    id: commentRef.key!,
    creatorId: user.uid,
    creatorDisplayText:
      user.displayName ||
      user.email?.split("@")[0] ||
      "Anonymous",
    communityId,
    postId,
    postTitle,
    text: commentText,
    createdAt: Date.now() as any,
    depth,
  };

  if (parentId) {
    newComment.parentId = parentId;
  }

  // Yorumu kaydet
  await set(commentRef, newComment);

  // numberOfComments artır
  const postRef = ref(database, `posts/${postId}`);

  await runTransaction(postRef, (post: any) => {
    if (post) {
      post.numberOfComments =
        (post.numberOfComments || 0) + 1;
    }
    return post;
  });

  return newComment;
};
