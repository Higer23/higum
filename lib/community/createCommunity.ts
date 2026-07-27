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
) => {
  const communityRef = ref(database, `communities/${communityName}`);

  const result = await runTransaction(communityRef, (community: any) => {
    if (community !== null) {
      return;
    }

    return {
      id: communityName,
      name: communityName,

      creatorId: userId,

      createdAt: Date.now(),

      privacyType: communityType,

      numberOfMembers: 1,

      numberOfPosts: 0,

      description: "",

      imageURL: "",

      bannerURL: "",

      rules: [],

      tags: [],

      verified: false,

      nsfw: false,
    };
  });

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
      joinedAt: Date.now(),
    },

    [`users/${userId}/communitySnippets/${communityName}`]: {
      communityId: communityName,
      isAdmin: true,
      joinedAt: Date.now(),
    },
  });
};

export default createCommunity;
