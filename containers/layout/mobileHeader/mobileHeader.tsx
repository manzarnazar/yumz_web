import React, { useContext } from "react";
import Link from "next/link";
import cls from "./mobileHeader.module.scss";
import { BrandLogo, BrandLogoDark } from "components/icons";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import { ThemeContext } from "contexts/theme/theme.context";
import dynamic from "next/dynamic";
import AddressContainer from "containers/addressContainer/addressContainer";
import useModal from "hooks/useModal";
import NotificationStats from "components/notificationStats/notificationStats";
import { useEffect, useState } from "react";
import { useAuth } from "contexts/auth/auth.context";
const AppDrawer = dynamic(() => import("components/appDrawer/appDrawer"));
const MobileSearchContainer = dynamic(
  () => import("containers/mobileSearchContainer/mobileSearchContainer"),
);

interface MobileHeaderProps {
  isShopDetailPage?: boolean;
}

export default function MobileHeader({
  isShopDetailPage = false,
}: MobileHeaderProps) {
  const { isDarkMode } = useContext(ThemeContext);
  const [appDrawer, handleOpenAppDrawer, handleCloseAppDrawer] = useModal();
  const [searchModal, handleOpenSearchModal, handleCloseSearchModal] =
    useModal();
   const [showNavItem, setShowNavItem] = useState(true);
    useEffect(() => {
      const host = typeof window !== "undefined" ? window.location.hostname : "";
      if (host !== "yumz.dk" && host !== "www.yumz.dk") {
        setShowNavItem(false); // Hide nav item for other domains
      }
    }, []);
    const { isAuthenticated, user } = useAuth();
  return (
    <header
      className={`container ${cls.header} ${isShopDetailPage ? "" : cls.stickyHeader}`}
    >
      
        <div className={cls.navItem}>
        {isAuthenticated && (
          <button className={cls.menuBtn} onClick={handleOpenAppDrawer}>
            menu
          </button>
        )}
        {showNavItem && (
            <Link href="/" className={cls.brandLogo}>
              {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
            </Link>
          )}
          <div className={cls.actions}>
            <NotificationStats />
            <AddressContainer />
            <button className={cls.iconBtn} onClick={handleOpenSearchModal}>
              <Search2LineIcon />
            </button>
          </div>
        </div>
      

      <AppDrawer open={appDrawer} handleClose={handleCloseAppDrawer} />
      <MobileSearchContainer
        open={searchModal}
        onClose={handleCloseSearchModal}
        fullScreen
      />
    </header>
  );
}
