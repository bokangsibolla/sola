-- Seed country guide v2 fields for 12 countries
-- Fields: best_for_md, might_struggle_md, legal_context_md, final_note_md, cash_vs_card, plug_type

-- Thailand
UPDATE countries SET
  best_for_md = 'First-time solo travelers. Thailand''s well-worn backpacker trail, affordable prices, and friendly locals make it one of the easiest countries in Southeast Asia to navigate alone. Digital nomads will find excellent co-working infrastructure in Chiang Mai and Bangkok. Wellness seekers can choose from hundreds of yoga retreats and meditation centers.',
  might_struggle_md = 'Travelers who need personal space. Thailand''s culture is communal and touristy areas are crowded. Those uncomfortable with language barriers outside tourist zones may find rural areas challenging. Strict lèse-majesté laws mean political discussion should be avoided entirely.',
  legal_context_md = 'Thailand has strict lèse-majesté laws — any criticism of the monarchy can result in imprisonment. Drug penalties are severe, including the death penalty for trafficking. Vaping and e-cigarettes are illegal and can result in fines or jail time. Always carry a copy of your passport.',
  final_note_md = 'Thailand remains one of the most accessible solo destinations in the world for women. The infrastructure is built for travelers, the food is extraordinary, and the cost of living lets you extend your stay. Take your time — the best experiences here come from slowing down.',
  cash_vs_card = 'Cash-heavy',
  plug_type = 'A, B, C'
WHERE slug = 'thailand';

-- Vietnam
UPDATE countries SET
  best_for_md = 'Adventurous eaters and budget travelers. Vietnam rewards curiosity — the best meals are at street stalls, and the country offers extraordinary value. Motorbike enthusiasts will find the Hai Van Pass and northern loops unforgettable. History buffs have endless sites from Hue to the Cu Chi tunnels.',
  might_struggle_md = 'Travelers who prefer structured tourism. Vietnam can feel chaotic, especially in Hanoi and Ho Chi Minh City traffic. Aggressive touts in tourist areas can be exhausting. The visa process has improved but still requires advance planning for many nationalities.',
  legal_context_md = 'Vietnam is a single-party state. Public criticism of the government is illegal. Photography of military installations is prohibited. Drug offenses carry severe penalties including death for trafficking. Same-sex relationships are legal but not officially recognized.',
  final_note_md = 'Vietnam is one of those places that changes how you think about travel. The food alone is worth the trip. Give yourself at least three weeks to move from north to south — the country reveals itself slowly and rewards those who take backroads.',
  cash_vs_card = 'Cash preferred',
  plug_type = 'A, C'
WHERE slug = 'vietnam';

-- Portugal
UPDATE countries SET
  best_for_md = 'Solo travelers who want European culture without the crowds or expense of western Europe. Portugal offers excellent public transit, widespread English, and a café culture that welcomes people dining and drinking alone. Remote workers thrive in Lisbon and Porto''s co-working scene.',
  might_struggle_md = 'Peak-season visitors in summer when Lisbon and the Algarve get crowded and prices surge. Those expecting constant sunshine — Portugal''s Atlantic coast can be surprisingly cool and windy. Travelers who don''t enjoy hills will find Lisbon''s terrain challenging.',
  legal_context_md = 'Portugal has progressive drug laws — personal use is decriminalized, though still not legal. It was the first country to legalize same-sex marriage in Southern Europe. Standard EU consumer protections apply.',
  final_note_md = 'Portugal consistently ranks among the best solo travel destinations for women, and for good reason. The combination of safety, affordability, beauty, and warmth makes it an ideal first solo trip to Europe or a reliable return destination.',
  cash_vs_card = 'Card widely accepted',
  plug_type = 'C, F'
WHERE slug = 'portugal';

-- Japan
UPDATE countries SET
  best_for_md = 'Detail-oriented travelers who appreciate precision, cleanliness, and cultural depth. Japan is extraordinary for solo women — the infrastructure is impeccable, public transport runs to the second, and solo dining is completely normalized. Foodies, temple enthusiasts, and those who love walking cities will be in their element.',
  might_struggle_md = 'Budget travelers — Japan is expensive, though careful planning helps. Those who rely on spontaneity may find the reservation culture (especially for restaurants) frustrating. Travelers who need English signage outside major cities will face challenges. The cultural emphasis on rules and etiquette requires awareness.',
  legal_context_md = 'Japan has very low crime rates and strict enforcement. Drug laws are extremely strict — even small amounts of marijuana carry prison sentences. There are women-only train cars during rush hour. Same-sex marriage is not legally recognized nationally, though some municipalities offer partnership certificates.',
  final_note_md = 'Japan is in a category of its own. The attention to detail in everything — from a convenience store onigiri to a temple garden — makes every day feel like a series of small discoveries. Solo travel here is not just easy, it''s the ideal way to experience the country at your own pace.',
  cash_vs_card = 'Cash still important',
  plug_type = 'A, B'
