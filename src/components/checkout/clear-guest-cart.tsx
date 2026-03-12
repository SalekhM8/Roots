"use client";

import { useEffect } from "react";

export function ClearGuestCart() {
  useEffect(() => {
    localStorage.removeItem("roots_guest_cart");
    window.dispatchEvent(new Event("guest-cart-updated"));
  }, []);

  return null;
}
