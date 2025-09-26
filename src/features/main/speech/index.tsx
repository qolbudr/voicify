import React, { useEffect } from "react"
import { SpeechDesktop } from "./index_desktop";
import { SpeechMobile } from "./index_mobile";

export const Speech = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [
    window.innerWidth, window.innerHeight,
  ])

  return isMobile ? <SpeechMobile /> : <SpeechDesktop />;
}