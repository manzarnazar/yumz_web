import React, { useEffect, useState } from "react";
import SEO from "components/seo";
import AuthContainer from "containers/auth/auth";
import LoginForm from "components/loginForm/loginForm";
import SocialLogin from "components/socialLogin/socialLogin";
import { GetServerSideProps } from "next";
import { QueryClient } from "react-query";
import { getCookie } from "utils/session";
import { getServerSEOData, SEOData } from "services/restaurantService";

type Props = {};

export default function Login({ }: Props) {
  return (
    <>
      <SEO />
      <AuthContainer>
        <LoginForm />
        <SocialLogin />
      </AuthContainer>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  const authToken = getCookie("access_token", ctx); // server-side cookie
  const isAuthenticated = !!authToken;

  let seoData: SEOData | null = null;

  // Fetch SEO data server-side using the host from headers
  const domain = ctx.req.headers.host || "";
  const localData = {}; // Provide real data if needed

  try {
    seoData = await getServerSEOData(domain, localData);
  } catch (error) {
    console.error("Failed to fetch SEO data:", error);
  }

  if (isAuthenticated) {
    const allowedDomains = ["yumz.dk", "www.yumz.dk", "localhost"];

    if (!allowedDomains.includes(domain)) {
      return {
        redirect: {
          destination: `/restaurant/${seoData?.restaurant?.id ?? "fallback-id"}`,
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: "/home",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(queryClient.getQueryCache())),
    },
  };
};
