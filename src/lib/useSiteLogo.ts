"use client";

import { useState, useEffect } from "react";

export interface SiteLogoConfig {
  logoUrl: string;
  logoText: string;
  logoTag: string;
}

export const DEFAULT_LOGO_CONFIG: SiteLogoConfig = {
  logoUrl: "/logo-icon.png",
  logoText: "LOLCANVAS",
  logoTag: "®",
};

export function useSiteLogo(): SiteLogoConfig {
  const [logoConfig, setLogoConfig] = useState<SiteLogoConfig>(DEFAULT_LOGO_CONFIG);

  useEffect(() => {
    // 1. Initial local storage check
    try {
      const cached = localStorage.getItem("lolcanvas_custom_logo");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.logoUrl) {
          setLogoConfig({
            logoUrl: parsed.logoUrl || DEFAULT_LOGO_CONFIG.logoUrl,
            logoText: parsed.logoText || DEFAULT_LOGO_CONFIG.logoText,
            logoTag: parsed.logoTag !== undefined ? parsed.logoTag : DEFAULT_LOGO_CONFIG.logoTag,
          });
        }
      }
    } catch (e) {}

    // 2. Fetch from database site-config API
    fetch("/api/admin/site-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.logoUrl) {
          const fetched: SiteLogoConfig = {
            logoUrl: data.data.logoUrl || DEFAULT_LOGO_CONFIG.logoUrl,
            logoText: data.data.logoText || DEFAULT_LOGO_CONFIG.logoText,
            logoTag: data.data.logoTag !== undefined ? data.data.logoTag : DEFAULT_LOGO_CONFIG.logoTag,
          };
          setLogoConfig(fetched);
          try {
            localStorage.setItem("lolcanvas_custom_logo", JSON.stringify(fetched));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Listen to live updates
    const handleLogoChange = (e: Event) => {
      const customEvent = e as CustomEvent<SiteLogoConfig>;
      if (customEvent.detail) {
        setLogoConfig({
          logoUrl: customEvent.detail.logoUrl || DEFAULT_LOGO_CONFIG.logoUrl,
          logoText: customEvent.detail.logoText || DEFAULT_LOGO_CONFIG.logoText,
          logoTag: customEvent.detail.logoTag !== undefined ? customEvent.detail.logoTag : DEFAULT_LOGO_CONFIG.logoTag,
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lolcanvas_custom_logo" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLogoConfig(parsed);
        } catch (err) {}
      }
    };

    window.addEventListener("lolcanvas_logo_changed", handleLogoChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("lolcanvas_logo_changed", handleLogoChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return logoConfig;
}
