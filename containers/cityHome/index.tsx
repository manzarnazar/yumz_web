import { useEffect, useRef, useState, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import qs from "qs";
import shopService from "services/shop";
import bannerService from "services/banner";
import storyService from "services/story";
import categoryService from "services/category";
import { useAppSelector } from "hooks/useRedux";
import { selectShopFilter } from "redux/slices/shopFilter";
import dynamic from "next/dynamic";
import AppSection from "containers/appSection/appSection";
import pageService from "services/page";

const ShopCategoryList = dynamic(() => import("containers/shopCategoryList/v1"));
const BannerContainer = dynamic(() => import("containers/banner/banner"));
const StoreList = dynamic(() => import("containers/storeList/storeList"));
const ShopList = dynamic(() => import("containers/shopList/shopList"));
const FeaturedShopsContainer = dynamic(() => import("containers/featuredShopsContainer/featuredShopsContainer"));
const AdList = dynamic(() => import("containers/adList/v1"));
const ZoneNotFound = dynamic(() => import("components/zoneNotFound/zoneNotFound"));
const NewsContainer = dynamic(() => import("containers/newsContainer/newsContainer"));
const Loader = dynamic(() => import("components/loader/loader"));

const PER_PAGE = 12;

export default function CityHome({ city }: { city: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const loader = useRef(null);
  const { category_id, newest, order_by, group } = useAppSelector(selectShopFilter);
  const [zipCode, setZipCode] = useState("00000"); // Optional: Fetch real zip from API based on city
  const [showAppSection, setShowAppSection] = useState(false);

  const isFilterActive = !!Object.keys(group).length;

  const { data: shopCategoryList, isLoading: shopCategoryLoading } = useQuery(
    ["shopcategory", locale],
    () => categoryService.getAllShopCategories({ perPage: 20 })
  );

  const { data: banners, isLoading: isBannerLoading } = useQuery(
    ["banners", locale],
    () => bannerService.getAll()
  );

  const { data: stories, isLoading: isStoriesLoading } = useQuery(
    ["stories", locale],
    () => storyService.getAll()
  );

  const { data: shops, isLoading: isShopLoading } = useQuery(
    ["shops", city],
    () =>
      shopService.getAllShops(
        qs.stringify({
          city,
          zip_code: zipCode,
          perPage: PER_PAGE,
          open: 1,
        })
      )
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isRestaurantLoading,
  } = useInfiniteQuery(
    ["restaurants", city, category_id, newest, group],
    ({ pageParam = 1 }) =>
      shopService.getAllRestaurants(
        qs.stringify({
          city,
          zip_code: zipCode,
          page: pageParam,
          perPage: PER_PAGE,
          category_id: category_id || undefined,
          order_by: newest ? "new" : order_by,
          free_delivery: group.free_delivery,
          take: group.tag,
          rating: group.rating?.split(","),
          prices: group.prices,
          open: Number(group.open) || undefined,
          deals: group.deals,
        })
      ),
    {
      getNextPageParam: (lastPage: any) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
    }
  );

  const restaurants = data?.pages?.flatMap((item) => item?.data || []) || [];

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    });
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Fetching About Data
  const { data: aboutData, isLoading: isAboutDataLoading } = useQuery(
    ["sections", locale],
    () => pageService.getAboutSections(),
    {
      select: (data) => {
        if (data.data.length > 1) {
          return {
            about: data.data.find((item) => item.type === "about"),
            sections: data.data.filter((item) => item.type !== "about"),
          };
        }
        return {
          about: data.data[0],
          sections: [],
        };
      },
    }
  );
  console.log("dataabout", aboutData);
  // Handle when data is still loading
  if (isAboutDataLoading) {
    return <Loader />;
  }
// Function to extract city from the title
const extractCityFromTitle = (title:any) => {
    const match = title.match(/^Bestil mad i (.+)$/);
    return match ? match[1].trim() : null; // Extract city from title
  };
  
  // Function to check if the city matches and display AppSection
  const shouldDisplayAppSection = (title:any, city:any, section:any) => {
    
    const extractedCity = extractCityFromTitle(title);
    console.log("extractedCity", extractedCity);
    if (extractedCity?.toLowerCase() === city.toLowerCase()) {
        return section
    }
    return null;
   
  };
  const matchedSections = aboutData?.sections.filter((section) =>
    shouldDisplayAppSection(section?.translation?.title, city, section)
  );
  console.log("matchedSections", matchedSections);

  return (
    <>
      <ShopCategoryList
        data={shopCategoryList?.data?.sort((a, b) => a?.input - b?.input) || []}
        loading={shopCategoryLoading}
      />
      <BannerContainer
        stories={stories || []}
        banners={banners?.data || []}
        loadingStory={isStoriesLoading}
        loadingBanner={isBannerLoading}
      />
      <StoreList title={(`Bestil mad i ${city.charAt(0).toUpperCase()}${city.slice(1)}`)} shops={shops?.data || []} loading={isShopLoading} />
      <AdList data={[]} loading={false} />
      
      <NewsContainer />
      <div>
        <div 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
              
            onClick={() => setShowAppSection(!showAppSection)}
        >
           {t("more_info_title", { city: city.charAt(0).toUpperCase() + city.slice(1) }) || `Sulten? oplev mad i ${city.charAt(0).toUpperCase()}${city.slice(1)}`}

            <span style={{ marginLeft: "8px", fontSize: "24px" }}>
            {showAppSection ? "−" : "+"}
            </span>
        </div>

        {showAppSection && <AppSection data={matchedSections} />}
    </div>

      

    </>
  );
}
