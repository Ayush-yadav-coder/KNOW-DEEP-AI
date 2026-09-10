import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, corsHeaders } from "../_shared/auth.ts";

const categoryMap: Record<string, string> = {
  technology: "technology",
  science: "science",
  business: "business",
  entertainment: "entertainment",
  sports: "sports",
  health: "health",
};

// Country codes for each region option
const regionToCountry: Record<string, string> = {
  world: "us",
  asia: "in",
  europe: "gb",
  africa: "za",
  north_america: "us",
  south_america: "br",
  oceania: "au",
  india: "in",
  // Legacy support
  in: "in",
  us: "us",
};

// Get API keys with rotation (supports 4 keys)
const getApiKeys = (): string[] => {
  const keys: string[] = [];
  const key1 = Deno.env.get("NEWS_API_KEY");
  const key2 = Deno.env.get("NEWS_API_KEY_2");
  const key3 = Deno.env.get("NEWS_API_KEY_3");
  const key4 = Deno.env.get("NEWS_API_KEY_4");
  
  if (key1) keys.push(key1);
  if (key2) keys.push(key2);
  if (key3) keys.push(key3);
  if (key4) keys.push(key4);
  
  return keys;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authResult = await authenticateRequest(req);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await req.json();
    const category = categoryMap[body.category] || "technology";
    const region = body.region || "world";
    const countryCode = regionToCountry[region] || "us";

    const apiKeys = getApiKeys();
    
    if (apiKeys.length === 0) {
      throw new Error("No NEWS_API_KEY configured");
    }

    console.log(`User ${authResult.userId} - Fetching ${countryCode} news for category: ${category}`);

    let articles: any[] = [];
    let lastError: Error | null = null;

    // Try each API key until one works
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=${countryCode}&pageSize=15&apiKey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.status === "ok" && data.articles && data.articles.length > 0) {
          articles = data.articles;
          console.log(`Successfully fetched ${articles.length} articles with API key ${i + 1}`);
          break;
        } else if (data.status === "error") {
          console.error(`NewsAPI error with key ${i + 1}:`, data.message);
          lastError = new Error(data.message || "NewsAPI error");
          // Continue to next key
        }
      } catch (error) {
        console.error(`Error with API key ${i + 1}:`, error);
        lastError = error as Error;
        // Continue to next key
      }
    }

    // If no articles found, try everything/general endpoint as fallback
    if (articles.length === 0) {
      for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        try {
          const fallbackUrl = `https://newsapi.org/v2/everything?q=${category}&sortBy=publishedAt&pageSize=15&apiKey=${apiKey}`;
          const response = await fetch(fallbackUrl);
          const data = await response.json();

          if (response.ok && data.status === "ok" && data.articles && data.articles.length > 0) {
            articles = data.articles;
            console.log(`Fallback: fetched ${articles.length} articles with API key ${i + 1}`);
            break;
          }
        } catch (error) {
          console.error(`Fallback error with API key ${i + 1}:`, error);
        }
      }
    }

    if (articles.length === 0) {
      throw lastError || new Error("Could not fetch news from any source");
    }

    // Transform to our article format
    const transformedArticles = articles.map((article: any) => {
      const publishedAt = new Date(article.publishedAt);
      const now = new Date();
      const diffMs = now.getTime() - publishedAt.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = "Just now";
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins > 0) {
          timeAgo = `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
        }
      }

      return {
        title: article.title || "Untitled",
        summary: article.description || article.content?.slice(0, 200) || "No description available",
        source: article.source?.name || "Unknown",
        timeAgo,
        category,
        url: article.url,
        imageUrl: article.urlToImage,
      };
    }).filter((a: any) => a.title && a.title !== "[Removed]");

    return new Response(
      JSON.stringify({ articles: transformedArticles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch news" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
