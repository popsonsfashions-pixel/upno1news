"use client";

import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header/Header';
import Link from 'next/link';

const demoArticles = [
    {
        title: "Breaking: Major Tech Summit 2026 Announces Revolutionary AI Breakthroughs",
        category: "Technology",
        content: `The annual Global Tech Summit 2026, held in San Francisco, has unveiled groundbreaking advancements in artificial intelligence that promise to reshape industries worldwide.

Leading tech giants presented their latest innovations, including next-generation language models capable of understanding context with unprecedented accuracy. The keynote speech highlighted how these developments will transform healthcare, education, and scientific research.

"We are witnessing a pivotal moment in human history," said the summit's keynote speaker. "The tools we're creating today will solve problems we haven't even imagined yet."

Industry experts predict these advancements will create millions of new jobs while automating routine tasks, leading to a fundamental shift in how we work and live.

The summit also addressed ethical concerns surrounding AI development, with major companies pledging to establish new governance frameworks. Participants agreed on a set of principles to ensure responsible AI deployment.

Environmental sustainability was another key focus, with several presentations demonstrating how AI can optimize energy consumption and accelerate climate research.

The three-day event attracted over 50,000 attendees from 120 countries, making it the largest tech gathering in history.`,
        images: [
            {
                url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop",
                position: "hero",
                caption: "AI robots showcased at Tech Summit 2026"
            },
            {
                url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=500&fit=crop",
                position: "center",
                caption: "Thousands of attendees gather for the keynote presentation"
            },
            {
                url: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=400&h=300&fit=crop",
                position: "right",
                caption: "Interactive AI demonstrations"
            }
        ],
        is_published: true
    },
    {
        title: "India Wins Historic Cricket World Cup Final Against Australia",
        category: "Sports",
        content: `In a thrilling finale that will be remembered for generations, India clinched the Cricket World Cup 2026 with a stunning victory over Australia at the packed Melbourne Cricket Ground.

Captain Virat Kohli led from the front with a masterful century, scoring 118 runs off just 102 balls. His partnership with Shubman Gill proved unstoppable, putting India in a commanding position.

The Indian bowling attack was equally devastating. Jasprit Bumrah's opening spell rattled the Australian top order, taking three crucial wickets in his first four overs.

"This victory belongs to 1.4 billion Indians," an emotional Kohli said during the trophy presentation. "We've worked incredibly hard for this moment."

The streets of Mumbai, Delhi, and cities across India erupted in celebration as fans poured out to mark the historic occasion. Prime Minister Modi congratulated the team, calling them "true champions."

Australia's captain acknowledged India's dominance, saying, "They were simply the better team today. Full credit to them."

This marks India's third World Cup victory, cementing their status as cricket's most successful nation in the modern era.`,
        images: [
            {
                url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=600&fit=crop",
                position: "hero",
                caption: "The winning moment at MCG"
            },
            {
                url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&h=400&fit=crop",
                position: "left",
                caption: "Fans celebrate across India"
            }
        ],
        is_published: true
    },
    {
        title: "Stock Markets Hit All-Time High as Economy Shows Strong Recovery",
        category: "Business",
        content: `Indian stock markets reached unprecedented levels today, with the Sensex crossing the 90,000 mark for the first time in history.

The rally was driven by strong corporate earnings, robust GDP growth projections, and increased foreign investment inflows. Banking and IT sectors led the surge, with top companies posting double-digit gains.

"The fundamentals of the Indian economy have never been stronger," said leading market analyst Priya Sharma. "We're seeing sustained growth across all sectors."

Foreign institutional investors poured in over ₹15,000 crore this month alone, reflecting global confidence in India's economic trajectory.

The Reserve Bank of India maintained its accommodative stance, keeping interest rates steady to support continued growth.

Retail investors also played a significant role, with demat accounts crossing the 150 million mark. Financial literacy programs have encouraged more Indians to participate in the market.

Experts advise caution despite the optimism, recommending diversified portfolios and long-term investment strategies.`,
        images: [
            {
                url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop",
                position: "hero",
                caption: "Stock market trading floor in Mumbai"
            },
            {
                url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&h=350&fit=crop",
                position: "bottom",
                caption: "Analysts predict continued growth"
            }
        ],
        is_published: true
    }
];

