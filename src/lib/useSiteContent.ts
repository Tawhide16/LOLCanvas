"use client";

import { useState, useEffect } from "react";
import { DEFAULT_SITE_CONFIG } from "@/app/api/admin/site-config/route";

export type SiteConfigType = typeof DEFAULT_SITE_CONFIG & Record<string, any>;

export function useSiteContent() {
  const [content, setContent] = useState<SiteConfigType>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    // 1. Instant local cache read
    try {
      const cached = localStorage.getItem("lolcanvas_site_config");
      if (cached) {
        setContent((prev) => ({ ...prev, ...JSON.parse(cached) }));
      }
    } catch (e) {}

    // 2. Fetch live config from server API
    fetch("/api/admin/site-config")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setContent((prev) => ({ ...prev, ...json.data }));
          try {
            localStorage.setItem("lolcanvas_site_config", JSON.stringify(json.data));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Listen for immediate real-time update events dispatched by admin
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setContent((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener("lolcanvas_content_changed", handleUpdate);
    return () => window.removeEventListener("lolcanvas_content_changed", handleUpdate);
  }, []);

  return {
    content,
    siteConfig: content,
    ...content,
  };
}
