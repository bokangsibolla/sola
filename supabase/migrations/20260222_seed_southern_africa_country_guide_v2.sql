-- Seed country guide v2 fields for 5 Southern Africa countries
-- Fields: best_for_md, might_struggle_md, legal_context_md, final_note_md, cash_vs_card, plug_type

-- Fix: Lesotho (LS) was missing from the continent mapping
UPDATE countries SET continent = 'africa' WHERE iso2 = 'LS' AND continent IS NULL;

-- South Africa
UPDATE countries SET
  best_for_md = 'Travelers wanting African experiences with first-world infrastructure. South Africa offers Big Five safaris, world-class wine regions, dramatic coastline, and a food scene that rivals anywhere — all with reliable roads, fast internet, and Uber on demand. First-time Africa visitors will find Cape Town as comfortable as any European city, while Kruger delivers a self-drive safari experience that is both accessible and genuinely wild.',
  might_struggle_md = 'Travelers who are uncomfortable with visible inequality. South Africa''s contrasts are stark — luxury estates sit minutes from townships, and this can be confronting. Those who expect to walk everywhere freely will find that car dependency and safety awareness are part of daily life in most cities. Load shedding (rolling power cuts) still disrupts businesses and requires patience.',
  legal_context_md = 'South Africa has one of the world''s most progressive constitutions. Same-sex marriage has been legal since 2006. Cannabis for personal use was decriminalized in 2018 for private consumption. Gender-based violence rates are high — this is a societal issue that affects local women disproportionately. Emergency number is 10111 for police, 10177 for ambulance.',
  final_note_md = 'South Africa is not one place — it is a continent compressed into a country. The distance from Cape Town to Kruger is the same as London to Rome. Give yourself time, don''t try to do everything, and know that the combination of natural beauty, cultural depth, and warm hospitality will make you want to come back.',
  cash_vs_card = 'Card widely accepted',
  plug_type = 'M, C, N'
WHERE slug = 'south-africa';

-- Lesotho
UPDATE countries SET
  best_for_md = 'Mountain lovers and off-grid seekers. Lesotho is the only country in the world entirely above 1,000 meters, and its highland landscapes are breathtaking and barely visited. Pony trekking through villages, standing at the edge of Maletsunyane Falls, and sleeping in a mountain hut with no electricity — this is Africa at its most raw and rewarding for those willing to trade comfort for authenticity.',
  might_struggle_md = 'Travelers who need reliable infrastructure. Roads are rough (often requiring 4WD), accommodation is limited, and services outside Maseru are basic at best. Those who don''t enjoy cold weather will be surprised — Lesotho gets snow in winter and nights are freezing even in summer at altitude. This is not a destination for anyone expecting ease.',
  legal_context_md = 'Lesotho is a constitutional monarchy and one of Africa''s most peaceful countries. Same-sex sexual activity is technically criminalized for men but not enforced. Customary law coexists with civil law, particularly in rural areas. The Basotho people are deeply proud of their independence — Lesotho was never colonized, which shapes the national identity.',
  final_note_md = 'Lesotho is one of southern Africa''s best-kept secrets. It is not easy, it is not luxurious, and it is not for everyone. But if you want mountains that make you feel small, genuinely warm people who are curious about you, and the knowledge that you have been somewhere almost no other traveler goes — Lesotho delivers in ways that polished destinations cannot.',
  cash_vs_card = 'Cash essential',
  plug_type = 'M'
WHERE slug = 'lesotho';

