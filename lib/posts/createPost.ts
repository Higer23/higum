import { database, storage } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { User } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {
  ref as dbRef,
  push,
  set,
  update,
} from "firebase/database";

export const createPost = async (
  user: User,
  communityId: string,
  communityImageURL: string | undefined,
  postData: {
    title: string;
    body: string;
  },
  selectedFile?: string
) => {
  try {
    const postRef = push(dbRef(database, "posts"));

    const postId = postRef.key!;

    const newPost: Post = {
      id: postId,
      communityId,
      communityImageURL: communityImageURL ?? "",
      creatorId: user.uid,
      creatorUsername:
        user.displayName ?? user.email?.split("@")[0] ?? "Unknown",
      title: postData.title.trim(),
      body: postData.body.trim(),
      numberOfComments: 0,
      voteStatus: 0,
      createTime: Date.now(),
    };

    await set(postRef, newPost);

    if (selectedFile) {
      const imageRef = ref(storage, `posts/${postId}/image`);

      await uploadString(imageRef, selectedFile, "data_url");

      const imageURL = await getDownloadURL(imageRef);

      await update(dbRef(database, `posts/${postId}`), {
        imageURL,
      });
    }

    return postId;
  } catch (error) {
    console.error("createPost:", error);
    throw error;
  }
};
