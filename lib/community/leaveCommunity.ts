import { database } from "@/firebase/clientApp";
import {
  ref,
  remove,
  runTransaction,
} from "firebase/database";

/**
 * Removes a user from a community.
 * Deletes the membership entry and safely decrements
 * the community member count.
 */
export const leaveCommunity = async (
  userId: string,
  communityId: string
): Promise<void> => {
  // Kullanıcının community üyeliğini sil
  await remove(
    ref(
      database,
      `communityMembers/${communityId}/${userId}`
    )
  );

  // Kullanıcının snippet'ını sil
  await remove(
    ref(
      database,
      `users/${userId}/communitySnippets/${communityId}`
    )
  );

  // Üye sayısını güvenli şekilde azalt
  const memberCountRef = ref(
    database,
    `communities/${communityId}/numberOfMembers`
  );

  await runTransaction(memberCountRef, (count) => {
    const current = count || 0;

    if (current <= 0) {
      return 0;
    }

    return current - 1;
  });
};

export default leaveCommunity;
