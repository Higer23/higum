import { database } from "@/firebase/clientApp";
import {
  ref,
  get,
  update,
  runTransaction,
} from "firebase/database";

/**
 * Promotes a user to administrator in a community.
 * If the user is not already a member,
 * they are added automatically.
 */
export const addCommunityAdmin = async (
  communityId: string,
  userId: string,
  communityImageURL?: string
): Promise<void> => {
  const now = Date.now();

  try {
    const memberRef = ref(
      database,
      `communityMembers/${communityId}/${userId}`
    );

    const memberSnapshot = await get(memberRef);

    // Kullanıcı üye değilse oluştur
    if (!memberSnapshot.exists()) {
      await update(ref(database), {
        [`communityMembers/${communityId}/${userId}`]: {
          uid: userId,
          communityId,
          imageURL: communityImageURL || "",
          isAdmin: true,
          joinedAt: now,
          status: "active",
        },

        [`users/${userId}/communitySnippets/${communityId}`]: {
          communityId,
          imageURL: communityImageURL || "",
          isAdmin: true,
          joinedAt: now,
        },
      });

      // Üye sayısını artır
      await runTransaction(
        ref(
          database,
          `communities/${communityId}/numberOfMembers`
        ),
        (count: any) => (count || 0) + 1
      );
    } else {
      // Zaten üyeyse sadece admin yap
      await update(ref(database), {
        [`communityMembers/${communityId}/${userId}/isAdmin`]: true,

        [`users/${userId}/communitySnippets/${communityId}/isAdmin`]: true,
      });
    }

    // Moderatör listesine ekle
    await update(ref(database), {
      [`communities/${communityId}/moderators/${userId}`]: true,
    });
  } catch (error) {
    console.error("addCommunityAdmin:", error);
    throw error;
  }
};

export default addCommunityAdmin;
