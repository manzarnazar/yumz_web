import axios from "axios";

export interface ShopLocation {
  locale: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
}

export const getAllShopLocations = async (): Promise<ShopLocation[]> => {
  const perPage = 50;
  let page = 1;
  let allLocations: ShopLocation[] = [];
  const seenCityZipPairs = new Set<string>();

  try {
    while (true) {
      const res = await axios.get(
        `https://api.yumz.dk/api/v1/rest/shops/paginate?type=shop&page=${page}&perPage=${perPage}`
      );

      const data = res.data?.data || [];
      if (data.length === 0) break;

      for (const shop of data) {
        const deliveryZipcodes = shop?.shop_delivery_zipcodes || [];

        for (const zipcodeObj of deliveryZipcodes) {
          const city = zipcodeObj.city?.trim();
          const zipcode = zipcodeObj.zip_code?.trim();

          if (!city || !zipcode) continue;

          const cityZipKey = `${city.toLowerCase()}-${zipcode}`;
          if (seenCityZipPairs.has(cityZipKey)) continue;

          seenCityZipPairs.add(cityZipKey);

          allLocations.push({
            locale: shop?.translation?.locale || "",
            city,
            zipcode,
            latitude: shop?.location?.latitude || "",
            longitude: shop?.location?.longitude || "",
          });
        }
      }

      if (data.length < perPage) break;
      page++;
    }

    return allLocations;
  } catch (error) {
    console.error("Error fetching shop locations:", error);
    return [];
  }
};

