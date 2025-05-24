import { useState, useEffect } from "react";

// Module-scoped variable to store last selected value
let lastSelected = true;

export function useBagPrice(initialSelected?: boolean) {
  const startValue = typeof initialSelected === "boolean" ? initialSelected : lastSelected;

  const [isBagSelected, setIsBagSelected] = useState(startValue);
  const bagPrice = isBagSelected ? 4.0 : 0;

  useEffect(() => {
    lastSelected = isBagSelected;
  }, [isBagSelected]);

  return { isBagSelected, setIsBagSelected, bagPrice };
}
