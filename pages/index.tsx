import React from "react";
import SEO from "components/seo";
import WelcomeContainer from "containers/welcome/welcome";
import WelcomeHero from "components/welcomeHero/welcomeHero";
import WhyChooseUs from "components/whyChooseUs/whyChooseUs";
import { QueryClient, dehydrate, useQuery } from "react-query";
import useLocale from "hooks/useLocale";
import blogService from "services/blog";
import WelcomeBlog from "components/welcomeBlog/welcomeBlog";
import FaqContainer from "containers/faq/faq";
import faqService from "services/faq";
import { GetServerSideProps } from "next";
import getLanguage from "utils/getLanguage";
import { getCookie } from "utils/session";
import pageService from "services/page";
import { useRouter } from "next/router";
import { useSettings } from "contexts/settings/settings.context";

type Props = {
  isAuthenticated: boolean;
};

export default function Welcome({ isAuthenticated }: Props) {
  console.log("Welcome page loaded. Is Authenticated:", isAuthenticated); // <-- Added log


  // const {address} = useSettings();
  // const { push } = useRouter();
    
  //       console.log("cart",address);

  //       if (address) {
  //   if (typeof window !== "undefined") {
  //     push("/home");
  //   }
  //   return null
  // }



  const { locale } = useLocale();

  const { data } = useQuery(["landingPage", locale], () =>
    pageService.getLandingPage()
  );

  const { data: stats } = useQuery(["stats", locale], () =>
    pageService.getStatistics()
  );

  const { data: blog } = useQuery(["lastBlog", locale], () =>
    blogService.getLastBlog()
  );

  const { data: faqs } = useQuery(["faqs", locale], () => faqService.getAll());

  return (
    <>
      <SEO />
      <WelcomeContainer>
        <WelcomeHero data={data?.data?.data} stats={stats?.data} />
        <WhyChooseUs data={data?.data?.data} />
        <WelcomeBlog data={blog?.data} />
        <FaqContainer data={faqs?.data} />
      </WelcomeContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const queryClient = new QueryClient();
    const locale = getLanguage(getCookie("locale", ctx)); // Get the locale
    const authToken = getCookie("access_token", ctx); // Get the auth token from cookies
    const isAuthenticated = authToken ? true : false; // Check if the user is authenticated

    // If authenticated, redirect to /home
    // if (isAuthenticated) {
    //   return {
    //     redirect: {
    //       destination: "/home",  // Redirect to /home if authenticated
    //       permanent: false,
    //     },
    //   };
    // }

    // Prefetch landing page data
    await queryClient.prefetchQuery(["landingPage", locale], () =>
      pageService.getLandingPage()
    );

    return {
      props: {
        dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
        isAuthenticated,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      notFound: true, // Return 404 page on error
    };
  }
};
