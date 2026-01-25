import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function generateMetadata({ params }) {
    // Next.js 15+ requires awaiting params
    const { id } = await params;

    try {
        // Fetch article data server-side
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const article = docSnap.data();
            const firstImage = article.images?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=630&fit=crop';
            const description = article.content?.substring(0, 160) || 'Read the latest news on UP News No.1';

            return {
                title: article.title,
                description: description,
                openGraph: {
                    title: article.title,
                    description: description,
                    type: 'article',
                    images: [
                        {
                            url: firstImage,
                            width: 1200,
                            height: 630,
                            alt: article.title,
                        }
                    ],
                    siteName: 'UP News No.1',
                    locale: 'hi_IN',
                },
                twitter: {
                    card: 'summary_large_image',
                    title: article.title,
                    description: description,
                    images: [firstImage],
                },
            };
        }
    } catch (error) {
        console.error('Error generating metadata:', error);
    }

    return {
        title: 'Article | UP News No.1',
        description: 'Read the latest news on UP News No.1',
    };
}

export { default } from './page';
