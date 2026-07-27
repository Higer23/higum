import { database } from "@/firebase/clientApp";
import { CommunitySnippet } from "@/types/community";
import {
  ref,
  runTransaction,
  update,
} from "firebase/database";

/**
 * Joins a user to a community.
 * Creates the membership if it does not already exist
 * and safely increments the member count.
 */
export const joinCommunity = async (
  userId: string,
  communityId: string,
  communityImageURL: string,
  isCreatorOrAdmin: boolean
): Promise<CommunitySnippet> => {
  const now = Date.now();

  const newSnippet: CommunitySnippet = {
    communityId,
    imageURL: communityImageURL || "",
    isAdmin: isCreatorOrAdmin,
  };

  try {
    // Kullanıcı zaten üye mi?
    const memberRef = ref(
      database,
      `communityMembers/${communityId}/${userId}`
    );

    const result = await runTransaction(
      memberRef,
      (member: any) => {
        if (member !== null) {
          return;
        }

        return {
          uid: userId,
          communityId,
          imageURL: communityImageURL || "",
          isAdmin: isCreatorOrAdmin,
          joinedAt: now,
          status: "active",
        };
      }
    );

    // Kullanıcı zaten üyeyse tekrar ekleme
    if (!result.committed) {
      return newSnippet;
    }

    // Kullanıcının snippet'ını oluştur
    await update(ref(database), {
      [`users/${userId}/communitySnippets/${communityId}`]: {
        communityId,
        imageURL: communityImageURL || "",
        isAdmin: isCreatorOrAdmin,
        joinedAt: now,
      },
    });

    // Üye sayısını güvenli şekilde artır
    const memberCountRef = ref(
      database,
      `communities/${communityId}/numberOfMembers`
    );

    await runTransaction(memberCountRef, (count: any) => {
      return (count || 0) + 1;
    });

    return newSnippet;
  } catch (error) {
    console.error("joinCommunity:", error);
    throw error;
  }
};

export default joinCommunity;
