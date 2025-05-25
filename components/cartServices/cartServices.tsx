import React, { useEffect, useState } from "react";
import RunFillIcon from "remixicon-react/RunFillIcon";
import cls from "./cartServices.module.scss";
import { useTranslation } from "react-i18next";
import { IShop } from "interfaces";
import Price from "components/price/price";
import { selectCurrency } from "redux/slices/currency";
import { useAppSelector } from "hooks/useRedux";
import { selectUserCart } from "redux/slices/userCart";
import Badge from "components/badge/badge";
import { useBagPrice } from "hooks/useBagPrice";
import { useSettings } from "contexts/settings/settings.context";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@mui/material";

const AddressModal = dynamic(() => import("components/addressModal/addressModal"));

type Props = {
  data: IShop;
  onBagSelectedChange?: (selected: boolean) => void;
  onBagPriceChange?: (price: number) => void;
};

export default function CartServices({ data, onBagSelectedChange, onBagPriceChange }: Props) {
  const { t } = useTranslation();
  const currency = useAppSelector(selectCurrency);
  const cart = useAppSelector(selectUserCart);
  const { address, location, updateAddress, updateLocation } = useSettings();
  const [price, setPrice] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isMatchingCity, setIsMatchingCity] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [editedAddress, setEditedAddress] = useState(null);
  // console.log("mr manzar "m);
  

  useEffect(() => {
    if (address) {
      const add = address.split(",");
      if (add.length > 1) { 
        const filtered = add[add.length - 2]?.trim();
        const extract = filtered?.split(" ");
        const cityExtracted = extract?.length === 1 ? extract[0] : extract?.[1];
  
        const matchingCity = data?.shop_delivery_zipcodes?.find(
          (item) => item.city.toLowerCase() === cityExtracted?.toLowerCase()
        );
  
        if (matchingCity) {
          setDeliveryPrice(Number(matchingCity.delivery_price || 0));
          setIsMatchingCity(true);
          setShowAddressModal(false);
        } else {
          setIsMatchingCity(false);
          setShowAddressModal(true);
        }
      }
    }
  }, [address, data?.shop_delivery_zipcodes]);
  
  const { isBagSelected, setIsBagSelected, bagPrice } = useBagPrice(true);

  useEffect(() => {
    onBagSelectedChange?.(isBagSelected);
  }, [isBagSelected]);

  useEffect(() => {
    onBagPriceChange?.(bagPrice);
  }, []);


  return (
    <div className={cls.wrapper}>
      <div className={cls.flex}>
        <div className={cls.item}>
          <div className={cls.icon}>
            <span className={cls.greenDot} />
            <RunFillIcon />
          </div>
          <div className={cls.row}>
            <h5 className={cls.title}>{t("delivery.price")}</h5>

          </div>
        </div>
        <div className={cls.price}>
          <Price number={deliveryPrice} />
        </div>
      </div>
      <div className={cls.flex}>
          <div className={cls.item}>
            {/* <Badge type="discount" variant="circle" /> */}
            <span></span>
            <div className={cls.row}>
            <h5 className={cls.title}>
              {t("Service gebyr")}
              <span
                className={cls.tooltipIcon}
                tabIndex={0}
                onClick={(e) => e.currentTarget.classList.toggle(cls.active)}
              >
                ?
              </span>
              <div className={cls.tooltipText}>
                Vi opkræver dette lille servicegebyr ved checkout for at dække driftsomkostninger og sikre en gnidningsfri betalingsproces, så vi kan tilbyde en effektiv platform både for kunder og restauranter.
              </div>
            </h5>

              {/* <p className={cls.text}>{t("recipe.discount.definition")}</p> */}
            </div>
          </div>
          <div className={cls.price}>
            <Price number={data.serviceFee} />
          </div>
      </div>
      {data.bag_tax === 1 && typeof isBagSelected !== "undefined" && (
  <div className={cls.flex}>
    <label>
      <input
        type="checkbox"
        checked={isBagSelected}
        onChange={(e) => setIsBagSelected?.(e.target.checked)}
      />
      {t("Bag.tax")}
    </label>
    {isBagSelected && (
      <span className={cls.price}>
        <Price number={bagPrice || 0} />
      </span>
    )}
  </div>
)}
 {showAddressModal && !isMatchingCity && (
        <AddressModal
          open={showAddressModal} 
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
      

      {!!cart.receipt_discount && (
        <div className={cls.flex}>
          <div className={cls.item}>
            <Badge type="discount" variant="circle" />
            <span></span>
            <div className={cls.row}>
              <h5 className={cls.title}>{t("discount")}</h5>
              <p className={cls.text}>{t("recipe.discount.definition")}</p>
            </div>
          </div>
          <div className={cls.price}>
            <Price number={cart.receipt_discount} minus />
          </div>
        </div>
      )}
    </div>
  );
}