WHERE slug = 'japan';

-- Colombia
UPDATE countries SET
  best_for_md = 'Travelers who love energy, color, and spontaneity. Colombia rewards the sociable and the curious. Salsa dancers, coffee lovers, and street art enthusiasts will find their people. The country offers incredible geographic diversity from Caribbean beaches to Andean highlands to Amazon jungle.',
  might_struggle_md = 'Travelers who need constant predictability. Colombia can be chaotic — bus schedules are loose, plans change, and some areas require security awareness. Those uncomfortable with persistent attention from men may find it tiring in some regions. Spanish is essential outside major tourist areas.',
  legal_context_md = 'Colombia has made significant security improvements but drug-related crime persists in certain areas. Same-sex marriage has been legal since 2016. Coca leaf tea is legal and common in highland areas. Scopolamine (drugging) is a real risk — never accept food or drinks from strangers.',
  final_note_md = 'Colombia has emerged as one of South America''s most compelling destinations. The transformation is real, the people are genuinely warm, and the landscape variety is staggering. Go with an open schedule, learn some Spanish, and let the country surprise you.',
  cash_vs_card = 'Cash essential outside cities',
  plug_type = 'A, B'
WHERE slug = 'colombia';

-- Mexico
UPDATE countries SET
  best_for_md = 'Culture lovers and foodies. Mexico''s depth of history, art, and cuisine is unmatched in the Americas. Solo women travelers are well-served by the strong hostel and digital nomad infrastructure, especially in Mexico City, Oaxaca, and San Cristóbal. Spanish learners will find total immersion easy.',
  might_struggle_md = 'Travelers who are anxious about safety headlines. While many areas are perfectly safe, the constant media narrative can be stressful. Those who don''t speak any Spanish will struggle outside tourist zones. Beach-resort travelers may miss the real Mexico entirely.',
  legal_context_md = 'Mexico''s security situation varies dramatically by region. Same-sex marriage is legal nationwide since 2022. Marijuana is decriminalized for personal use but remains technically illegal. Corruption exists at many institutional levels — keep copies of all documents.',
  final_note_md = 'Mexico is not one country — it''s dozens. A week in Oaxaca feels nothing like a week in Tulum or Mexico City. The depth of culture, the generosity of people, and the food (always the food) make this a place that solo travelers return to again and again.',
  cash_vs_card = 'Cash preferred for markets',
  plug_type = 'A, B'
WHERE slug = 'mexico';

-- Indonesia
UPDATE countries SET
  best_for_md = 'Yoga practitioners, surfers, and those seeking spiritual experiences. Bali''s wellness infrastructure is world-class. Island-hoppers will find extraordinary variety from Komodo to Raja Ampat. Budget travelers can live well in most of Indonesia outside Bali''s tourist core.',
  might_struggle_md = 'Travelers who want everything organized in advance. Indonesia''s domestic transport can be unreliable, and island logistics require flexibility. Solo women in conservative areas outside Bali should dress modestly. Those who want to avoid other tourists may find Bali challenging.',
  legal_context_md = 'Indonesia''s new criminal code (2025) criminalizes sex outside marriage and cohabitation. Enforcement against tourists is rare but the law exists. Drug penalties are extremely severe including death. Bali operates differently culturally but national laws apply. Same-sex relationships are not recognized.',
  final_note_md = 'Indonesia is vast — 17,000 islands vast. Bali is the comfortable entry point, but the real magic is in venturing beyond. Give yourself enough time to deal with ferry delays and flight cancellations, and you''ll discover some of the most beautiful places on earth.',
  cash_vs_card = 'Cash essential outside Bali',
  plug_type = 'C, F'
WHERE slug = 'indonesia';

-- Morocco
UPDATE countries SET
  best_for_md = 'Travelers who love sensory overload — the colors, sounds, smells, and flavors of Morocco are extraordinary. Architecture enthusiasts, photographers, and those drawn to desert landscapes will find endless inspiration. Experienced solo women travelers who enjoy cultural immersion.',
  might_struggle_md = 'First-time solo women travelers. Morocco requires confidence and boundary-setting, especially in medinas where persistent touts and unsolicited male attention are common. Those who are uncomfortable with haggling or aggressive salesmanship will find souks stressful.',
  legal_context_md = 'Morocco criminalizes homosexuality with up to 3 years imprisonment. Sex outside marriage is technically illegal. Public displays of affection should be avoided. Cannabis (kif) is widely available but illegal. Ramadan requires sensitivity — avoid eating, drinking, or smoking in public during fasting hours.',
  final_note_md = 'Morocco is one of the most visually stunning countries you''ll visit. It requires more energy than many destinations, but the rewards — riads at sunset, desert camps under stars, mint tea with strangers — are proportional to the effort. Come prepared and you''ll leave transformed.',
  cash_vs_card = 'Cash essential',
  plug_type = 'C, E'
