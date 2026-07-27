import { database } from "@/firebase/clientApp";
import { get, ref } from "firebase/database";
import safeJsonStringify from "safe-json-stringify";

/**
 * Retrieves community data from Realtime Database.
 * @param communityId - Community id.
 * @returns Community object or null.
 */
export async function getCommunityData(communityId: string) {
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

    const community = snapshot.val();

    return JSON.parse(
      safeJsonStringify({
        id: communityId,
        ...community,
      })
    );
  } catch (error) {
    console.error("Error: getCommunityData", error);
    return null;
  }
}

export default getCommunityData;
