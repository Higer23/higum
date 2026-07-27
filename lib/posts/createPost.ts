import { database, storage } from "@/firebase/clientApp";
import { Post } from "@/types/post";
import { User } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {
  ref as dbRef,
  push,
  set,
  serverTimestamp,
} from "firebase/database";

export const createPost = async (
  user: User,
  communityId: string,
  communityImageURL: string |undefined,
  postData: {
    title: string;
    body: string;
  },
  selectedFile?: string
) => {
  const postRef = push(dbRef(database, "posts"));

  const newPost: Post = {
    communityId,
    communityImageURL: communityImageURL || "",
    creatorId: user.uid,
    creatorUsername: user.displayName || user.email!.split("@")[0],
    title: postData.title,
    body: postData.body,
    numberOfComments: 0,
    voteStatus: 0,
    createTime: Date.now() as any,
  };

  await set(postRef, newPost);

  if (selectedFile) {
    const imageRef = ref(storage, `posts/${postRef.key}/image`);

    await uploadString(imageRef, selectedFile, "data_url");

    const downloadURL = await getDownloadURL(imageRef);

    await set(
      dbRef(database, `posts/${postRef.key}/imageURL`),
      downloadURL
    );
  }

  return postRef.key;
};
