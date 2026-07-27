import { database } from "@/firebase/clientApp";
import { CommunityMember } from "@/types/communityMember";
import { get, ref } from "firebase/database";

/**
 * Retrieves all members of a community
 * from Firebase Realtime Database.
 */
export const fetchCommunityMembers = async (
  communityId: string
): Promise<CommunityMember[]> => {
  try {
    const membersSnapshot = await get(
      ref(database, `communityMembers/${communityId}`)
    );

    if (!membersSnapshot.exists()) {
      return [];
    }

    const membersData = membersSnapshot.val();

    const members: CommunityMember[] = await Promise.all(
      Object.entries(membersData).map(
        async ([uid, member]: any) => {
          const userSnapshot = await get(
            ref(database, `users/${uid}`)
          );

          const user = userSnapshot.exists()
            ? userSnapshot.val()
            : {};

          return {
            uid,

            email: user.email || "Unknown email",

            displayName:
              user.displayName ||
              user.username ||
              null,

            imageURL:
              user.photoURL ||
              user.imageURL ||
              "",

            isAdmin: member.isAdmin || false,

            joinedAt: member.joinedAt || 0,

            status: member.status || "active",

            karma: user.karma || 0,
          } as CommunityMember;
        }
      )
    );

    members.sort((a, b) => {
      // Önce adminler
      if (a.isAdmin !== b.isAdmin) {
        return a.isAdmin ? -1 : 1;
      }

      const nameA = (
        a.displayName || a.email
      ).toLowerCase();

      const nameB = (
        b.displayName || b.email
      ).toLowerCase();

      return nameA.localeCompare(nameB);
    });

    return members;
  } catch (error) {
    console.error(
      "fetchCommunityMembers:",
      error
    );

    return [];
  }
};

export default fetchCommunityMembers;
