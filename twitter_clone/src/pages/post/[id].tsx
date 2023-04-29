import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
dayjs.extend(relativeTime);

const SingalePostPage: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //Start fetching the posts early
  api.posts.getAll.useQuery();

  // return an empty div if the user or posts are not loaded
  if (!userLoaded) return <div />;

  return (
    <> 
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>Posts View</div>
      </main>
    </>
  );
};

export default SingalePostPage;
