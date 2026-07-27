import { database, storage } from "@/firebase/clientApp";
import { Community } from "@/types/community";
import {
  get,
  ref,
  remove,
  update,
} from "firebase/database";
import {
  deleteObject,
  ref as storageRef,
} from "firebase/storage";

/**
 * Deletes an entire community and all related data
 * from Realtime Database.
 */
export const deleteCommunity = async (
  communityData: Community
) => {
  const updates: Record<string, null> = {};

  /* ------------------------------------ */
  /* Delete community image */
  /* ------------------------------------ */

  if (communityData.imageURL) {
    try {
      await deleteObject(
        storageRef(
          storage,
          `communities/${communityData.id}/image`
        )
      );
    } catch (e) {
      console.log("Community image not found");
    }
  }

  /* ------------------------------------ */
  /* Delete all posts */
  /* ------------------------------------ */

  const postsSnapshot = await get(ref(database, "posts"));

  if (postsSnapshot.exists()) {
    const posts = postsSnapshot.val();

    for (const postId in posts) {
      const post = posts[postId];

      if (post.communityId !== communityData.id) continue;

      if (post.imageURL) {
        try {
          await deleteObject(
            storageRef(
              storage,
              `posts/${postId}/image`
            )
          );
        } catch {}
      }

      updates[`posts/${postId}`] = null;

      /* Delete comments of this post */

      const commentsSnapshot = await get(
        ref(database, "comments")
      );

      if (commentsSnapshot.exists()) {
        const comments = commentsSnapshot.val();

        for (const commentId in comments) {
          if (comments[commentId].postId === postId) {
            updates[`comments/${commentId}`] = null;
          }
        }
      }

      /* Delete votes */

      const votesSnapshot = await get(
        ref(database, "postVotes")
      );

      if (votesSnapshot.exists()) {
        const usersVotes = votesSnapshot.val();

        for (const uid in usersVotes) {
          const votes = usersVotes[uid];

          for (const voteId in votes) {
            if (votes[voteId].postId === postId) {
              updates[
                `postVotes/${uid}/${voteId}`
              ] = null;
            }
          }
        }
      }

      /* Delete saved posts */

      const savedSnapshot = await get(
        ref(database, "savedPosts")
      );

      if (savedSnapshot.exists()) {
        const usersSaved = savedSnapshot.val();

        for (const uid in usersSaved) {
          if (usersSaved[uid][postId]) {
            updates[
              `savedPosts/${uid}/${postId}`
            ] = null;
          }
        }
      }

      /* Delete notifications */

      const notificationSnapshot = await get(
        ref(database, "notifications")
      );

      if (notificationSnapshot.exists()) {
        const notifications =
          notificationSnapshot.val();

        for (const uid in notifications) {
          for (const id in notifications[uid]) {
            if (
              notifications[uid][id].postId === postId
            ) {
              updates[
                `notifications/${uid}/${id}`
              ] = null;
            }
          }
        }
      }
    }
  }

  /* ------------------------------------ */
  /* Delete community members */
  /* ------------------------------------ */

  const membersSnapshot = await get(
    ref(
      database,
      `communityMembers/${communityData.id}`
    )
  );

  if (membersSnapshot.exists()) {
    const members = membersSnapshot.val();

    for (const uid in members) {
      updates[
        `users/${uid}/communitySnippets/${communityData.id}`
      ] = null;
    }
  }

  updates[
    `communityMembers/${communityData.id}`
  ] = null;

  /* ------------------------------------ */
  /* Delete community */
  /* ------------------------------------ */

  updates[
    `communities/${communityData.id}`
  ] = null;

  await update(ref(database), updates);
};

export default deleteCommunity;
