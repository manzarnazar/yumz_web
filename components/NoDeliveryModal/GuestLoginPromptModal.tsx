import React from "react";
import ModalContainer from "containers/modal/modal";
import cls from "./NoDeliveryModal.module.scss";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";
import SecondaryButton from "components/button/secondaryButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onChangeAddress: () => void;
  onContinue: () => void;
  loading?: boolean;
};

export default function NoDeliveryModal({
  open,
  onClose,
  onChangeAddress,
  onContinue,
  loading = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <ModalContainer open={open} closable={false}>
      <div className={cls.wrapper}>
        <p className={cls.message}>{t("Beklager, vi leverer ikke hertil ")}</p>
        <div className={cls.actionsVertical}>
          <PrimaryButton loading={loading} onClick={onChangeAddress}>
            {t("Skift adresse")}
          </PrimaryButton>
          <SecondaryButton onClick={onContinue}>
            {t("Udforsk mere")}
          </SecondaryButton>
        </div>
      </div>
    </ModalContainer>
  );
}
