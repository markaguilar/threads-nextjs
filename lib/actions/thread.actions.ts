"use server";

import { connectToDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  connectToDB();

  const createdThread = await Thread.create({
    text,
    author,
    community: null,
  });

  // TODO: Update user model
  await User.findByIdAndUpdate(author, {
    $push: { threads: createdThread._id },
  });

  revalidatePath(path);
}

export async function fetchThread({ pageNumber = 1, pageSize = 30 }) {
  connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // TODO: Fetch the posts that have no parents (top-level threads)
  const postsQuery = Thread.find({ parentID: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Thread.countDocuments({
    parentID: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}
