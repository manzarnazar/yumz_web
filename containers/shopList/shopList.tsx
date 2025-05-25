import React from "react";
import { IShop } from "interfaces";
import cls from "./shopList.module.scss";
import { Grid, Skeleton, useMediaQuery } from "@mui/material";
import ShopCard from "components/shopCard/shopCard";

type Props = {
  title?: string;
  shops: IShop[];
  loading?: boolean;
};

export default function ShopList({ title, shops, loading }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const host = typeof window !== "undefined" ? window.location.host : "";

  // Filter shops based on host condition
 const filteredShops =
  host && !host.includes('yumz.dk') && !host.includes('localhost') && !host.includes('www.yumz.dk')
    ? shops.filter((item) => item.domain === host)
    : shops;
  return (
    <section
      className="container"
      style={{
        display: !loading && shops.length === 0 ? "none" : "block",
      }}
    >
      <div className={cls.container}>
        <div className={cls.header}>
          <h2 className={cls.title}>{title}</h2>
        </div>
        <Grid container spacing={isDesktop ? 4 : 2}>
          {!loading
            ? filteredShops.map((item) => (
                <Grid key={item.id} item xs={12} sm={6} lg={3}>
                  <ShopCard data={item} />
                </Grid>
              ))
            : Array.from(new Array(4)).map((item, idx) => (
                <Grid key={"shops" + idx} item xs={12} sm={6} lg={3}>
                  <Skeleton variant="rectangular" className={cls.shimmer} />
                </Grid>
              ))}
        </Grid>
      </div>
    </section>
  );
}
