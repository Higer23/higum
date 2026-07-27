import { database } from "@/firebase/clientApp";
import {
  ref,
  remove,
  runTransaction,
} from "firebase/database";

/**
 * Removes a member from a community.
 * Deletes membership records and safely updates
 * the community member count.
 */
export const removeCommunityMember = async (
  communityId: string,
  memberId: string
): Promise<void> => {
  try {
    // Community üyeliğini sil
    await remove(
      ref(
        database,
        `communityMembers/${communityId}/${memberId}`
      )
    );

    // Kullanıcının snippet'ını sil
    await remove(
      ref(
        database,
        `users/${memberId}/communitySnippets/${communityId}`
      )
    );

    // Üye sayısını azalt
    const memberCountRef = ref(
      database,
      `communities/${communityId}/numberOfMembers`
    );

    await runTransaction(memberCountRef, (count: any) => {
      const current = Number(count || 0);
      return current > 0 ? current - 1 : 0;
    });
  } catch (error) {
    console.error(
      "removeCommunityMember:",
      error
    );
    throw error;
  }
};

export default removeCommunityMember;
