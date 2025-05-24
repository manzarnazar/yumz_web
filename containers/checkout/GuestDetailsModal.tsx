import { selectCart, selectTotalPrice } from "redux/slices/cart";
import React, { useState } from "react";
import { useMutation } from "react-query";
import ModalContainer from "containers/modal/modal";
import cls from "./checkout.module.scss";
import PrimaryButton from "components/button/primaryButton";
import { useTranslation } from "react-i18next";
import TextInput from "components/inputs/textInput";
import { useAppSelector } from "hooks/useRedux";

type GuestDetails = {
  firstname: string;
  lastname: string;
  phone: string;

};

type ApiResponse = {
  user_id: string;
  message: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  onSubmit: () => void;
};

export default function GuestDetailsModal({ open, handleClose, onSubmit }: Props) {
  const cartItems = useAppSelector(selectCart);
  console.log(cartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  //   console.log(totalPrice);
  const { t } = useTranslation();
  const [details, setDetails] = useState<GuestDetails>({
    firstname: "",
    lastname: "",
    phone: "",
  });
  
  console.log("rester:", cartItems); // Log the API response

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const { mutate, isLoading, isError, error } = useMutation<ApiResponse, Error, GuestDetails>({
    mutationFn: async (guestDetails: GuestDetails) => {
      const response = await fetch("https://api.yumz.dk/api/v1/guest-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guestDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to submit guest details");
      }

      return response.json();
    },
    onSuccess: async (data: ApiResponse) => {

      // Store user_id in localStorage
      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
        console.log("user_id stored in localStorage:", data.user_id);
      }

      // Prepare payload for the second API call
      const guestCartPayload = {
        guest_id: 32, // Replace with actual guest ID if available
        user_id: parseInt(data.user_id), // Convert user_id to number
        name: `${details.firstname} ${details.lastname}`,
        total_price:  totalPrice,
        
        cart_items: cartItems.map(item => ({
            // Map over item.addons instead of item
            addons: item.addons ? item.addons.map(addon => ({
                stock_id: addon.stock.id,
                quantity: addon.quantity,
                price: addon.stock.price,
            })) : [], 
            stock_id: item.stock.id,
            quantity: item.quantity,
            price: item.stock.price,
            bonus: item.stock.bonus || 0,
            discount: item.stock.discount || 0,
            bonus_type: null
        })),
        shop_id: cartItems[0].shop_id, // Replace with actual shop ID
        currency_id: 2, // Replace with actual currency ID
    };
    
    console.log("succccccccerer",JSON.stringify(guestCartPayload));

      try {
        const guestCartResponse = await fetch("https://api.yumz.dk/api/v1/guest-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(guestCartPayload),
        });

        if (!guestCartResponse.ok) {
          throw new Error("Failed to submit guest cart");
        }

        const guestCartData = await guestCartResponse.json();
        console.log("guestCartData",guestCartData);
        
        localStorage.setItem("cart_uuid", guestCartData.cart_uuid);
        localStorage.setItem("cart_id", guestCartData.cart_id);



        console.log("Guest Cart API response:", guestCartData.cart_id);
      } catch (error) {
        console.error("Guest Cart API error:", error);
      }

      onSubmit(); // Call the onSubmit prop after successful submission
    },
    onError: (error: Error) => {
      console.error("API error:", error);
    },
  });

  const handleSubmit = () => {
    if (!details.firstname || !details.phone) {
      alert(t("Please fill all required fields"));
      return;
    }

    // Trigger the mutation
    mutate(details);
  };
  

  const cartId = localStorage.getItem("cart_id");
  const userId = localStorage.getItem("user_id");
  const uui = localStorage.getItem("cart_uuid");

  console.log(cartId, userId, uui);
  

  return (
    <ModalContainer open={open} onClose={handleClose}>
      <div className={cls.wrapper2}>
        <h2 className="text-lg font-semibold mb-4">{t("Gæsteoplysninger")}</h2>
        {isError && <p className={cls.error}>{t("Submission failed. Please try again.")}</p>}
        <div className={cls.actionsVertical}>
          <TextInput
            name="firstname"
            label={t("Fornavn")}
            required={true}
            value={details.firstname}
            onChange={handleChange}
            placeholder={t("Indtast Fornavn")}
            aria-label="First Name"
          />
          <TextInput
            name="lastname"
            label={t("Efternavn")}
            required={true}
            value={details.lastname}
            onChange={handleChange}
            placeholder={t("Indtast Efternavn")}
            aria-label="Last Name"
          />
          <TextInput
            name="phone"
            label={t("telefon")}
            required={true}
            value={details.phone}
            onChange={handleChange}
            placeholder={t("Indtast Telefonnummer")}
            aria-label="Phone"
          />
          <PrimaryButton onClick={handleSubmit} loading={isLoading}>
            {t("Fortsæt")}
          </PrimaryButton>
        </div>
      </div>
    </ModalContainer>
  );
}