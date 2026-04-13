"use client";

import { useEffect } from 'react';

export default function GoogleAd() {
    useEffect(() => {
        try {
            // Push ad configuration to Google AdSense
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            // Fails silently if ad-blocker is enabled or script fails to load
            console.error("AdSense initialization failed:", e);
        }
    }, []);

    return (
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-7059012990341250"
             data-ad-slot="5915939956"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
    );
}
