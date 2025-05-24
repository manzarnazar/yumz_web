/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import cls from "./v1.module.scss";
import { Grid, useMediaQuery } from "@mui/material";
import { BrandLogo, BrandLogoDark } from "components/icons";
import { ThemeContext } from "contexts/theme/theme.context";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { META_TITLE } from "constants/config";
import FacebookCircleFillIcon from "remixicon-react/FacebookCircleFillIcon";
import TwitterFillIcon from "remixicon-react/TwitterFillIcon";
import InstagramLineIcon from "remixicon-react/InstagramLineIcon";
import { useSettings } from "contexts/settings/settings.context";
import { getServerSEOData ,SEOData} from "services/restaurantService";
import { getAllShopLocations, ShopLocation } from "services/getAllShopLocations";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';

type Props = {};

export default function Footer({}: Props) {
  const router = useRouter();

  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);
  const isMobile = useMediaQuery("(max-width:576px)");
  const { settings } = useSettings();
  const isReferralActive = settings.referral_active == 1;
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
    const [showNavItem, setShowNavItem] = useState(true);
      useEffect(() => {
        const host = typeof window !== "undefined" ? window.location.hostname : "";
        if (host !== "yumz.dk" && host !== "www.yumz.dk") {
          setShowNavItem(false); // Hide nav item for other domains
        }
      }, []);
    console.log("Client SEO Data:", seoData?.image);
    const [cities, setCities] = useState<string[]>([]);
  const [locations, setLocations] = useState<ShopLocation[]>([]);

useEffect(() => {
  const fetchCities = async () => {
    const locations = await getAllShopLocations();
    const uniqueCities = Array.from(new Set(locations.map(loc => loc.city).filter(Boolean)));
    setCities(uniqueCities);
    setLocations(locations);
  };

  fetchCities();
}, []);
console.log("locations:", locations);
const { updateAddress, updateLocation } = useSettings();
const { push } = useRouter();

const handleCityClick = (location: any) => {
  if (!location.latitude || !location.longitude) return;

  const formattedCity = location.city.charAt(0).toUpperCase() + location.city.slice(1);
  updateAddress(formattedCity);
  updateLocation(`${location.latitude},${location.longitude}`);

  const citySlug = location.city.toLowerCase().replace(/\s+/g, "-");
  router.push(`/bestil-mad/${citySlug}`);
};

  return (
    <footer className={cls.footer}>
      <div className="container">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} order={isMobile ? 3 : 0}>
            <div className={cls.main}>
              <div className={cls.logoWrapper}>
                {isDarkMode ? <BrandLogoDark  src={seoData?.image}/> : <BrandLogo src={seoData?.image}/>}
              </div>
              {showNavItem && (
              <div className={cls.cityWrapper}>
              <ul className={cls.cityList}>
                {locations.map((city, index) => (
                  <li key={index} className={cls.cityItem} onClick={() => handleCityClick(city)}>
                    {city.city.charAt(0).toUpperCase() + city.city.slice(1)  +t(" Take Away")} 
                  </li>
                ))}
              </ul>

              </div>
              )}
              <div className={cls.flex}>
                <a
                  href={settings?.customer_app_ios}
                  className={cls.item}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/images/app-store.webp" alt="App store" />
                </a>
                <a
                  href={settings?.customer_app_android}
                  className={cls.item}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/images/google-play.webp" alt="Google play" />
                </a>
              </div>
            </div>
          </Grid>
          {showNavItem && (
            <Grid item xs={12} md={3}>
              <ul className={cls.column}>
              <li className={cls.columnItem}>
                  <Link href="/home" className={cls.listItem}>
                    {t("home.page")}
                  </Link>
                </li>
                <li className={cls.columnItem}>
                  <Link href="/about" className={cls.listItem}>
                    {t("about")} {seoData?.description || META_TITLE}
                  </Link>
                </li>
                {isReferralActive && (
                  <li className={cls.columnItem}>
                    <Link href="/referrals" className={cls.listItem}>
                      {t("become.affiliate")}
                    </Link>
                  </li>
                )}
                <li className={cls.columnItem}>
                  <Link href="/careers" className={cls.listItem}>
                    {t("careers")}
                  </Link>
                </li>
                {/* <li className={cls.columnItem}>
                  <Link href="/blog" className={cls.listItem}>
                    {t("blog")}
                  </Link>
                </li> */}
              </ul>
            </Grid>
           )}
           {showNavItem && (
            <Grid item xs={12} md={3}>
              <ul className={cls.column}>
                {/* <li className={cls.columnItem}>
                  <Link href="/recipes" className={cls.listItem}>
                    {t("recipes")}
                  </Link>
                </li> */}
                <li className={cls.columnItem}>
                  <Link href="/help" className={cls.listItem}>
                    {t("get.helps")}
                  </Link>
                </li>
                <li className={cls.columnItem}>
                  <Link href="/be-seller" className={cls.listItem}>
                    {t("add.your.restaurant")}
                  </Link>
                </li>
                {/* <li className={cls.columnItem}>
                  <Link href="/deliver" className={cls.listItem}>
                    {t("sign.up.to.deliver")}
                  </Link>
                </li> */}
              </ul>
            </Grid>
          )}
        </Grid>

        <div className={cls.bottom}>
          <Grid
            container
            spacing={4}
            flexDirection={isMobile ? "column" : "row"}
          >
            <Grid item xs={12} md={6}>
              <div className={cls.social}>
                <a
                  href={settings?.instagram_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramLineIcon />
                </a>
                <a
                  href={settings?.twitter_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterFillIcon />
                </a>
                <a
                  href={settings?.facebook_url}
                  className={cls.socialItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookCircleFillIcon />
                </a>
                {showNavItem && (
                  <p className={cls.text}>
                  &copy; {new Date().getFullYear()} {settings?.footer_text}
                </p>
                )}
              </div>
            </Grid>
            {showNavItem && (
              <Grid item xs={12} md={2}>
                <div className={cls.flex}>
                  <Link href="/privacy" className={cls.mutedLink}>
                    {t("privacy.policy")}
                  </Link>
                  <Link href="/terms" className={cls.mutedLink}>
                    {t("terms")}
                  </Link>
                </div>
              </Grid>
             )}
            <Grid item xs={12} md={3}>
            <div className={cls.flex}>
              {/* <p className={cls.text}>
                &copy; {new Date().getFullYear()} {settings?.footer_text}
              </p> */}
              <p className={cls.text}>
                CVR NR: 45251853
              </p>
              <p className={cls.text}>
                Tel: +45 49904429
              </p>
              </div>
              
            </Grid>
            
          </Grid>
        </div>
      </div>
    </footer>
  );
}