-- Zimbabwe
UPDATE countries SET
  best_for_md = 'Waterfall seekers and safari enthusiasts who want authentic experiences without the premium prices of neighboring Botswana. Victoria Falls alone justifies the trip, but Zimbabwe''s national parks (Hwange, Mana Pools, Matobo) offer world-class wildlife without the crowds. The people are famously warm and educated, and the country''s complex history makes for meaningful conversations.',
  might_struggle_md = 'Travelers who are uncomfortable with economic unpredictability. Zimbabwe''s currency situation has been unstable for decades — prices change, USD is king, and you need to carry physical cash. Those expecting smooth logistics will find domestic transport unreliable. Infrastructure outside tourist hubs is often in poor condition.',
  legal_context_md = 'Zimbabwe criminalizes same-sex sexual activity with up to one year imprisonment, though enforcement is rare against tourists. Political expression is restricted — avoid discussing politics with strangers or in public. Photography of government buildings, military, and police is prohibited. It is illegal to deface Zimbabwean currency, including crumpling notes.',
  final_note_md = 'Zimbabwe is a country that deserves more visitors than it gets. The wildlife is extraordinary, Victoria Falls is genuinely one of the most impressive natural sights on Earth, and Zimbabweans themselves are some of the most gracious, educated, and resilient people you will meet anywhere. Carry USD, be patient with infrastructure, and let the country show you what it has.',
  cash_vs_card = 'Cash essential (USD)',
  plug_type = 'G'
WHERE slug = 'zimbabwe';

-- Namibia
UPDATE countries SET
  best_for_md = 'Self-drivers and photographers. Namibia is the ultimate road trip country — vast desert landscapes, wildlife-lined roads, and some of the most photogenic scenery on Earth. Solo women who are comfortable behind the wheel of a 4WD will find Namibia extraordinarily rewarding. The country is sparsely populated, politically stable, and visually unlike anywhere else you have been.',
  might_struggle_md = 'Travelers who don''t drive or dislike long distances. Namibia is enormous and public transport is virtually nonexistent outside Windhoek. Distances between destinations are measured in hundreds of kilometers of gravel road, and breakdowns in remote areas are a real consideration. Budget travelers will find accommodation and activities more expensive than neighboring countries.',
  legal_context_md = 'Namibia criminalizes same-sex sexual activity for men under colonial-era laws, though enforcement is rare. The country is politically stable and one of Africa''s most functional democracies. Wildlife poaching carries severe penalties. It is illegal to remove any natural materials (rocks, plants, fossils) from national parks.',
  final_note_md = 'Namibia will recalibrate your sense of scale. The dunes at Sossusvlei, the Skeleton Coast, the wildlife of Etosha — these landscapes are so vast and so empty that they change how you see the world. Rent a good vehicle, carry extra water and fuel, and give yourself at least two weeks. This country rewards those who go slow and look closely.',
  cash_vs_card = 'Cash needed outside cities',
  plug_type = 'M, D'
WHERE slug = 'namibia';

-- Mozambique
UPDATE countries SET
  best_for_md = 'Divers and beach lovers who want raw, undiscovered coastline. Mozambique''s 2,500 km of Indian Ocean coast offers some of Africa''s best marine life — whale sharks in Tofo, pristine reefs in the Bazaruto Archipelago, and empty white-sand beaches that feel genuinely untouched. Travelers who speak Portuguese (or are willing to try) will find deeper connections in a country where tourism infrastructure is still emerging.',
  might_struggle_md = 'Travelers who need reliable infrastructure. Roads outside the EN1 highway are often unpaved and flood-prone. English is not widely spoken — Portuguese and local languages dominate. Healthcare is limited, travel insurance with medical evacuation is non-negotiable. The northern provinces (Cabo Delgado) have active security concerns and should be avoided entirely.',
  legal_context_md = 'Mozambique decriminalized same-sex sexual activity in 2015, making it one of the more progressive countries in the region. However, social attitudes remain conservative outside Maputo. Landmines from the civil war (ended 1992) are still being cleared in rural areas — stick to established roads and paths. Photography of military installations and government buildings is prohibited.',
  final_note_md = 'Mozambique is not a polished destination and it does not pretend to be. What it offers instead is extraordinary — warm Indian Ocean water, marine encounters that rival the Maldives at a fraction of the cost, a Portuguese-African culture found nowhere else, and the feeling of being somewhere genuinely off the beaten path. Come with patience, flexibility, and a sense of adventure, and Mozambique will reward you with experiences you cannot get anywhere else in Africa.',
  cash_vs_card = 'Cash essential',
  plug_type = 'C, F'
WHERE slug = 'mozambique';
