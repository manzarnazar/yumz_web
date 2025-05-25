import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SEO from "components/seo";
import StoreContainer from "containers/storeContainer/storeContainer";
import ShopHeader from "containers/shopHeader/shopHeader";
import ProductList from "containers/productList/productList";
import { useMediaQuery } from "@mui/material";
import MobileShopNavbar from "containers/mobileShopNavbar/mobileShopNavbar";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import productService from "services/product";
import { CategoryWithProducts } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { useTranslation } from "react-i18next";
import { clearProduct, selectProduct } from "redux/slices/product";
import dynamic from "next/dynamic";
import { getCookie, removeCookie } from "utils/session";
import getImage from "utils/getImage";
import getLanguage from "utils/getLanguage";
import useDebounce from "hooks/useDebounce";
import Empty from "components/empty/empty";
import { error as toastError } from "components/alert/toast";
import axios from 'axios';
import { getServerSEOData } from "services/restaurantService";
import { useSettings } from "contexts/settings/settings.context";
import AddressModal from "components/addressModal/addressModal";
const ModalContainer = dynamic(() => import("containers/modal/modal"));
const ProductContainer = dynamic(
  () => import("containers/productContainer/productContainer"),
);
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const PageLoading = dynamic(() => import("components/loader/pageLoading"));
const CategorySearchInput = dynamic(
  () => import("components/categorySearchInput/categorySearchInput"),
);

type Props = {
  memberState: any;
  seo: any
};

const renderProductList = (
  items: CategoryWithProducts[] = [],
  loading: boolean,
  noProductsFoundText: string,
  isPopularVisible?: boolean,
  title?: string,
) => {
  if (loading) {
    return Array.from(Array(3).keys()).map((_, index) => (
      <Fragment key={index}>
        <ProductList products={[]} loading={loading} />
      </Fragment>
    ));
  }
  if (!isPopularVisible && !items?.length) {
    return <Empty text={noProductsFoundText} />;
  }
  if (!items?.length) {
    return <div />;
  }
  return items?.map((item) => {
    return (
      <Fragment key={item.id}>
        <ProductList
          uuid={item.uuid}
          title={title || item.translation?.title}
          products={
            item.products.concat(
              item.children?.length > 0
                ? item.children.flatMap((child) => child.products)
                : [],
            ) || []
          }
          loading={loading}
        />
      </Fragment>
    );
  });
};

