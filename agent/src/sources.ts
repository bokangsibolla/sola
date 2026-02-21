export interface Source {
  name: string;
  url: string;
  category: 'ai_travel' | 'women_travel' | 'travel_industry' | 'travel_tech' | 'ai_general' | 'mobile_growth';
}

export const SOURCES: Source[] = [
  // AI + Travel Tech
  { name: 'Skift', url: 'https://skift.com/feed', category: 'travel_industry' },
  { name: 'Phocuswire', url: 'https://www.phocuswire.com/rss', category: 'travel_tech' },
  { name: 'Tnooz (WebinTravel)', url: 'https://www.webintravel.com/feed/', category: 'travel_tech' },
  { name: 'Travel Weekly', url: 'https://www.travelweekly.com/rss', category: 'travel_industry' },

  // AI General
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'ai_general' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'ai_general' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', category: 'ai_general' },
  { name: 'Ars Technica AI', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'ai_general' },

  // Solo Female Travel / Women Safety
  { name: 'Adventurous Kate', url: 'https://www.adventurouskate.com/feed/', category: 'women_travel' },
  { name: 'Be My Travel Muse', url: 'https://www.bemytravelmuse.com/feed/', category: 'women_travel' },
  { name: 'Solo Traveler Blog', url: 'https://solotravelerworld.com/feed/', category: 'women_travel' },
  { name: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/travel-blog/feed/', category: 'travel_industry' },

  // Mobile / App Growth
  { name: 'TechCrunch Apps', url: 'https://techcrunch.com/category/apps/feed/', category: 'mobile_growth' },
  { name: 'App Annie / data.ai Blog', url: 'https://www.data.ai/en/insights/feed/', category: 'mobile_growth' },

  // Travel News / Safety
  { name: 'Reuters Travel', url: 'https://www.reuters.com/arc/outboundfeeds/v1/category/travel/?outputType=xml', category: 'travel_industry' },
  { name: 'BBC Travel', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'travel_industry' },
  { name: 'Cond\u00e9 Nast Traveler', url: 'https://www.cntraveler.com/feed/rss', category: 'travel_industry' },
  { name: 'Lonely Planet News', url: 'https://www.lonelyplanet.com/news/feed', category: 'travel_industry' },
];
