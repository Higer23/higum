import { database } from "@/firebase/clientApp";
import {
  get,
  ref,
  runTransaction,
  update,
} from "firebase/database";

/**
 * Promotes a user to admin in Realtime Database.
 */
export const addCommunityAdmin = async (
  communityId: string,
  userId: string,
  communityImageURL?: string
): Promise<void> => {
  const memberRef = ref(
    database,
    `communityMembers/${communityId}/${userId}`
  );

  const memberSnapshot = await get(memberRef);

  if (memberSnapshot.exists()) {
    await update(memberRef, {
      isAdmin: true,
    });

    await update(
      ref(
        database,
        `users/${userId}/communitySnippets/${communityId}`
      ),
      {
        isAdmin: true,
      }
    );
  } else {
    await update(ref(database), {
      [`communityMembers/${communityId}/${userId}`]: {
        uid: userId,
        communityId,
        imageURL: communityImageURL || "",
        isAdmin: true,
        joinedAt: Date.now(),
      },

      [`users/${userId}/communitySnippets/${communityId}`]: {
        communityId,
        imageURL: communityImageURL || "",
        isAdmin: true,
        joinedAt: Date.now(),
      },
    });

    await runTransaction(
      ref(
        database,
        `communities/${communityId}/numberOfMembers`
      ),
      (count) => (count || 0) + 1
    );
  }

  await runTransaction(
    ref(database, `communities/${communityId}/adminIds`),
    (admins: any) => {
      if (!admins) admins = {};

      admins[userId] = true;

      return admins;
    }
  );
};

export default addCommunityAdmin;
