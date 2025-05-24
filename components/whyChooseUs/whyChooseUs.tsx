import React from "react";
import cls from "./whyChooseUs.module.scss";
import useLocale from "hooks/useLocale";
import { ILandingPageData } from "interfaces/page.interface";

type Props = {
  data?: ILandingPageData;
};

export default function WhyChooseUs({ data }: Props) {
  const { t, locale } = useLocale();

  console.log("Data:", data);
  console.log("Locale:", locale);

  return (
    <div className={cls.container}>
      <div className="welcome-container">
        <section className={cls.wrapper}>
          {!!data?.features?.length && (
            <h1 className={cls.title}>{t("why.choose.us")}</h1>
          )}
          <div className={cls.flex}>
            {data?.features.map((item, idx) => {
              const title = item.title[locale] || "Default Title";
              const description = item.description[locale] || "Default Description";

              return (
                <div key={idx} className={cls.card} tabIndex={idx + 1}>
                  <div className={cls.number}>0{idx + 1}</div>
                  <h3 className={cls.cardTitle}>{title}</h3>
                  <p className={cls.text}>{description}</p>
                  <img
                    src={item.img}
                    alt={`Feature ${idx + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
