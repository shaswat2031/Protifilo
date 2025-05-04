import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This component automatically scrolls to the top of the page when route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
