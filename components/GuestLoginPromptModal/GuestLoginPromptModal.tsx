import React from "react";
import ModalContainer from "containers/modal/modal";
import cls from "./GuestLoginPromptModal.module.scss";
import { useTranslation } from "react-i18next";
import SecondaryButton from "components/button/secondaryButton";
import PrimaryButton from "components/button/primaryButton";

type Props = {
  open: boolean;
  handleClose: () => void;
  onGuestCheckout: () => void;
  onLogin: () => void;
  loading?: boolean;
  guestText: string;
  loginText: string;
};

export default function GuestLoginPromptModal({
  open,
  handleClose,
  onGuestCheckout,
  onLogin,
  loading = false,
  guestText,
  loginText,
}: Props) {
  const { t } = useTranslation();

  return (
    <ModalContainer open={open} onClose={handleClose} closable={false}>
      <div className={cls.wrapper}>
        <div className={cls.actionsVertical}>
          <PrimaryButton loading={loading} onClick={onGuestCheckout}>
            {t(guestText)}
          </PrimaryButton>
          <SecondaryButton onClick={onLogin}>
            {t(loginText)}
          </SecondaryButton>
        </div>
      </div>
    </ModalContainer>
  );
}