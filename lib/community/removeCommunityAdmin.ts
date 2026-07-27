import { database } from "@/firebase/clientApp";
import {
  get,
  ref,
  runTransaction,
  update,
} from "firebase/database";

/**
 * Removes admin permission from a community member.
 * User remains in the community.
 */
export const removeCommunityAdmin = async (
  communityId: string,
  userId: string
): Promise<void> => {
  // Community mevcut mu?
  const communityRef = ref(
    database,
    `communities/${communityId}`
  );

  const communitySnapshot = await get(communityRef);

  if (!communitySnapshot.exists()) {
    throw new Error("Community not found.");
  }

  // Admin listesinden kaldır
  await runTransaction(
    ref(database, `communities/${communityId}/adminIds`),
    (admins: string[] | null) => {
      if (!admins) return [];

      return admins.filter((id) => id !== userId);
    }
  );

  // communityMembers güncelle
  await update(
    ref(
      database,
      `communityMembers/${communityId}/${userId}`
    ),
    {
      isAdmin: false,
    }
  );

  // Kullanıcının snippetını güncelle
  await update(
    ref(
      database,
      `users/${userId}/communitySnippets/${communityId}`
    ),
    {
      isAdmin: false,
    }
  );
};

export default removeCommunityAdmin;