export default function ShopSingle({ memberState,seo }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const isBigDesktop = useMediaQuery("(min-width:1799px)");
  const { query, replace } = useRouter();
  const shopId = Number(query.id);
  const currency = useAppSelector(selectCurrency);
  const { product, isOpen } = useAppSelector(selectProduct);
  const dispatch = useAppDispatch();
  const isOpenProduct = Boolean(query.product) || isOpen;
  const uuid = String(query.product || "");
  const searchScrollTo = useRef<HTMLDivElement | null>(null);

  const [showAddressModal, setShowAddressModal] = useState(false);
    const [editedAddress, setEditedAddress] = useState(null);
  

  const [isSearchCategorySearchOpen, setIsSearchCategorySearchOpen] =
    useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debounceSearchValue = useDebounce(searchValue, 500);
   const router = useRouter();
    const { payment } = router.query;
  
    console.log("this is a test log 123, ", seo);
    
    const { address, location, updateAddress, updateLocation } = useSettings();
      


      
  
    useEffect(() => {
      if (payment === 'failed') {
        toastError("Betaling mislykkedes!");
  
  
      }
        
  
      }, [payment, router]);

//       useEffect(() => {
//   if(location == "56.2639,9.5018"){
//     setShowAddressModal(true);
//   } else {
//     setShowAddressModal(false);
//   }
// }, [location]);

  useEffect(() => {
    const currentDomain = window.location.origin;
    console.log("Current domain:", currentDomain);
   
    if (products?.data?.all?.length && isSearchCategorySearchOpen) {
      if (debounceSearchValue?.length) {
        handleSearch(debounceSearchValue);
      } else {
        setFilteredProducts(products?.data?.all || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSearchValue]);

  const { data, error } = useQuery(
    ["shop", shopId, locale],
    () => shopService.getById(shopId),
    
    { keepPreviousData: true },
  );
  // console.log("what a address",address);

  // const addressParts = address.split(",");
  // const filter = addressParts[addressParts.length - 2]?.trim() || "";
  // const extracted = filter.split(" ");
  // let cityExtracted = extracted.length == 1 ? extracted?.[0] : extracted?.[1];
  
  // console.log("",cityExtracted);
  
  // console.log("check if address",data?.data.shop_delivery_zipcodes![].city);

   const addressParts = address ? address.split(",") : "";
  const filter = addressParts[addressParts.length - 2]?.trim() || "";
  const extracted = filter.split(" ");
  let cityExtracted = extracted.length == 1 ? extracted?.[0] : extracted?.[1];

  
  const deliveryCities = data?.data?.shop_delivery_zipcodes?.map(zip => zip.city) || [];
  console.log("deliveryCities",deliveryCities);
  
  

  const isCityValid = cityExtracted && deliveryCities.some(city => 
    city?.toLowerCase() === cityExtracted?.toLowerCase()
  );

  // Show address modal if city is not valid
  useEffect(() => {
    if (address && deliveryCities.length > 0 && !isCityValid) {
      setShowAddressModal(true);
    } else {
      setShowAddressModal(false);
    }
  }, [address, deliveryCities, isCityValid]);

  

  const { data: products, isLoading } = useQuery(
    [
      "products",
      shopId,
      currency?.id,
      locale,
      query?.category_id,
      query?.sub_category_id,
      query?.brands,
    ],
    () => {
      let params: Record<string, string | undefined | number | string[]> = {
        currency_id: currency?.id,
        category_id: query?.sub_category_id || query?.category_id || undefined,
      };
      if (query?.brands) {
        if (Array.isArray(query.brands)) {
          delete params["brand_ids[0]"];
          params = Object.assign(
            params,
            ...query?.brands?.map((brand, index) => ({
              [`brand_ids[${index}]`]: brand,
            })),
          );
        } else {
          params = Object.assign(params, { [`brand_ids[0]`]: query?.brands });
        }
      }

      return productService.getAllShopProducts(shopId, params);
    },
    {
      staleTime: 0,
      onSuccess: (data) => {
        setFilteredProducts(data?.data?.all || []);
      },
    },
  );


  

  const [filteredProducts, setFilteredProducts] = useState(
    products?.data?.all || [],
  );

  const extractedCategories = useMemo(
    () => products?.data?.all?.map((item: any) => ({ ...item, products: [] })),
    [products?.data?.all],
  );

  const handleCloseProduct = () => {
    dispatch(clearProduct());
    const params: Record<string, string | undefined | number> = {
      id: shopId,
    };
    if (query?.category_id) {
      params.category_id = query?.category_id as string;
    }
    if (query?.sub_category_id) {
      params.sub_category_id = query?.sub_category_id as string;
    }
    if (uuid) {
      replace(
        {
          query: params,
        },
        undefined,
        { shallow: true },
      );
    }
  };

  const handleCloseCategorySearch = () => {
    if (!searchValue?.length) {
      setIsSearchCategorySearchOpen(false);
    } else {
      setSearchValue("");
    }
  };

  const handleSearch = useCallback(
    (search: string = "") => {
      const filtered: any = [];

      if (searchScrollTo.current) {
        const rect = searchScrollTo.current?.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isInViewport) {
          window.scrollTo({
            top:
              searchScrollTo.current?.offsetTop -
              (isBigDesktop ? 70 : isDesktop ? 50 : 30),
            // behavior: "smooth",
          });
        }
      }

      for (let i = 0; i < products?.data?.all?.length; i++) {
        const category = products?.data?.all?.[i];
        const categoryWithoutProduct = {
          ...products?.data?.all?.[i],
          products: [],
        };
        for (let j = 0; j < category?.products?.length; j++) {
          const product = category?.products?.[j];
          if (
            product?.translation?.title
              ?.toLowerCase()
              ?.includes(search?.toLowerCase())
          ) {
            categoryWithoutProduct?.products?.push(product);
          }
        }
        if (categoryWithoutProduct?.products?.length) {
          filtered?.push(categoryWithoutProduct);
        }
      }
      setFilteredProducts(filtered);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products?.data?.all],
  );

  if (error) {
    console.log("error => ", error);
    replace("/");
    return <PageLoading />;
  }

  const renderCategoryNavigation = () => {
    if (isSearchCategorySearchOpen) {
      return (
        <CategorySearchInput
          searchTerm={searchValue}
          setSearchTerm={setSearchValue}
          handleClose={handleCloseCategorySearch}
        />
      );
    }
    return (
      <MobileShopNavbar
        categories={extractedCategories || []}
        loading={isLoading}
        isPopularVisible={!!products?.data?.recommended?.length}
        openSearch={() => setIsSearchCategorySearchOpen(true)}
      />
    );
  };
  console.log("SEO data:", {
    title: data?.data?.translation?.title,
    description: data?.data?.translation?.description,
    image: getImage(data?.data?.logo_img),
  });
  
  return (
    <>
      <SEO
        title={data?.data?.translation?.title}
        description={data?.data?.translation?.description}
        image={getImage(data?.data?.logo_img)}
      />
    {showAddressModal && (
        <AddressModal
          open={showAddressModal}
          city={deliveryCities} 
          fromshop={true}
          // onClose={() => {
          //   setShowAddressModal(false);
          // }}
          latlng={location}
          address={address}
          fullScreen={!isDesktop}
          editedAddress={editedAddress}
          onClearAddress={() => {
            setEditedAddress(null);
            setShowAddressModal(false);
          }}
  
        />
      )}
      <StoreContainer
        data={data?.data}
        memberState={memberState}
        categories={extractedCategories || []}
      >
        <ShopHeader />
        <div ref={searchScrollTo} />
        {renderCategoryNavigation()}
        {!!products?.data?.recommended?.length &&
        !debounceSearchValue?.length ? (
          <ProductList
            title={t("popular")}
            products={products?.data?.recommended || []}
            loading={isLoading}
          />
        ) : (
          <div />
        )}
        {renderProductList(
          filteredProducts,
          isLoading,
          t("no.products.found"),
          !!products?.data?.recommended?.length && !debounceSearchValue?.length,
        )}
        {isDesktop ? (
          <ModalContainer open={!!isOpenProduct} onClose={handleCloseProduct}>
            <ProductContainer
              handleClose={handleCloseProduct}
              data={product}
              uuid={uuid}
            />
          </ModalContainer>
        ) : (
          <MobileDrawer open={!!isOpenProduct} onClose={handleCloseProduct}>
            <ProductContainer
              handleClose={handleCloseProduct}
              data={product}
              uuid={uuid}
            />
          </MobileDrawer>
        )}
      </StoreContainer>
    </>
  );
}



export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  const shopId = Number(ctx.query.id);
  const groupId = Number(ctx.query.g);
  let memberState = getCookie("member", ctx);
  const locale = getLanguage(ctx.req.cookies?.locale);
  const domain = ctx.req.headers.host || "";

  console.log("memberState => ", memberState);
  if (memberState && groupId) {
    if (memberState.cart_id !== groupId) {
      removeCookie("member");
      memberState = null;
    }
  }

  const shopData = await queryClient.prefetchQuery(["shop", shopId, locale], () =>
    shopService.getById(shopId),
  );
  const seo = await getServerSEOData(domain, shopData);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      memberState,
      seo,
    },
  };
};
