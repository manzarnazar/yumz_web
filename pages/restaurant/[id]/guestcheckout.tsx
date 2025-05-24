//@ts-nocheck
import React, { useEffect, useState } from "react";
import SEO from "components/seo";
import CheckoutContainer from "containers/checkout/checkout";
import CheckoutDelivery from "containers/checkoutDelivery/checkoutDelivery";
import CheckoutProducts from "containers/checkoutProducts/checkoutProducts";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import cartService from "services/cart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { updateUserCart } from "redux/slices/userCart";
import { useTranslation } from "react-i18next";
import getLanguage from "utils/getLanguage";
import { selectCurrency } from "redux/slices/currency";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useMediaQuery } from "@mui/material";
import GuestCheckoutContainer from "containers/checkout/GuestCheckoutContainer";
import GuestCheckoutDelivery from "containers/checkoutDelivery/guestcheckoutDelivery";
import GuestCheckoutProducts from "containers/checkoutProducts/guestcheckoutProducts";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const EditPhone = dynamic(() => import("components/editPhone/editPhone"));

type Props = {};

export default function GuestCheckout({}: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { query, back } = useRouter();
  const shopId = Number(query.id);
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  const [phoneModal, handleOpenPhone, handleClosePhone] = useModal();
  const isDesktop = useMediaQuery("(min-width:1140px)");

  const { data } = useQuery(["shop", shopId, locale], () =>
    shopService.getById(shopId),
  );

  // State to store cartId and uui
  const [cartId, setCartId] = useState<string | null>(null);
  const [uui, setUui] = useState<string | null>(null);

  // Use useEffect to ensure localStorage is only accessed on the client side
  useEffect(() => {
    setCartId(localStorage.getItem("cart_id"));
    setUui(localStorage.getItem("cart_uuid"));
  }, []);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.guestGet(cartId, { currency_id: currency?.id, shop_id: shopId, user_cart_uuid: uui }),
    {
      enabled: !!cartId && !!uui, // Only run the query if cartId and uui are available
      onSuccess: (data) => {
        dispatch(updateUserCart(data.data));
        if (
          data.data.user_carts.flatMap((cart) => cart.cartDetails).length === 0
        ) {
          back();
        }
      },
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  );

  return (
    <>
      <SEO />
      <GuestCheckoutContainer onPhoneVerify={handleOpenPhone} data={data?.data}>
        <GuestCheckoutDelivery />
        <GuestCheckoutProducts loading={isLoading} />
      </GuestCheckoutContainer>
      {isDesktop ? (
        <ModalContainer open={phoneModal} onClose={handleClosePhone}>
          <EditPhone handleClose={handleClosePhone} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={phoneModal} onClose={handleClosePhone}>
          <EditPhone handleClose={handleClosePhone} />
        </MobileDrawer>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const queryClient = new QueryClient();
  const shopId = Number(query.id);
  const locale = getLanguage(req.cookies?.locale);

  await queryClient.prefetchQuery(["shop", shopId, locale], () =>
    shopService.getById(shopId),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};