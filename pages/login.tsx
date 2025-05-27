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
  const authToken = getCookie("access_token", ctx); // Get the auth token from cookies


  const isAuthenticated = !!authToken;

  const [seoData, setSeoData] = useState<SEOData | null>(null);

  useEffect(() => {
    const fetchSEO = async () => {
      const domain = window.location.hostname;
      const localData = {}; // pass real localData if needed
      const data = await getServerSEOData(domain, localData);
      setSeoData(data);
    };

    fetchSEO();
  }, []);

  console.log("Client SEO Data:", seoData?.restaurant?.id);




  if (isAuthenticated) {

    const domain = window.location.hostname;
    const allowedDomains = ["yumz.dk", "www.yumz.dk", "localhost"];

    if (!allowedDomains.includes(domain)) {
      return {
        redirect: {
          destination: `/restaurant/${seoData?.restaurant?.id}`,
          permanent: false,
        },
      };
    }
    else
      return {
        redirect: {
          destination: "/home", // Or another authenticated route
          permanent: false,
        },
      };
  }

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(queryClient.getQueryCache())),
    },
  };
};