import { useState, useEffect } from 'react';
import { DailyQuote } from '../types';
import { format } from 'date-fns';

const FALLBACK_QUOTES: DailyQuote[] = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.",
    author: "Winston Churchill"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown"
  },
  {
    text: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi"
  },
  {
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs"
  },
  {
    text: "People who are crazy enough to think they can change the world, are the ones who do.",
    author: "Rob Siltanen"
  },
  {
    text: "Failure will never overtake me if my determination to succeed is strong enough.",
    author: "Og Mandino"
  },
  {
    text: "Entrepreneurs are great at dealing with uncertainty and also very good at minimizing risk. That's the classic entrepreneur.",
    author: "Mohnish Pabrai"
  },
  {
    text: "We may encounter many defeats but we must not be defeated.",
    author: "Maya Angelou"
  },
  {
    text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
    author: "Johann Wolfgang von Goethe"
  },
  {
    text: "Imagine your life is perfect in every respect; what would it look like?",
    author: "Brian Tracy"
  },
  {
    text: "We generate fears while we sit. We overcome them by action.",
    author: "Dr. Henry Link"
  },
  {
    text: "What seems impossible today will one day become your warm-up.",
    author: "Unknown"
  },
  {
    text: "Turn your wounds into wisdom.",
    author: "Oprah Winfrey"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In a year from now, you may wish you had started today.",
    author: "Karen Lamb"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau"
  },
  {
    text: "Few things can help an individual more than to place responsibility on him, and to let him know that you trust him.",
    author: "Booker T. Washington"
  }
];

export function useQuotes() {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRandomFallbackQuote = (): DailyQuote => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % FALLBACK_QUOTES.length;
    return FALLBACK_QUOTES[index];
  };

  const fetchQuoteFromAPI = async (): Promise<DailyQuote | null> => {
    try {
      // Try multiple quote APIs as fallbacks
      const apis = [
        {
          url: 'https://api.quotegarden.com/api/v3/quotes/random',
          transform: (data: any) => ({
            text: data.data.quoteText.replace(/^"|"$/g, ''),
            author: data.data.quoteAuthor
          })
        },
        {
          url: 'https://zenquotes.io/api/today',
          transform: (data: any) => ({
            text: data[0].q,
            author: data[0].a
          })
        }
      ];

      for (const api of apis) {
        try {
          const response = await fetch(api.url);
          if (response.ok) {
            const data = await response.json();
            return api.transform(data);
          }
        } catch (apiError) {
          console.warn(`Failed to fetch from ${api.url}:`, apiError);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching quote from APIs:', error);
      return null;
    }
  };

  const getCachedQuote = (): DailyQuote | null => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const cachedData = localStorage.getItem('todoApp_dailyQuote');
      
      if (cachedData) {
        const { date, quote } = JSON.parse(cachedData);
        if (date === today) {
          return quote;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error reading cached quote:', error);
      return null;
    }
  };

  const cacheQuote = (quote: DailyQuote) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      localStorage.setItem('todoApp_dailyQuote', JSON.stringify({
        date: today,
        quote
      }));
    } catch (error) {
      console.error('Error caching quote:', error);
    }
  };

  const loadDailyQuote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, check if we have a cached quote for today
      const cachedQuote = getCachedQuote();
      if (cachedQuote) {
        setQuote(cachedQuote);
        setIsLoading(false);
        return;
      }

      // Try to fetch from API
      const apiQuote = await fetchQuoteFromAPI();
      
      if (apiQuote) {
        setQuote(apiQuote);
        cacheQuote(apiQuote);
      } else {
        // Fall back to random quote from our collection
        const fallbackQuote = getRandomFallbackQuote();
        setQuote(fallbackQuote);
        cacheQuote(fallbackQuote);
      }
    } catch (error) {
      console.error('Error loading daily quote:', error);
      setError('Failed to load quote');
      
      // Use fallback quote on error
      const fallbackQuote = getRandomFallbackQuote();
      setQuote(fallbackQuote);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshQuote = async () => {
    // Clear cache and fetch new quote
    try {
      localStorage.removeItem('todoApp_dailyQuote');
      await loadDailyQuote();
    } catch (error) {
      console.error('Error refreshing quote:', error);
      setError('Failed to refresh quote');
    }
  };

  useEffect(() => {
    loadDailyQuote();
  }, []);

  return {
    quote,
    isLoading,
    error,
    refreshQuote
  };
}