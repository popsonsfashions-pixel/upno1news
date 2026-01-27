"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import NewsCard from '@/components/NewsCard/NewsCard';
import { api } from '@/lib/api';
import styles from './search.module.css';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.searchArticles(query);
                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <main className={styles.main}>
            <div className="container">
                <h1 className={styles.title}>
                    Search Results for "{query}"
                </h1>

                {loading && <div className={styles.loading}>Loading...</div>}

                {error && <div className={styles.error}>{error}</div>}

                {!loading && !error && results.length === 0 && (
                    <div className={styles.noResults}>
                        No results found for "{query}".
                    </div>
                )}

                <div className={styles.grid}>
                    {results.map(article => (
                        <NewsCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Loading search...</div>}>
                <SearchContent />
            </Suspense>
        </>
    );
}
