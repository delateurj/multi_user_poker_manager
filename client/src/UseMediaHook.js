import { useState, useEffect } from "react";

export function useMedia(
  queries = ["(min-width: 1200px)", "(min-width: 992px)", "(min-width: 768px)"],
  values = ["large", "medium", "small"],
  defaultValue = "extra_small"
) {
  const mediaQueryLists = queries.map((q) => window.matchMedia(q));

  const getValue = () => {
    const index = mediaQueryLists.findIndex((mql) => mql.matches);

    return typeof values[index] !== "undefined" ? values[index] : defaultValue;
  };

  const [value, setValue] = useState(getValue);

  useEffect(() => {
    const handler = () => setValue(getValue);
    mediaQueryLists.forEach((mql) => mql.addListener(handler));
    return () => mediaQueryLists.forEach((mql) => mql.removeListener(handler));
  });
  return value;
}
