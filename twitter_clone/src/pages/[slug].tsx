import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
dayjs.extend(relativeTime);

interface ProfilePageProps {
  username: string;
}

const ProfilePage: NextPage<ProfilePageProps> = ({ username }) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: username,
  });

  if (isLoading) {
    console.log("Is Loading");
  }

  console.log(data);
  if (!data) return <div> Error 404: Not Found</div>;

  // return an empty div if the user or posts are not loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            width={128}
            height={128}
            alt={`${data.username ?? ""}'s profile image`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>

        <div className="h-[64px]"> </div>
        <div className="p-4 text-2xl font-bold">
          {`User: @${data.username ?? ""}`}
        </div>
        <div className="w-full border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import Image from "next/image";

export const getStaticProps: GetStaticProps<ProfilePageProps> = async (
  context
) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug is not a string");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      username,
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
