import { database } from "@/firebase/clientApp";
import {
  ref,
  remove,
  runTransaction,
} from "firebase/database";

/**
 * Removes a user from a community.
 * Deletes membership records and safely decrements
 * the community member count.
 */
export const leaveCommunity = async (
  userId: string,
  communityId: string
): Promise<void> => {
  try {
    // Community üyeliğini sil
    await remove(
      ref(
        database,
        `communityMembers/${communityId}/${userId}`
      )
    );

    // Kullanıcı snippet'ını sil
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

    await runTransaction(memberCountRef, (count: any) => {
      const current = Number(count || 0);

      return current > 0 ? current - 1 : 0;
    });
  } catch (error) {
    console.error("leaveCommunity:", error);
    throw error;
  }
};

export default leaveCommunity;
