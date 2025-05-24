import React from "react";
import MobileDrawer from "containers/drawer/mobileDrawer";
import ShoppingBag3LineIcon from "remixicon-react/ShoppingBag3LineIcon";
import cls from "./mobileCart.module.scss";
import Cart from "containers/cart/cart";
import { useAuth } from "contexts/auth/auth.context";
import ProtectedCart from "containers/cart/protectedCart";
import useModal from "hooks/useModal";
import { IShop } from "interfaces";
import { useShop } from "contexts/shop/shop.context";
import MemberCart from "containers/cart/memberCart";
import { useAppSelector } from "hooks/useRedux";
import { selectUserCart } from "redux/slices/userCart";

type Props = {
  shop: IShop;
};

export default function MobileCart({ shop }: Props) {
  const [visible, handleOpenCart, handleCloseCart] = useModal();
  const { isAuthenticated } = useAuth();
  const { isMember } = useShop();
  const cart = useAppSelector(selectUserCart);

  const cartItems = cart?.user_carts.flatMap((item) => item.cartDetails) || [];

  return (
    <>
      <div className={cls.btnWrapper}>
        <button className={cls.btn} onClick={handleOpenCart}>
          <ShoppingBag3LineIcon />
          {cartItems.length > 0 && (
            <span className={cls.badge}>{cartItems.length}</span>
          )}
        </button>
      </div>
      <MobileDrawer open={visible} onClose={handleCloseCart}>
        {isMember ? (
          <MemberCart shop={shop} />
        ) : isAuthenticated ? (
          <ProtectedCart shop={shop} />
        ) : (
          <Cart shop={shop} />
        )}
      </MobileDrawer>
    </>
  );
}