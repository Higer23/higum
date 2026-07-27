import { database } from "@/firebase/clientApp";
import { CommunitySnippet } from "@/types/community";
import {
  ref,
  runTransaction,
  update,
} from "firebase/database";

/**
 * Joins a user to a community.
 * Creates the user's membership and safely increments the
 * community member count.
 */
export const joinCommunity = async (
  userId: string,
  communityId: string,
  communityImageURL: string,
  isCreatorOrAdmin: boolean
): Promise<CommunitySnippet> => {
  const newSnippet: CommunitySnippet = {
    communityId,
    imageURL: communityImageURL || "",
    isAdmin: isCreatorOrAdmin,
  };

  // Kullanıcı zaten üye mi?
  const memberRef = ref(
    database,
    `communityMembers/${communityId}/${userId}`
  );

  const result = await runTransaction(memberRef, (member: any) => {
    if (member !== null) {
      return;
    }

    return {
      uid: userId,
      communityId,
      imageURL: communityImageURL || "",
      isAdmin: isCreatorOrAdmin,
      joinedAt: Date.now(),
    };
  });

  // Zaten üyeyse tekrar ekleme
  if (!result.committed) {
    return newSnippet;
  }

  // Kullanıcı snippet'ı + topluluk üye sayısını güncelle
  await update(ref(database), {
    [`users/${userId}/communitySnippets/${communityId}`]: {
      communityId,
      imageURL: communityImageURL || "",
      isAdmin: isCreatorOrAdmin,
      joinedAt: Date.now(),
    },
  });

  // Üye sayısını güvenli şekilde arttır
  const memberCountRef = ref(
    database,
    `communities/${communityId}/numberOfMembers`
  );

  await runTransaction(memberCountRef, (count) => {
    return (count || 0) + 1;
  });

  return newSnippet;
};

export default joinCommunity;
