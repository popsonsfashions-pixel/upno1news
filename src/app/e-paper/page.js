"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header/Header';
import styles from './epaper.module.css';

export default function EPaperPage() {
    const [status, setStatus] = useState('loading');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        generateEPaper();
    }, []);

    const generateEPaper = async () => {
        try {
            setStatus('fetching');
            setProgress(10);

            // Fetch today's articles
            const articlesRef = collection(db, 'articles');
            const q = query(
                articlesRef,
                where('is_published', '==', true),
                limit(20)
            );

            const snapshot = await getDocs(q);
            const articles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate?.() || new Date(),
            }));

            // Sort by date
            articles.sort((a, b) => b.created_at - a.created_at);

            if (articles.length === 0) {
                setError('No articles found');
                setStatus('error');
                return;
            }

            setProgress(20);
            setStatus('translating');

            // Helper to detect Hindi text
            const hasHindi = (text) => /[\u0900-\u097F]/.test(text || '');

            // Import translation utility
            const { translateText } = await import('@/utils/translate');

            // Translate Hindi articles to English for PDF (jsPDF doesn't support Devanagari)
            const translatedArticles = await Promise.all(
                articles.map(async (article) => {
                    let title = article.title || 'Untitled';
                    let content = article.content || '';

                    try {
                        if (hasHindi(title)) {
                            title = await translateText(title, 'en');
                        }
                        if (hasHindi(content)) {
                            content = await translateText(content.substring(0, 300), 'en');
                        }
                    } catch (err) {
                        console.warn('Translation failed for article:', article.id);
                    }

                    return { ...article, title, content };
                })
            );

            setProgress(50);
            setStatus('generating');

            // Dynamically import jsPDF (client-side only)
            const { jsPDF } = await import('jspdf');

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPos = margin;

            // Header with branding
            pdf.setFillColor(220, 38, 38); // Red accent
            pdf.rect(0, 0, pageWidth, 35, 'F');

            // Title
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text('UP NEWS NO.1', pageWidth / 2, 15, { align: 'center' });

            // Tagline
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Uttar Pradesh Ki No.1 Khabar', pageWidth / 2, 22, { align: 'center' });

            // Date
            const today = new Date();
            const dateStr = today.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            pdf.setFontSize(9);
            pdf.text(dateStr, pageWidth / 2, 30, { align: 'center' });

            yPos = 45;

            // Edition info
            pdf.setTextColor(100, 100, 100);
            pdf.setFontSize(8);
            pdf.text(`Daily E-Paper Edition | ${translatedArticles.length} Articles`, margin, yPos);
            yPos += 10;

            setProgress(70);

            // Add articles
            pdf.setTextColor(0, 0, 0);

            for (let i = 0; i < translatedArticles.length; i++) {
                const article = translatedArticles[i];

                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                    pdf.addPage();
                    yPos = margin;

                    // Add header on new page
                    pdf.setFillColor(220, 38, 38);
                    pdf.rect(0, 0, pageWidth, 10, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(8);
                    pdf.text('UP NEWS NO.1 | E-Paper', pageWidth / 2, 7, { align: 'center' });
                    pdf.setTextColor(0, 0, 0);
                    yPos = 20;
                }

                // Article number badge
                pdf.setFillColor(220, 38, 38);
                pdf.circle(margin + 3, yPos + 2, 3, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(7);
                pdf.text(String(i + 1), margin + 3, yPos + 3, { align: 'center' });

                // Category
                pdf.setTextColor(220, 38, 38);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'bold');
                const category = article.category || 'News';
                pdf.text(category.toUpperCase(), margin + 10, yPos + 3);

                yPos += 8;

                // Title - sanitize for PDF
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');

                const safeTitle = article.title.replace(/[^\x00-\x7F]/g, '') || 'Article';
                const titleLines = pdf.splitTextToSize(safeTitle, pageWidth - (margin * 2));
                pdf.text(titleLines, margin, yPos);
                yPos += titleLines.length * 5 + 2;

                // Excerpt - sanitize for PDF
                if (article.content) {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(9);
                    pdf.setTextColor(60, 60, 60);
                    const safeContent = article.content.replace(/[^\x00-\x7F]/g, '');
                    const excerpt = safeContent.substring(0, 200) + (safeContent.length > 200 ? '...' : '');
                    const excerptLines = pdf.splitTextToSize(excerpt, pageWidth - (margin * 2));
                    const maxLines = Math.min(excerptLines.length, 3);
                    pdf.text(excerptLines.slice(0, maxLines), margin, yPos);
                    yPos += maxLines * 4 + 2;
                }

                // Date
                pdf.setFontSize(7);
                pdf.setTextColor(150, 150, 150);
                const articleDate = article.created_at.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                pdf.text(articleDate, margin, yPos);

                // Separator line
                yPos += 5;
                pdf.setDrawColor(230, 230, 230);
                pdf.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 8;
            }

            setProgress(90);

            // Footer on last page
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                'Generated by UP News No.1 | www.upnewsno1.com',
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            setProgress(95);

            // Generate filename with date
            const filename = `UP_News_No1_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.pdf`;

            // Download PDF
            pdf.save(filename);

            setProgress(100);
            setStatus('complete');

            // Redirect back to home after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (err) {
            console.error('PDF generation error:', err);
            setError(err.message);
            setStatus('error');
        }
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.epaper}>
                        <div className={styles.icon}>📰</div>

                        {status === 'loading' && (
                            <>
                                <h1>E-Paper</h1>
                                <p>Starting download...</p>
                            </>
                        )}

                        {status === 'fetching' && (
                            <>
                                <h1>Fetching Articles</h1>
                                <p>समाचार लोड हो रहे हैं...</p>
                            </>
                        )}

                        {status === 'generating' && (
                            <>
                                <h1>Generating PDF</h1>
                                <p>आपका E-Paper तैयार हो रहा है...</p>
                            </>
                        )}

                        {status === 'complete' && (
                            <>
                                <div className={styles.successIcon}>✓</div>
                                <h1>Download Complete!</h1>
                                <p>डाउनलोड पूरा हुआ!</p>
                                <p className={styles.redirect}>Redirecting to homepage...</p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className={styles.errorIcon}>✕</div>
                                <h1>Error</h1>
                                <p>{error}</p>
                                <button onClick={() => router.push('/')} className={styles.backBtn}>
                                    ← Back to Home
                                </button>
                            </>
                        )}

                        {status !== 'complete' && status !== 'error' && (
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
