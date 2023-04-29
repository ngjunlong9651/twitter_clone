import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
dayjs.extend(relativeTime);
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generatessgHelpers } from "~/server/helpers/ssgHelpers";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div> User has not posted </div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

interface ProfilePageProps {
  username: string;
}

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div> Error 404: Not Found</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @ ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generatessgHelpers();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("slug is not a string");

  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      id,
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
