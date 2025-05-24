import React from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { Order } from "interfaces";
import OrderProducts from "components/orderProducts/orderProducts";
import OrderInfo from "components/orderInfo/orderInfo";
import OrderImage from "components/orderImage/orderImage";
import cls from "./orderContainer.module.scss";
import GuestOrderInfo from "components/orderInfo/guestorderInfo";

type Props = {
  data?: Order;
  loading: boolean;
};

export default function GuestOrderContainer({ data, loading }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
console.log(data);

  return (
    <div className={cls.root}>
      {!loading && (
        <Grid container spacing={isDesktop ? 4 : 1.5}>
          <Grid item xs={12} md={7} spacing={isDesktop ? 4 : 1.5}>
            <OrderProducts data={data} />
            {!!data?.image_after_delivered && <OrderImage data={data} />}
          </Grid>
          <Grid item xs={12} md={5}>
            <GuestOrderInfo data={data} />
          </Grid>
        </Grid>
      )}
    </div>
  );
}