WHERE slug = 'morocco';

-- Greece
UPDATE countries SET
  best_for_md = 'History lovers, beach seekers, and those who want easy Mediterranean solo travel. Greece''s island-hopping culture is perfect for solo travelers — ferries make it simple to combine multiple islands. The food, the light, and the pace of life here are genuinely restorative.',
  might_struggle_md = 'Budget travelers in peak summer — Greek islands become expensive from June to August. Those who dislike crowds should avoid Santorini and Mykonos in high season. Travelers expecting efficient bureaucracy will be frustrated — Greek time is its own concept.',
  legal_context_md = 'Greece legalized same-sex civil unions in 2015 and same-sex marriage in 2024. It''s generally progressive for Southern Europe. Standard EU laws apply. Drug laws are strict — even small amounts of cannabis can lead to prosecution.',
  final_note_md = 'Greece is one of those rare places where the reality matches the postcard. The light really is that golden, the water really is that blue, and the people really are that welcoming. Solo travelers will find that eating alone at a taverna with a sea view is one of life''s great pleasures.',
  cash_vs_card = 'Card widely accepted',
  plug_type = 'C, F'
WHERE slug = 'greece';

-- South Korea
UPDATE countries SET
  best_for_md = 'K-culture enthusiasts, skincare devotees, and foodies. South Korea is incredibly safe for solo women — late-night streets feel secure, public transport is spotless, and solo dining (honbap culture) is celebrated. Tech-savvy travelers will appreciate the ultra-fast internet and cashless infrastructure.',
  might_struggle_md = 'Those who find conformity culture uncomfortable. Korean society can feel hierarchical and appearance-focused. Vegetarians and vegans will struggle — Korean cuisine is heavily meat-based. Those who expect widespread English outside Seoul may be disappointed.',
  legal_context_md = 'South Korea does not recognize same-sex marriage or civil unions, though attitudes are shifting among younger generations. Drug laws are extremely strict — even cannabis carries severe penalties. Mandatory military service means conversations about it can be sensitive.',
  final_note_md = 'South Korea will surprise you. Beyond the K-pop and skincare, there''s a deeply layered culture with ancient temples beside neon cities, mountain trails minutes from subway stations, and some of the most inventive food in Asia. It''s one of the safest solo destinations in the world.',
  cash_vs_card = 'Card/mobile pay dominant',
  plug_type = 'C, F'
WHERE slug = 'south-korea';

-- Costa Rica
UPDATE countries SET
  best_for_md = 'Nature lovers and eco-conscious travelers. Costa Rica''s biodiversity per square kilometer is unmatched. Solo women benefit from excellent tourism infrastructure, friendly locals, and a culture that genuinely values sustainability. Surfers, hikers, and wildlife photographers will be in paradise.',
  might_struggle_md = 'Budget travelers — Costa Rica is expensive by Central American standards. Those expecting pristine beaches everywhere may be surprised by the Pacific coast''s rough surf. Getting between destinations often requires long, winding bus rides. The rainy season (May–November) is serious.',
  legal_context_md = 'Costa Rica was the first Central American country to legalize same-sex marriage (2020). It has no military. Environmental protections are strong — removing wildlife or plants is illegal. Standard tourist visa allows 90 days.',
  final_note_md = 'Costa Rica earns its reputation. The combination of safety, natural beauty, and genuinely sustainable tourism makes it the easiest solo destination in Central America. "Pura vida" sounds like a tourism slogan until you experience it — then it just makes sense.',
  cash_vs_card = 'Card accepted in tourist areas',
  plug_type = 'A, B'
WHERE slug = 'costa-rica';

-- Peru
UPDATE countries SET
  best_for_md = 'Adventure seekers and history enthusiasts. Peru offers Machu Picchu (obviously), but also the Amazon, incredible cuisine in Lima, and trekking routes that rival Nepal. Solo women travelers with some Spanish and travel experience will find a deeply rewarding destination.',
  might_struggle_md = 'First-time solo travelers without Spanish — outside Lima and Cusco, English is limited. Altitude sickness is real and can derail plans if you don''t acclimatize. Those expecting efficient transport will struggle with long bus journeys. Petty theft in Lima requires constant awareness.',
  legal_context_md = 'Peru does not recognize same-sex marriage or civil unions. Drug penalties are severe. Altitude sickness medication (acetazolamide) is available at pharmacies without prescription. Protests and road blockages occur periodically — check current conditions before internal travel.',
  final_note_md = 'Peru is one of those places where every type of traveler finds something extraordinary. The food scene in Lima alone justifies the trip. Add Machu Picchu, the Sacred Valley, Lake Titicaca, and the Amazon, and you have a destination that could fill months of exploration.',
  cash_vs_card = 'Cash essential outside Lima',
  plug_type = 'A, B, C'
WHERE slug = 'peru';
