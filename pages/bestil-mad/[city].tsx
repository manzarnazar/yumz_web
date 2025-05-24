// pages/city/[city].tsx

import SEO from "components/seo";
import FooterMenu from "containers/footerMenu/footerMenu";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import {
    META_DESCRIPTION
  } from "constants/config";
const CityHomeContent = dynamic(() => import("containers/cityHome/index"));

type Props = {
  city: string;
};

export default function CityPage({ city }: Props) {
  return (
    <>
      <SEO title={`Oplev restauranter i ${city.charAt(0).toUpperCase()}${city.slice(1)}`}  description={META_DESCRIPTION}/>
      <CityHomeContent city={city} />
      <FooterMenu />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const city = ctx.params?.city || "";

  return {
    props: {
      city,
    },
  };
};
