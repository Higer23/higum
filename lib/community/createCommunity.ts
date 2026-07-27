import { database } from "@/firebase/clientApp";
import {
  ref,
  runTransaction,
  update,
} from "firebase/database";

/**
 * Creates a new community in Realtime Database
 * and adds the creator as the first administrator.
 */
export const createCommunity = async (
  communityName: string,
  communityType: string,
  userId: string
): Promise<void> => {
  const now = Date.now();

  const communityRef = ref(
    database,
    `communities/${communityName}`
  );

  try {
    const result = await runTransaction(
      communityRef,
      (community: any) => {
        if (community !== null) {
          return;
        }

        return {
          id: communityName,
          name: communityName,

          creatorId: userId,

          createdAt: now,
          updatedAt: now,

          privacyType: communityType,

          numberOfMembers: 1,
          numberOfPosts: 0,
          numberOfComments: 0,

          voteStatus: 0,

          description: "",
          imageURL: "",
          bannerURL: "",

          rules: [],
          tags: [],

          verified: false,
          nsfw: false,
          archived: false,
          locked: false,

          lastPostAt: 0,

          moderators: {
            [userId]: true,
          },
        };
      }
    );

    if (!result.committed) {
      throw new Error(
        `Sorry, /r/${communityName} is taken. Try another.`
      );
    }

    await update(ref(database), {
      [`communityMembers/${communityName}/${userId}`]: {
        uid: userId,
        communityId: communityName,
        isAdmin: true,
        joinedAt: now,
      },

      [`users/${userId}/communitySnippets/${communityName}`]: {
        communityId: communityName,
        isAdmin: true,
        joinedAt: now,
      },
    });
  } catch (error) {
    console.error("createCommunity:", error);
    throw error;
  }
};

export default createCommunity;
