import { currentUser } from "@clerk/nextjs";
import { fetchThread } from "@/lib/actions/thread.actions";

export default async function Home() {
  const user = await currentUser();
  const result = await fetchThread(1, 30);

  console.log(result);
  return (
    <div>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.comments}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