export default function SeedPage() {
    const { user, userData, isAdmin } = useAuth();
    const [seeding, setSeeding] = useState(false);
    const [converting, setConverting] = useState(false);
    const [done, setDone] = useState(false);
    const [convertDone, setConvertDone] = useState(false);
    const [results, setResults] = useState([]);
    const [convertResults, setConvertResults] = useState([]);

    // Convert all articles to statuses
    const convertArticlesToStatuses = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        setConverting(true);
        const newResults = [];

        try {
            // Get all published articles
            const articlesRef = collection(db, 'articles');
            const q = query(articlesRef, where('is_published', '==', true));
            const snapshot = await getDocs(q);

            for (const doc of snapshot.docs) {
                const article = { id: doc.id, ...doc.data() };
                const firstImage = article.images?.[0]?.url || null;

                try {
                    // Create linked status
                    await addDoc(collection(db, 'statuses'), {
                        title: article.title,
                        author_id: user.uid,
                        author_email: user.email,
                        imageUrl: firstImage,
                        articleId: article.id,
                        articleTitle: article.title,
                        articleImage: firstImage,
                        articleCategory: article.category || 'News',
                        created_at: serverTimestamp(),
                    });
                    newResults.push({ title: article.title, success: true });
                } catch (error) {
                    newResults.push({ title: article.title, error: error.message, success: false });
                }
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            newResults.push({ title: 'Fetch Error', error: error.message, success: false });
        }

        setConvertResults(newResults);
        setConverting(false);
        setConvertDone(true);
    };

    const seedArticles = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        setSeeding(true);
        const newResults = [];

        for (const article of demoArticles) {
            try {
                const docRef = await addDoc(collection(db, 'articles'), {
                    ...article,
                    author_id: user.uid,
                    author_email: user.email,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                });
                newResults.push({ title: article.title, id: docRef.id, success: true });
            } catch (error) {
                newResults.push({ title: article.title, error: error.message, success: false });
            }
        }

        setResults(newResults);
        setSeeding(false);
        setDone(true);
    };

    return (
        <>
            <Header />
            <main style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px' }}>🌱 Seed Demo Articles</h1>

                {!user ? (
                    <p>Please login first to seed articles.</p>
                ) : done ? (
                    <div>
                        <h2 style={{ color: '#22c55e', marginBottom: '20px' }}>✅ Done! Articles created:</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {results.map((r, i) => (
                                <li key={i} style={{
                                    padding: '15px',
                                    background: r.success ? '#f0fdf4' : '#fef2f2',
                                    marginBottom: '10px',
                                    borderRadius: '8px'
                                }}>
                                    {r.success ? (
                                        <>
                                            <strong>{r.title}</strong>
                                            <br />
                                            <Link href={`/article/${r.id}`} style={{ color: '#1a73e8' }}>
                                                View Article →
                                            </Link>
                                        </>
                                    ) : (
                                        <span style={{ color: '#e02020' }}>Error: {r.error}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <Link href="/admin" style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: '#e02020',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none'
                        }}>
                            Go to Admin Panel →
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '20px' }}>
                            This will create {demoArticles.length} demo articles with sample images to test the article page layout.
                        </p>
                        <button
                            onClick={seedArticles}
                            disabled={seeding}
                            style={{
                                padding: '15px 30px',
                                background: seeding ? '#999' : '#e02020',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: seeding ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {seeding ? 'Creating articles...' : '🚀 Create Demo Articles'}
                        </button>
                    </div>
                )}

                {/* Convert Articles to Statuses Section */}
                <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #eee' }}>
                    <h2 style={{ marginBottom: '15px' }}>⚡ Convert Articles to Statuses</h2>

                    {convertDone ? (
                        <div>
                            <h3 style={{ color: '#22c55e', marginBottom: '15px' }}>
                                ✅ Converted {convertResults.filter(r => r.success).length} articles to statuses!
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {convertResults.map((r, i) => (
                                    <li key={i} style={{
                                        padding: '10px 15px',
                                        background: r.success ? '#f0fdf4' : '#fef2f2',
                                        marginBottom: '8px',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}>
                                        {r.success ? '✓ ' : '✗ '}{r.title}
                                        {r.error && <span style={{ color: '#e02020' }}> - {r.error}</span>}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/" style={{
                                display: 'inline-block',
                                marginTop: '15px',
                                padding: '10px 20px',
                                background: '#667eea',
                                color: 'white',
                                borderRadius: '6px',
                                textDecoration: 'none'
                            }}>
                                View Statuses on Homepage →
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <p style={{ marginBottom: '15px', color: '#666' }}>
                                This will convert ALL published articles to linked statuses (WhatsApp-style stories).
                            </p>
                            <button
                                onClick={convertArticlesToStatuses}
                                disabled={converting || !user}
                                style={{
                                    padding: '12px 25px',
                                    background: converting ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: converting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {converting ? 'Converting...' : '⚡ Convert All Articles to Statuses'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
