import { database } from "@/firebase/clientApp";
import { get, ref } from "firebase/database";
import safeJsonStringify from "safe-json-stringify";
import { Community } from "@/types/community";

/**
 * Retrieves a community from Firebase Realtime Database.
 * Returns null if the community does not exist.
 */
export const getCommunityData = async (
  communityId: string
): Promise<Community | null> => {
  try {
    if (!communityId) {
      return null;
    }

    const snapshot = await get(
      ref(database, `communities/${communityId}`)
    );

    if (!snapshot.exists()) {
      return null;
    }

    const community: Community = {
      id: communityId,
      ...(snapshot.val() as Community),
    };

    return JSON.parse(
      safeJsonStringify(community)
    ) as Community;
  } catch (error) {
    console.error("getCommunityData:", error);
    return null;
  }
};

export default getCommunityData;
