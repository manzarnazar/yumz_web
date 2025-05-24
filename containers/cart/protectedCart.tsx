import React, { useEffect, useState } from "react";
import cls from "./cart.module.scss";
import CartServices from "components/cartServices/cartServices";
import CartTotal from "components/cartTotal/cartTotal";
import EmptyCart from "components/emptyCart/emptyCart";
import { IShop, UserCart } from "interfaces";
import ProtectedCartProduct from "components/cartProduct/protectedCartProduct";
import ProtectedCartHeader from "components/cartHeader/protectedCartHeader";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Loading from "components/loader/loading";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import { selectCurrency } from "redux/slices/currency";
import { useSettings } from "contexts/settings/settings.context";

type Props = {
  shop: IShop;
};

export default function ProtectedCart({ shop }: Props) {
  const cart = useAppSelector(selectUserCart);
  const dispatch = useAppDispatch();
  const isEmpty = !cart?.user_carts?.some((item) => item.cartDetails.length);
  const currency = useAppSelector(selectCurrency);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      onError: () => dispatch(clearUserCart()),
      retry: false,
      refetchInterval: cart.group ? 5000 : false,
      refetchOnWindowFocus: Boolean(cart.group),
      staleTime: 0,
    }
  );

  console.log("cart",cart);
  

const { address } = useSettings(); // Access the address from the context
    const [price, setPrice] = useState('');
    const [deliveryPrice, setDeliveryPrice] = useState(0);
  
    useEffect(() => {
      if (address) {
        const add = address.split(",");
        if (add.length > 1) {
          const filtered = add[add.length - 2]?.trim();
          const extract = filtered?.split(" ");
          const cityExtracted = extract?.length === 1 ? extract[0] : extract?.[1];
    
          // Use shopDeliveryZipcode
          const matchingCity = shop?.shop_delivery_zipcodes?.find(
            (item) => item.city.toLowerCase() === cityExtracted?.toLowerCase()
          );
    
          // console.log("take",matchingCity);
    
          if (matchingCity) {
            setDeliveryPrice(Number(matchingCity.delivery_price || 0)); // Ensure it's a number
          } else {
            setDeliveryPrice(0); // Default if no matching city
          }
          // setPrice(cityExtracted  0);
        }
      }
    }, [address, shop?.shop_delivery_zipcodes]);
  
const [isBagSelected, setIsBagSelected] = useState(true);
const [bagPrice, setBagPrice] = useState(0);
const handleBagChange = (selected: boolean) => {
  setIsBagSelected(selected);
};

const handleBagPriceChange = (price: number) => {
  setBagPrice(price);
};   
  return (
    <div className={cls.wrapper}>
      <div className={cls.body}>
        {cart?.user_carts?.map((item: UserCart) => (
          <React.Fragment key={"user" + item.id}>
            <ProtectedCartHeader
              data={item}
              isOwner={item.user_id === cart.owner_id}
            />
            {item.cartDetails.map((el) => (
              <ProtectedCartProduct
                key={"c" + el.id + "q" + el.quantity}
                data={el}
                cartId={item.cart_id || 0}
                disabled={item.user_id !== cart.owner_id}
              />
            ))}
          </React.Fragment>
        ))}
        {isEmpty && !isLoading && (
          <div className={cls.empty}>
            <EmptyCart />
          </div>
        )}
      </div>
      {!isEmpty && <CartServices data={shop} onBagSelectedChange={handleBagChange}
  onBagPriceChange={handleBagPriceChange} />}
      {!isEmpty && <CartTotal totalPrice={ Number(cart.total_price) + 
      Number(deliveryPrice) + 
      Number(shop.serviceFee) +  (shop.bag_tax === 1 && isBagSelected ? bagPrice : 0)} data={shop} />}
      {isLoading && <Loading />}
    </div>
  );
}
