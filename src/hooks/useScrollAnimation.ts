import { useEffect, useRef, useState, type RefObject } from "react";

export const useScrollAnimation = (): { ref: RefObject<HTMLDivElement>; isVisible: boolean; animationClass: string } => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    isVisible,
    animationClass: isVisible ? "scroll-visible" : "scroll-hidden",
  };
};
