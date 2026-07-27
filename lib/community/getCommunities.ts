import { database } from "@/firebase/clientApp";
import { Community } from "@/types/community";
import { get, ref } from "firebase/database";

/**
 * Retrieves communities from Firebase Realtime Database.
 * Communities are ordered by member count (highest first).
 */
export const getCommunities = async (
  limitValue: number,
  lastVisible?: string | null
): Promise<{
  communities: Community[];
  newLastVisible: string | null;
}> => {
  try {
    const snapshot = await get(
      ref(database, "communities")
    );

    if (!snapshot.exists()) {
      return {
        communities: [],
        newLastVisible: null,
      };
    }

    const data = snapshot.val();

    let communities: Community[] = Object.entries(data).map(
      ([id, value]) => ({
        id,
        ...(value as Community),
      })
    );

    // Önce üye sayısı, eşitse oluşturulma tarihi
    communities.sort((a, b) => {
      const memberDiff =
        (b.numberOfMembers || 0) -
        (a.numberOfMembers || 0);

      if (memberDiff !== 0) {
        return memberDiff;
      }

      return (
        Number(b.createdAt || 0) -
        Number(a.createdAt || 0)
      );
    });

    let startIndex = 0;

    if (lastVisible) {
      const index = communities.findIndex(
        (community) => community.id === lastVisible
      );

      if (index >= 0) {
        startIndex = index + 1;
      }
    }

    const result = communities.slice(
      startIndex,
      startIndex + limitValue
    );

    return {
      communities: result,
      newLastVisible:
        result.length > 0
          ? result[result.length - 1].id
          : null,
    };
  } catch (error) {
    console.error("getCommunities:", error);

    return {
      communities: [],
      newLastVisible: null,
    };
  }
};

export default getCommunities;
