import { database } from "@/firebase/clientApp";
import { Community } from "@/types/community";
import { get, ref } from "firebase/database";

/**
 * Retrieves communities from Realtime Database,
 * ordered by member count (highest first).
 */
export const getCommunities = async (
  limitValue: number,
  lastVisible?: string | null
) => {
  try {
    const snapshot = await get(ref(database, "communities"));

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

    // Üye sayısına göre büyükten küçüğe sırala
    communities.sort(
      (a, b) =>
        (b.numberOfMembers || 0) -
        (a.numberOfMembers || 0)
    );

    // Sayfalama (isteğe bağlı)
    let startIndex = 0;

    if (lastVisible) {
      const index = communities.findIndex(
        (community) => community.id === lastVisible
      );

      if (index !== -1) {
        startIndex = index + 1;
      }
    }

    const result = communities.slice(
      startIndex,
      startIndex + limitValue
    );

    const newLastVisible =
      result.length > 0
        ? result[result.length - 1].id
        : null;

    return {
      communities: result,
      newLastVisible,
    };
  } catch (error) {
    console.error("Error getting communities:", error);

    return {
      communities: [],
      newLastVisible: null,
    };
  }
};

export default getCommunities;
