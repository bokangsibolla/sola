-- Seed page content for Tokyo and Lisbon
-- These are the only 2 cities (out of 75) missing page content.
-- Uses COALESCE to preserve any existing non-NULL values.

-- ============================================================
-- TOKYO
-- ============================================================
UPDATE cities
SET
  positioning_line = COALESCE(positioning_line, 'The world''s safest megacity where ancient ritual meets neon precision'),
  budget_tier      = COALESCE(budget_tier, 'moderate'),
  vibe             = COALESCE(vibe, 'Precise, electric, deeply respectful'),
  solo_level       = COALESCE(solo_level, 'beginner'),
  walkability      = COALESCE(walkability, 'somewhat_walkable'),
  transit_ease     = COALESCE(transit_ease, 'excellent'),
  best_months      = COALESCE(best_months, 'March to May, October to November'),
  portrait_md      = COALESCE(portrait_md, 'Tokyo is the city that makes solo travel feel effortless. The metro runs on time to the second, signage is bilingual everywhere that matters, and the cultural emphasis on courtesy means you will never feel unwelcome. Walking alone at 2 a.m. through Shibuya or a quiet residential backstreet in Yanaka carries the same sense of calm — this is a city where personal safety is simply not something you spend energy thinking about.

What makes it remarkable for solo women is the sheer density of things to do alone without any friction. Eat at a ramen counter designed for one. Sit in a temple garden for an hour without anyone wondering why you''re there. Browse seven floors of stationery in Ginza. Every neighborhood operates like its own small city — Shimokitazawa for vintage and live music, Daikanyama for architecture and bookshops, Asakusa for incense and tradition — so a week here feels like visiting a dozen places.

The practical details work in your favor too. Konbini (convenience stores) are genuinely excellent — onigiri, salads, ATMs, concert tickets, all at 3 a.m. Capsule hotels and women-only floors are common and well-maintained. A Suica card covers every train, bus, and vending machine. The learning curve is gentle: a few days in, you''ll navigate transfers at Shinjuku Station without thinking twice. Tokyo doesn''t demand adaptation — it quietly accommodates you.')
WHERE slug = 'tokyo';

-- ============================================================
-- LISBON
-- ============================================================
UPDATE cities
SET
  positioning_line = COALESCE(positioning_line, 'Golden-light capital where fado, pastéis, and creative energy collide'),
  budget_tier      = COALESCE(budget_tier, 'moderate'),
  vibe             = COALESCE(vibe, 'Soulful, sun-drenched, creative'),
  solo_level       = COALESCE(solo_level, 'beginner'),
  walkability      = COALESCE(walkability, 'walkable'),
  transit_ease     = COALESCE(transit_ease, 'good'),
  best_months      = COALESCE(best_months, 'April to June, September to October'),
  portrait_md      = COALESCE(portrait_md, 'Lisbon is the European capital that feels like it was designed for wandering alone. The historic center is compact enough to cross on foot in an afternoon, the light is famously golden for hours before sunset, and the culture runs on a rhythm of long meals, strong coffee, and unhurried conversation. It is affordable by Western European standards, safe at almost any hour, and genuinely welcoming to solo visitors — the Portuguese have a word, saudade, for bittersweet longing, and the city carries that gentle warmth in how it treats strangers.

The daily ritual here is simple and satisfying. Morning: a pastel de nata still warm from the oven at a neighborhood pastelaria, eaten standing at the counter with a bica (espresso). Afternoon: get lost in the azulejo-tiled streets of Alfama, or take the 28 tram up through Graça for the miradouro views. Evening: natural wine at a tiny bar in Príncipe Real, or fado in a Mouraria tavern where the singer is six feet away and the room goes completely silent. The city rewards exactly the kind of slow, observant travel that solo women tend to be good at.

Beyond the postcard version, Lisbon has real creative depth. LX Factory is an industrial compound turned into studios, bookshops, and weekend markets. Marvila is the emerging neighborhood for craft breweries and contemporary galleries. The food scene has evolved well past pastéis — think petiscos (Portuguese tapas) at Time Out Market, or a solo counter seat at a modern seafood spot in Cais do Sodré. The hills are steep and the cobblestones unforgiving on the wrong shoes, but that''s the only real obstacle. Everything else about Lisbon makes it one of the easiest, most rewarding solo trips in Europe.')
WHERE slug = 'lisbon';
