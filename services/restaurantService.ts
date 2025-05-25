// services/serverSeoService.ts
import axios from "axios";

export interface SEOData {
  title: string;
  description: string;
  image: string;
  bag_tax?: number;
}
export const getServerSEOData = async (
  domain: string,
  localData: any
): Promise<SEOData> => {
  const isYumz = domain === "yumz.dk" || domain === "www.yumz.dk";
  const isLocalhost = domain === "localhost"; // Add this line

  if (isYumz || isLocalhost) { // Modify this line
    return {
      title: localData?.data?.translation?.title || "Yumz - Bestil Takeaway & Levering fra Lokale Restauranter",
      description: localData?.data?.translation?.description || "Yumz - Bestil Takeaway & Levering fra Lokale Restauranter",
      image: localData?.data?.logo_img || "https://yumz.dk/images/brand_logo.png",
      bag_tax: localData?.data?.bag_tax || 0,
    };
  }

  try {
    const res = await axios.get(
      `https://api.yumz.dk/api/v1/rest/restaurant-domain/${domain}`
    );
    const restaurant = res.data;

    if (restaurant?.domain && restaurant?.meta_description) {
      return {
        title: `Om ${restaurant.domain} - Bestil Takeaway & Levering`,
        description: restaurant.meta_description,
        image: restaurant.logo_img || "https://yumz.dk/images/brand_logo.png",
        bag_tax: restaurant.bag_tax || 0,
      };
    }

    return getDefaultSEO();
  } catch (error) {
    console.error("SEO fetch error:", error);
    return getDefaultSEO();
  }
};

const getDefaultSEO = (): SEOData => ({
  title: "Yumz - Bestil Takeaway & Levering fra Lokale Restauranter",
  description: "Yumz - Bestil Takeaway & Levering fra Lokale Restauranter",
  image: "https://yumz.dk/images/brand_logo.png",
  bag_tax: 0,
});
