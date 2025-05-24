import React, { useContext } from "react";
import cls from "./welcomeHeader.module.scss";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BrandLogo, BrandLogoDark } from "components/icons";
import SecondaryButton from "components/button/secondaryButton";
import { useAuth } from "contexts/auth/auth.context";
import { ThemeContext } from "contexts/theme/theme.context";
import { useRouter } from "next/router";
import useLocale from "hooks/useLocale";
import useModal from "hooks/useModal";
import { getServerSEOData ,SEOData} from "services/restaurantService";
import { useEffect, useState } from "react";
const AppDrawer = dynamic(() => import("components/appDrawer/appDrawer"));
const ProfileDropdown = dynamic(
  () => import("components/profileDropdown/profileDropdown")
);

type Props = {};

export default function WelcomeHeader({}: Props) {
  const { isDarkMode } = useContext(ThemeContext);
  const { push } = useRouter();
  const { t } = useLocale();
  const [appDrawer, handleOpenAppDrawer, handleCloseAppDrawer] = useModal();
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  
    useEffect(() => {
      const fetchSEO = async () => {
        const domain = window.location.hostname;
        const localData = {}; // pass real localData if needed
        const data = await getServerSEOData(domain, localData);
        setSeoData(data);
      };
  
      fetchSEO();
    }, []);
  
    console.log("Client SEO Data:", seoData?.image);

  return (
    <>
    
      <header className={cls.header}>
        <div className={cls.navContainer}>
        
           <button className={cls.menuBtn} onClick={handleOpenAppDrawer}>
            menu
          </button> 
          
        
        <div className={cls.navItem}>
         
          <Link href="/" className={cls.brandLogo}>
            {/* {isDarkMode ? <BrandLogoDark /> : <BrandLogo />} */}
            <div className={ cls.logoAnimated}>
                <BrandLogoDark src={seoData?.image}  />
              </div>
          </Link>
        </div>
        <div className={(cls.navItem, cls.another)}>
          <div className={cls.actions}>
            <Link href="/about" className={cls.itemLink}>
              {t("about")}
            </Link>
            <Link href="/blog" className={cls.itemLink}>
              {t("blog")}
            </Link>
            <Link href="/careers" className={cls.itemLink}>
              {t("careers")}
            </Link>
          </div>
        </div>
        <div className={cls.navItem}>
          {/* <SecondaryButton size="small" onClick={() => push("/login")}>
            {t("login")}
          </SecondaryButton> */}
        </div>
        </div>
      </header>
    <div className="welcome-container">

      <AppDrawer open={appDrawer} handleClose={handleCloseAppDrawer} />
    </div>
    </>
  );
}
