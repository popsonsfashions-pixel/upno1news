import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import HomeClient from './HomeClient';
import { Suspense } from 'react';

// Server-side metadata generation for social sharing (WhatsApp/FB previews)
export async function generateMetadata({ searchParams }) {
    // Await searchParams in Next.js 15+
    const sParams = await searchParams;
    const storyId = sParams?.storyId;

    if (storyId) {
        try {
            // Fetch the specific story/status for detailed preview
            const docRef = doc(db, 'statuses', storyId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const status = docSnap.data();
                const title = status.title || "UP News No.1 Web Story";
                const imageUrl = status.imageUrl || 'https://upno1news.vercel.app/logo.png';
                const description = status.title ? `Watch this web story: ${status.title}` : "Stay updated with the latest news on UP News No.1";

                return {
                    title: `${title} | UP News No.1`,
                    description: description,
                    openGraph: {
                        title: title,
                        description: description,
                        url: `https://upno1news.in/?storyId=${storyId}`,
                        siteName: 'UP News No.1',
                        images: [
                            {
                                url: imageUrl,
                                width: 1200,
                                height: 630,
                                alt: title,
                            },
                        ],
                        locale: 'hi_IN',
                        type: 'website',
                    },
                    twitter: {
                        card: 'summary_large_image',
                        title: title,
                        description: description,
                        images: [imageUrl],
                    },
                };
            }
        } catch (error) {
            console.error('Error fetching story metadata:', error);
        }
    }

    // Default metadata for homepage
    return {
        title: 'UP News No.1 - उत्तर प्रदेश की नंबर 1 खबर',
        description: 'Get the latest news from Uttar Pradesh, Bollywood, Cricket, Finance and World. उत्तर प्रदेश की ताज़ा खबरें।',
        openGraph: {
            title: 'UP News No.1 - उत्तर प्रदेश की नंबर 1 खबर',
            description: 'Get the latest news from Uttar Pradesh, Bollywood, Cricket, Finance and World. उत्तर प्रदेश की ताज़ा खबरें।',
            url: 'https://upno1news.in',
            siteName: 'UP News No.1',
            images: [
                {
                    url: 'https://upno1news.in/logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'UP News No.1',
                },
            ],
            locale: 'hi_IN',
            type: 'website',
        },
    };
}

export default function HomePage() {
    return (
        <Suspense fallback={null}>
            <HomeClient />
        </Suspense>
    );
}
