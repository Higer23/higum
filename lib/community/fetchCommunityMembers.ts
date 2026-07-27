import { database } from "@/firebase/clientApp";
import { CommunityMember } from "@/types/communityMember";
import { get, ref } from "firebase/database";

/**
 * Retrieves all members of a community from Realtime Database.
 */
export const fetchCommunityMembers = async (
  communityId: string
): Promise<CommunityMember[]> => {
  try {
    const snapshot = await get(
      ref(database, `communityMembers/${communityId}`)
    );

    if (!snapshot.exists()) {
      return [];
    }

    const membersData = snapshot.val();

    const members = await Promise.all(
      Object.keys(membersData).map(async (uid) => {
        const userSnapshot = await get(
          ref(database, `users/${uid}`)
        );

        const userData = userSnapshot.exists()
          ? userSnapshot.val()
          : {};

        return {
          uid,
          email: userData.email || "Unknown email",
          displayName: userData.displayName || null,
          imageURL: userData.photoURL || "",
          isAdmin: membersData[uid].isAdmin || false,
          joinedAt: membersData[uid].joinedAt || 0,
        } as CommunityMember;
      })
    );

    members.sort((a, b) => {
      const nameA = (a.displayName || a.email).toLowerCase();
      const nameB = (b.displayName || b.email).toLowerCase();

      return nameA.localeCompare(nameB);
    });

    return members;
  } catch (error) {
    console.error("fetchCommunityMembers:", error);
    return [];
  }
};

export default fetchCommunityMembers;
