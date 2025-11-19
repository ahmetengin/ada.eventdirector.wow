import React, { useRef, useEffect } from 'react';
import type { SocialPost, SentimentAnalysisResult } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface SocialFeedProps {
    posts: SocialPost[];
    analysis: SentimentAnalysisResult | null;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, analysis, onAnalyze, isAnalyzing }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [posts]);

    const getSentimentColor = (sentiment: SentimentAnalysisResult['overallSentiment']) => {
        switch (sentiment) {
            case 'Positive': return 'text-green-400';
            case 'Negative': return 'text-red-400';
            case 'Mixed': return 'text-yellow-400';
            case 'Neutral': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="font-orbitron text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                <ChatBubbleIcon className="w-6 h-6 mr-3" /> Live Social Feed
            </h2>
            
            {analysis && (
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-purple-700">
                    <h3 className="font-bold text-purple-300 mb-2">AI Sentiment Analysis</h3>
                    <p className="text-sm mb-2"><strong className="font-semibold">Overall Mood:</strong> <span className={`font-bold ${getSentimentColor(analysis.overallSentiment)}`}>{analysis.overallSentiment}</span></p>
                    <p className="text-sm mb-2"><strong className="font-semibold">Key Topics:</strong> {analysis.keyTopics.join(', ')}</p>
                    <p className="text-xs text-gray-400 italic">"{analysis.summary}"</p>
                </div>
            )}

            <div ref={feedRef} className="h-64 overflow-y-auto space-y-3 mb-4 pr-2 border-t border-b border-gray-700 py-2">
                {posts.map(post => (
                    <div key={post.id} className="flex items-start space-x-3 text-sm animate-fade-in">
                        <img src={post.avatar} alt={`${post.author}'s avatar`} className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div>
                            <div className="flex items-baseline space-x-1">
                                <span className="font-bold text-gray-200">{post.author}</span>
                                <span className="text-gray-500">@{post.handle}</span>
                            </div>
                            <p className="text-gray-300">{post.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onAnalyze}
                disabled={isAnalyzing || posts.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
                {isAnalyzing ? <SpinnerIcon className="mr-2" /> : <SparkleIcon className="mr-2" />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment with AI'}
            </button>
        </div>
    );
};

// Add a simple fade-in animation using CSS
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);