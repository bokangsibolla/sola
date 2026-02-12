-- =============================================================
-- Migration: Update Google Maps URLs from Places API lookup
-- Found: 201/201 places
-- =============================================================

BEGIN;

-- Manually resolved (Vietnamese diacritics)
UPDATE places SET
  google_place_id = 'ChIJvxBc3TSrNTERmc5NPItxzgY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cha%20Ca%20Thang%20Long&query_place_id=ChIJvxBc3TSrNTERmc5NPItxzgY'
WHERE slug = 'cha-ca-thang-long';

UPDATE places SET
  google_place_id = 'ChIJ0bszZuAvdTERpouhodSCRo0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kieu%20Bao%20Barbecue%20Rice%20Noodles&query_place_id=ChIJ0bszZuAvdTERpouhodSCRo0'
WHERE slug = 'kieu-bao-barbecue';

UPDATE places SET
  google_place_id = 'ChIJUXT3NL6Z4jARwh3cJq_bkog',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sarnies%20Cafe%20Charoen%20Krung&query_place_id=ChIJUXT3NL6Z4jARwh3cJq_bkog'
WHERE slug = 'sarnies-cafe-charoen-krung';

UPDATE places SET
  google_place_id = 'ChIJs9jA2Vyf4jARevKn7qQ1V_E',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=%25%20Arabica%20Park%20Silom&query_place_id=ChIJs9jA2Vyf4jARevKn7qQ1V_E'
WHERE slug = 'arabica-park-silom';

UPDATE places SET
  google_place_id = 'ChIJuxpP96mf4jARqZPYPN045Xs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Broccoli%20Revolution%20Thonglor&query_place_id=ChIJuxpP96mf4jARqZPYPN045Xs'
WHERE slug = 'broccoli-revolution-thonglor';

UPDATE places SET
  google_place_id = 'ChIJz7sn9CCZ4jAR_pLoJJDAUF0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lim%20Lao%20Ngow%20Fishball%20Noodles&query_place_id=ChIJz7sn9CCZ4jAR_pLoJJDAUF0'
WHERE slug = 'lim-lao-ngow-chinatown';

UPDATE places SET
  google_place_id = 'ChIJs35euSyf4jARfu0VAfJvE4A',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Smile%20Society%20Boutique%20Hostel&query_place_id=ChIJs35euSyf4jARfu0VAfJvE4A'
WHERE slug = 'smile-society-hostel';

UPDATE places SET
  google_place_id = 'ChIJlb2fOqae4jARKp8gzFyam88',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Yard%20Hostel%20Bangkok&query_place_id=ChIJlb2fOqae4jARKp8gzFyam88'
WHERE slug = 'the-yard-hostel-ari';

UPDATE places SET
  google_place_id = 'ChIJNR_QAkSf4jARbTRljQDBL70',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Dusit%20Thani%20Bangkok&query_place_id=ChIJNR_QAkSf4jARbTRljQDBL70'
WHERE slug = 'dusit-thani-bangkok';

UPDATE places SET
  google_place_id = 'ChIJ3fiD6BSc4jARS324hNeR8ZE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chatuchak%20Weekend%20Market&query_place_id=ChIJ3fiD6BSc4jARS324hNeR8ZE'
WHERE slug = 'chatuchak-weekend-market';

UPDATE places SET
  google_place_id = 'ChIJvccM01iZ4jARPwr8_uBuM_8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Wat%20Benchamabophit%20%28Marble%20Temple%29&query_place_id=ChIJvccM01iZ4jARPwr8_uBuM_8'
WHERE slug = 'wat-benchamabophit-marble-temple';

UPDATE places SET
  google_place_id = 'ChIJrdfOcJOZ4jAR1Grh5w74V1g',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chinatown%20Walking%20Tour&query_place_id=ChIJrdfOcJOZ4jAR1Grh5w74V1g'
WHERE slug = 'chinatown-walking-tour';

UPDATE places SET
  google_place_id = 'ChIJw5T0TM072jAR408yNwb8Nbk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Graph%20Coffee%20%28Graph%20One%20Nimman%29&query_place_id=ChIJw5T0TM072jAR408yNwb8Nbk'
WHERE slug = 'graph-coffee-nimman';

UPDATE places SET
  google_place_id = 'ChIJD4H24Yk62jAROruoggeyK7M',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Librarista%20Cafe&query_place_id=ChIJD4H24Yk62jAROruoggeyK7M'
WHERE slug = 'librarista-nimman';

UPDATE places SET
  google_place_id = 'ChIJ-WreYwA72jAR_lwUyVfW90Q',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Rustic%20%26%20Blue&query_place_id=ChIJ-WreYwA72jAR_lwUyVfW90Q'
WHERE slug = 'rustic-and-blue-nimman';

UPDATE places SET
  google_place_id = 'ChIJWZaiH5E62jARRim_7KfAf5w',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=About%20A%20Bed%20Hostel%20Chiang%20Mai&query_place_id=ChIJWZaiH5E62jARRim_7KfAf5w'
WHERE slug = 'about-a-bed-hostel-chiang-mai';

UPDATE places SET
  google_place_id = 'ChIJIeSb25s62jARqk8jiQEMsBI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Green%20Sleep%20Hostel&query_place_id=ChIJIeSb25s62jARqk8jiQEMsBI'
WHERE slug = 'green-sleep-hostel-chiang-mai';

UPDATE places SET
  google_place_id = 'ChIJ25n9a4gx2jARozEUrblt3Ew',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hidden%20Garden%20Hostel&query_place_id=ChIJ25n9a4gx2jARozEUrblt3Ew'
WHERE slug = 'hidden-garden-hostel-chiang-mai';

UPDATE places SET
  google_place_id = 'ChIJmfFC2qE62jARkypCwRoviAo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=La%20Maison%20Verte%20Guest%20House&query_place_id=ChIJmfFC2qE62jARkypCwRoviAo'
WHERE slug = 'la-maison-verte-chiang-mai';

UPDATE places SET
  google_place_id = 'ChIJbyRKbps62jAR6VTNF-fZVpY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Wat%20Phra%20Singh&query_place_id=ChIJbyRKbps62jAR6VTNF-fZVpY'
WHERE slug = 'wat-phra-singh-chiang-mai';

UPDATE places SET
  google_place_id = 'ChIJiXiBQ-kb2jARHfa8qGwbWcc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bua%20Thong%20Sticky%20Waterfall%20Day%20Trip&query_place_id=ChIJiXiBQ-kb2jARHfa8qGwbWcc'
WHERE slug = 'bua-thong-sticky-waterfall-day-trip';

UPDATE places SET
  google_place_id = 'ChIJ_5-9gHUw2jARGOGQoIf_O4Q',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chiang%20Mai%20Sunday%20Night%20Market%20%28Wua%20Lai%20Walking%20Street%29&query_place_id=ChIJ_5-9gHUw2jARGOGQoIf_O4Q'
WHERE slug = 'chiang-mai-sunday-night-market';

UPDATE places SET
  google_place_id = 'ChIJ9V1w7lT9VDARlVO5GXqQtWw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Young%20Son%20Cafe&query_place_id=ChIJ9V1w7lT9VDARlVO5GXqQtWw'
WHERE slug = 'young-son-cafe-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJfQ5MDSL9VDARyobCmhfJ3dE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Satimi%20Sook%20%28Homemade%20Ice%20Cream%29&query_place_id=ChIJfQ5MDSL9VDARyobCmhfJ3dE'
WHERE slug = 'satimi-ice-cream-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJKaDcHcQBVTARZGuCfCsdHII',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Koh%20Raham%20Restaurant%20%26%20Beach%20Bar&query_place_id=ChIJKaDcHcQBVTARZGuCfCsdHII'
WHERE slug = 'koh-raham-restaurant-beach-bar';

UPDATE places SET
  google_place_id = 'ChIJ3Rf7MP39VDAR6fq-GQDMLJI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Purple%20House%20Female-Only%20Boutique%20Hostel&query_place_id=ChIJ3Rf7MP39VDAR6fq-GQDMLJI'
WHERE slug = 'purple-house-female-hostel-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJZ-YSNOoCVTAR0YNeV-d-i9U',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Anantara%20Rasananda%20Koh%20Phangan%20Villas&query_place_id=ChIJZ-YSNOoCVTAR0YNeV-d-i9U'
WHERE slug = 'anantara-rasananda-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJXV1vMJ79VDARHTfq4FD9py0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Remote%20%26%20Digital%20%28La%20Casa%20Coworking%29&query_place_id=ChIJXV1vMJ79VDARHTfq4FD9py0'
WHERE slug = 'remote-and-digital-coworking-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJ__zgCCH-VDARXiKqT6BtWf4',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Orion%20Healing%20Center&query_place_id=ChIJ__zgCCH-VDARXiKqT6BtWf4'
WHERE slug = 'orion-healing-center-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJN2i0uVr8VDARFBpM50L6XAU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Beachlove%20Hostel&query_place_id=ChIJN2i0uVr8VDARFBpM50L6XAU'
WHERE slug = 'beachlove-hostel-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJFUAUrev_VDARo-Twa-ZQELw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Indriya%20Retreat%20%28Meditation%20%26%20Yoga%29&query_place_id=ChIJFUAUrev_VDARo-Twa-ZQELw'
WHERE slug = 'indriya-retreat-meditation-koh-phangan';

UPDATE places SET
  google_place_id = 'ChIJH9AS_pKrNTERuoUreszQtPk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Asia%20Vespa%20Tours%20-%20Women-Led%20Hanoi%20Tours&query_place_id=ChIJH9AS_pKrNTERuoUreszQtPk'
WHERE slug = 'asia-vespa-tours-women-led';

UPDATE places SET
  google_place_id = 'ChIJkcjWsLqrNTERdatZe_6Zzec',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bluebirds%27%20Nest&query_place_id=ChIJkcjWsLqrNTERdatZe_6Zzec'
WHERE slug = 'bluebirds-nest-hanoi';

UPDATE places SET
  google_place_id = 'ChIJp1qjewCrNTERAtj_QxJwGdE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bun%20Thang%20Ba%20Duc&query_place_id=ChIJp1qjewCrNTERAtj_QxJwGdE'
WHERE slug = 'bun-thang-ba-duc';

UPDATE places SET
  google_place_id = 'ChIJgWaawsCrNTER216qul6ubmY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Caf%C3%83%C2%A9%20Gi%C3%A1%C2%BA%C2%A3ng%20-%20Egg%20Coffee&query_place_id=ChIJgWaawsCrNTER216qul6ubmY'
WHERE slug = 'cafe-giang-hanoi';

UPDATE places SET
  google_place_id = 'ChIJecDzv5WrNTERyZe6bcGxMBA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Duong%27s%20Restaurant&query_place_id=ChIJecDzv5WrNTERyZe6bcGxMBA'
WHERE slug = 'duongs-restaurant';

UPDATE places SET
  google_place_id = 'ChIJ2dmnILWrNTER9XP9YdDhqDQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hanoi%20Buffalo%20Hostel&query_place_id=ChIJ2dmnILWrNTER9XP9YdDhqDQ'
WHERE slug = 'hanoi-buffalo-hostel';

UPDATE places SET
  google_place_id = 'ChIJW4FHELyrNTER0oiuwtpVPLk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Little%20Charm%20Hanoi%20Hostel&query_place_id=ChIJW4FHELyrNTER0oiuwtpVPLk'
WHERE slug = 'little-charm-hostel';

UPDATE places SET
  google_place_id = 'ChIJaTMG6b2rNTER8iBBB4Ctlr8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tranquil%20Books%20%26%20Coffee&query_place_id=ChIJaTMG6b2rNTER8iBBB4Ctlr8'
WHERE slug = 'tranquil-books-coffee';

UPDATE places SET
  google_place_id = 'ChIJC044E9kudTERi2Ozcof-Was',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=FITO%20Museum%20%28Museum%20of%20Traditional%20Vietnamese%20Medicine%29&query_place_id=ChIJC044E9kudTERi2Ozcof-Was'
WHERE slug = 'fito-museum';

UPDATE places SET
  google_place_id = 'ChIJPccxGQAvdTERYMYelqaxe8M',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ho%20Chi%20Minh%20City%20Museum%20of%20Fine%20Arts&query_place_id=ChIJPccxGQAvdTERYMYelqaxe8M'
WHERE slug = 'ho-chi-minh-fine-arts-museum';

UPDATE places SET
  google_place_id = 'ChIJYffbXBkpdTERjQgD7Syp7Tg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Jade%20Emperor%20Pagoda%20%28Ngoc%20Hoang%20Pagoda%29&query_place_id=ChIJYffbXBkpdTERjQgD7Syp7Tg'
WHERE slug = 'jade-emperor-pagoda';

UPDATE places SET
  google_place_id = 'ChIJp_9PWUYvdTERdGoPH4dO6As',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Level%2023%20Wine%20Bar&query_place_id=ChIJp_9PWUYvdTERdGoPH4dO6As'
WHERE slug = 'level-23-wine-bar';

UPDATE places SET
  google_place_id = 'ChIJIct26kovdTERD_qn06V-7Ck',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Meander%20Saigon&query_place_id=ChIJIct26kovdTERD_qn06V-7Ck'
WHERE slug = 'meander-saigon';

UPDATE places SET
  google_place_id = 'ChIJoz2M2EgvdTERLFRcCOtuC70',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ngon%20Restaurant&query_place_id=ChIJoz2M2EgvdTERLFRcCOtuC70'
WHERE slug = 'ngon-restaurant-saigon';

UPDATE places SET
  google_place_id = 'ChIJo3fAopwvdTER7t8UYiqfY34',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ng%C3%83%C2%A2m%20Caf%C3%83%C2%A9&query_place_id=ChIJo3fAopwvdTER7t8UYiqfY34'
WHERE slug = 'ngam-cafe-ho-chi-minh';

UPDATE places SET
  google_place_id = 'ChIJw7k36kYvdTERJ9L8Dd7o-0U',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Saigon%20%C3%86%C2%A0i%20Caf%C3%83%C2%A9&query_place_id=ChIJw7k36kYvdTERJ9L8Dd7o-0U'
WHERE slug = 'saigon-oi-cafe-apartment';

UPDATE places SET
  google_place_id = 'ChIJJxugEakvdTEReVWsSv7mOu8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Secret%20Garden%20Vietnamese%20Restaurant&query_place_id=ChIJJxugEakvdTEReVWsSv7mOu8'
WHERE slug = 'secret-garden-vietnamese-restaurant';

UPDATE places SET
  google_place_id = 'ChIJPfSRmysvdTERtO_7dVtiMRY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Like%20Hostel%20%26%20Cafe&query_place_id=ChIJPfSRmysvdTERtO_7dVtiMRY'
WHERE slug = 'the-like-hostel-cafe';

UPDATE places SET
  google_place_id = 'ChIJuWO_kD4vdTERsrPgrKR1aY0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20White%20Hotel%208A%20Thai%20Van%20Lung&query_place_id=ChIJuWO_kD4vdTERsrPgrKR1aY0'
WHERE slug = 'the-white-hotel-thai-van-lung';

UPDATE places SET
  google_place_id = 'ChIJlVfNx4gvdTER6GQKnLqekHU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=XLIII%20Coffee&query_place_id=ChIJlVfNx4gvdTER6GQKnLqekHU'
WHERE slug = 'xliii-coffee-saigon';

UPDATE places SET
  google_place_id = 'ChIJ_RmaJ8IPQjEROzAKwQSGLKw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=BlueBerry%20Hoi%20An%20Spa&query_place_id=ChIJ_RmaJ8IPQjEROzAKwQSGLKw'
WHERE slug = 'blueberry-hoi-an-spa';

UPDATE places SET
  google_place_id = 'ChIJB7zs3XsOQjERTijWogqRQSc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cao%20L%C3%83%C2%A2u%20Kh%C3%83%C2%B4ng%20Gian%20Xanh&query_place_id=ChIJB7zs3XsOQjERTijWogqRQSc'
WHERE slug = 'cao-lau-khong-gian-xanh';

UPDATE places SET
  google_place_id = 'ChIJK-SyHwAPQjEREwtNPs0Ws1k',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hoi%20An%20Roastery%20Coffee&query_place_id=ChIJK-SyHwAPQjEREwtNPs0Ws1k'
WHERE slug = 'hoi-an-roastery';

UPDATE places SET
  google_place_id = 'ChIJfd7Ua_ANQjERpJOC8xozDhs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Little%20Daisy%20Hoi%20An%20-%20Hand%20Embroidery%20Workshop&query_place_id=ChIJfd7Ua_ANQjERpJOC8xozDhs'
WHERE slug = 'little-daisy-hoi-an-embroidery';

UPDATE places SET
  google_place_id = 'ChIJDcmxfn4OQjER08GcEhVPqBU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Mango%20Rooms&query_place_id=ChIJDcmxfn4OQjER08GcEhVPqBU'
WHERE slug = 'mango-rooms';

UPDATE places SET
  google_place_id = 'ChIJtcXcC7UNQjER3x9vm_Q33RE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Red%20Bridge%20Cooking%20School%20%26%20Restaurant&query_place_id=ChIJtcXcC7UNQjER3x9vm_Q33RE'
WHERE slug = 'red-bridge-cooking-school';

UPDATE places SET
  google_place_id = 'ChIJa7elVX4OQjERNb1LPI7CysA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tam%20Tam%20Cafe&query_place_id=ChIJa7elVX4OQjERNb1LPI7CysA'
WHERE slug = 'tam-tam-cafe';

UPDATE places SET
  google_place_id = 'ChIJFcmastUNQjERHiA9CFt5l-4',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Lantern%20Lady%20-%20Lantern%20Making%20Workshops&query_place_id=ChIJFcmastUNQjERHiA9CFt5l-4'
WHERE slug = 'hoi-an-lantern-making-workshop';

UPDATE places SET
  google_place_id = 'ChIJAelhGKINQjERh2pm3Ayu-fA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tribee%20Ede%20Hostel%20%26%20Bar&query_place_id=ChIJAelhGKINQjERh2pm3Ayu-fA'
WHERE slug = 'tribee-ede-hostel';

UPDATE places SET
  google_place_id = 'ChIJkWQr5nYOQjERml4pQTZ7-o8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=White%20Rose%20Restaurant&query_place_id=ChIJkWQr5nYOQjERml4pQTZ7-o8'
WHERE slug = 'white-rose-restaurant';

UPDATE places SET
  google_place_id = 'ChIJI-GvWwA90i0R2R8nRGYlyv4',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=2%20Bulan&query_place_id=ChIJI-GvWwA90i0R2R8nRGYlyv4'
WHERE slug = '2-bulan-ubud';

UPDATE places SET
  google_place_id = 'ChIJVY_uvV490i0Rp2rypfscVk0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=NARI&query_place_id=ChIJVY_uvV490i0Rp2rypfscVk0'
WHERE slug = 'nari-ubud';

UPDATE places SET
  google_place_id = 'ChIJ8RU0O5o90i0RYdmJnqP-JwI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kurasu%20Ubud&query_place_id=ChIJ8RU0O5o90i0RYdmJnqP-JwI'
WHERE slug = 'kurasu-ubud';

UPDATE places SET
  google_place_id = 'ChIJ6ZmBcRU90i0R05yrg5hJkJY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=SiniSaja&query_place_id=ChIJ6ZmBcRU90i0R05yrg5hJkJY'
WHERE slug = 'sini-saja-ubud';

UPDATE places SET
  google_place_id = 'ChIJOxnp7o890i0RWiAy2ZSbpSM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=7AM%20Bakers&query_place_id=ChIJOxnp7o890i0RWiAy2ZSbpSM'
WHERE slug = '7am-bakers-ubud';

UPDATE places SET
  google_place_id = 'ChIJl4P9TB8j0i0Rh5ri62ySXDI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cantina%20Classe&query_place_id=ChIJl4P9TB8j0i0Rh5ri62ySXDI'
WHERE slug = 'cantina-classe-ubud';

UPDATE places SET
  google_place_id = 'ChIJJQhT6KA90i0RiIrfxiXiYmU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Outpost%20Ubud&query_place_id=ChIJJQhT6KA90i0RiIrfxiXiYmU'
WHERE slug = 'outpost-ubud-coworking';

UPDATE places SET
  google_place_id = 'ChIJh3i8FLo50i0Rklbo5xFbOYQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sol%20Rooftop&query_place_id=ChIJh3i8FLo50i0Rklbo5xFbOYQ'
WHERE slug = 'sol-rooftop-canggu';

UPDATE places SET
  google_place_id = 'ChIJhY50BH9H0i0RCdXsyoE0uGU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Atlas%20Beach%20Club&query_place_id=ChIJhY50BH9H0i0RCdXsyoE0uGU'
WHERE slug = 'atlas-beach-club-canggu';

UPDATE places SET
  google_place_id = 'ChIJnxFCS3pH0i0RE9mJ0v6ZkHA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Brunch%20Club%20Bali&query_place_id=ChIJnxFCS3pH0i0RE9mJ0v6ZkHA'
WHERE slug = 'brunch-club-bali-canggu';

UPDATE places SET
  google_place_id = 'ChIJi2HK2H850i0RZ8R8JnWsNKU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cantina%20Classe%20Canggu&query_place_id=ChIJi2HK2H850i0RZ8R8JnWsNKU'
WHERE slug = 'cantina-classe-canggu';

UPDATE places SET
  google_place_id = 'ChIJiQdg1YdH0i0R8ANUMzZizN0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Lawn&query_place_id=ChIJiQdg1YdH0i0R8ANUMzZizN0'
WHERE slug = 'the-lawn-canggu';

UPDATE places SET
  google_place_id = 'ChIJHZdHip1H0i0RNOgyg4IdFPo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Vue%20Canggu&query_place_id=ChIJHZdHip1H0i0RNOgyg4IdFPo'
WHERE slug = 'vue-canggu';

UPDATE places SET
  google_place_id = 'ChIJI5k9L5ZZei4RPBnHzGVH5X8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=7%20Clover%20Coffee%20Caravan&query_place_id=ChIJI5k9L5ZZei4RPBnHzGVH5X8'
WHERE slug = '2-bulan-yogyakarta';

UPDATE places SET
  google_place_id = 'ChIJbZqP9SlRei4RhlILBNBmrxE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Goela%20Djawa&query_place_id=ChIJbZqP9SlRei4RhlILBNBmrxE'
WHERE slug = 'goela-djawa-yogyakarta';

UPDATE places SET
  google_place_id = 'ChIJgRTsynVZei4Reqgzti_Yd7M',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kappu%20Coffee&query_place_id=ChIJgRTsynVZei4Reqgzti_Yd7M'
WHERE slug = 'kappu-coffee-yogyakarta';

UPDATE places SET
  google_place_id = 'ChIJgRAaCeNaei4RQs-4Enbl00I',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ramayana%20Ballet%20Performance&query_place_id=ChIJgRAaCeNaei4RQs-4Enbl00I'
WHERE slug = 'ramayana-ballet-yogyakarta';

UPDATE places SET
  google_place_id = 'ChIJ139t_eL3AzMR6ughPvhN52g',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=White%20Beard%20Coffee&query_place_id=ChIJ139t_eL3AzMR6ughPvhN52g'
WHERE slug = 'white-beard-coffee-siargao';

UPDATE places SET
  google_place_id = 'ChIJh5_J-pwJBDMRIFiquQGnlp8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Isla%20Corgis&query_place_id=ChIJh5_J-pwJBDMRIFiquQGnlp8'
WHERE slug = 'isla-corgis-siargao';

UPDATE places SET
  google_place_id = 'ChIJ_SBvMxYJBDMRWVJ5STjdiyo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Bayani%20at%20Harana&query_place_id=ChIJ_SBvMxYJBDMRWVJ5STjdiyo'
WHERE slug = 'bayani-harana-siargao';

UPDATE places SET
  google_place_id = 'ChIJIwDSvjn3AzMRCuhz0q8dQcs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=CEV%20Ceviche%20%26%20Kinilaw&query_place_id=ChIJIwDSvjn3AzMRCuhz0q8dQcs'
WHERE slug = 'cev-ceviche-siargao';

UPDATE places SET
  google_place_id = 'ChIJ61B9aRr2AzMRF8G5N5HSj9A',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kermit%20Italian%20Restaurant&query_place_id=ChIJ61B9aRr2AzMRF8G5N5HSj9A'
WHERE slug = 'kermit-siargao';

UPDATE places SET
  google_place_id = 'ChIJ04VH8_apBjMRudU6BvX4sNw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sugba%20Lagoon&query_place_id=ChIJ04VH8_apBjMRudU6BvX4sNw'
WHERE slug = 'sugba-lagoon-siargao';

UPDATE places SET
  google_place_id = 'ChIJTYaG5CX3AzMR_nUdyoAV7Q8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Naked%20Island&query_place_id=ChIJTYaG5CX3AzMR_nUdyoAV7Q8'
WHERE slug = 'naked-island-siargao';

UPDATE places SET
  google_place_id = 'ChIJ44tYJACdqTMRhK5MZhU_l8A',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lugang%20Cafe&query_place_id=ChIJ44tYJACdqTMRhK5MZhU_l8A'
WHERE slug = 'lugang-cafe-cebu';

UPDATE places SET
  google_place_id = 'ChIJNd3am1GZqTMRZOesRwEffI0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Abaca%20Baking%20Company&query_place_id=ChIJNd3am1GZqTMRZOesRwEffI0'
WHERE slug = 'abaca-baking-company-cebu';

UPDATE places SET
  google_place_id = 'ChIJoZ7oewCZqTMRj1016QHrmPc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Twist%20%26%20Buckle&query_place_id=ChIJoZ7oewCZqTMRj1016QHrmPc'
WHERE slug = 'twist-buckle-cebu';

UPDATE places SET
  google_place_id = 'ChIJvzzDVgCZqTMR0-nPRsAfH-E',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Wolfgang%27s%20Steakhouse&query_place_id=ChIJvzzDVgCZqTMR0-nPRsAfH-E'
WHERE slug = 'wolfgangs-steakhouse-cebu';

UPDATE places SET
  google_place_id = 'ChIJwedaewCZqTMROQFsbL-rEH0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ooma&query_place_id=ChIJwedaewCZqTMROQFsbL-rEH0'
WHERE slug = 'ooma-cebu';

UPDATE places SET
  google_place_id = 'ChIJPbL4KwCZqTMRA5opmqlII8M',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Manam&query_place_id=ChIJPbL4KwCZqTMRA5opmqlII8M'
WHERE slug = 'manam-cebu';

UPDATE places SET
  google_place_id = 'ChIJv57vuByXqTMRVxIpurXB7Vg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Mactan%20Lapu-Lapu%20Monument%20%26%20Market&query_place_id=ChIJv57vuByXqTMRVxIpurXB7Vg'
WHERE slug = 'mactan-cebu-heritage';

UPDATE places SET
  google_place_id = 'ChIJQXceoCOjfDURAaChgBjkfzg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Book%20Park%20Lounge&query_place_id=ChIJQXceoCOjfDURAaChgBjkfzg'
WHERE slug = 'book-park-lounge-seoul';

UPDATE places SET
  google_place_id = 'ChIJ6xwTRt6jfDUR7FQKdD1sSp0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Nuldam%20Space%20-%20Gyeongbok%20Palace%20Branch&query_place_id=ChIJ6xwTRt6jfDUR7FQKdD1sSp0'
WHERE slug = 'nuldam-space-gyeongbok-seoul';

UPDATE places SET
  google_place_id = 'ChIJW7FBDfCifDURHTpisLbVUH0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kyoja%20Myeongdong&query_place_id=ChIJW7FBDfCifDURHTpisLbVUH0'
WHERE slug = 'kyoja-myeongdong-seoul';

UPDATE places SET
  google_place_id = 'ChIJNwhQeeuYfDURTIIpAnukflI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Time%20Travelers%20Relax%20Guesthouse&query_place_id=ChIJNwhQeeuYfDURTIIpAnukflI'
WHERE slug = 'time-travelers-relax-seoul';

UPDATE places SET
  google_place_id = 'ChIJ1TQ9a_eifDURt69Ao1wD5CQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Myeongdong%20House&query_place_id=ChIJ1TQ9a_eifDURt69Ao1wD5CQ'
WHERE slug = 'myeongdong-house-hotel-seoul';

UPDATE places SET
  google_place_id = 'ChIJqWqOqFeifDURpYJ5LnxX-Fw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=N%20Seoul%20Tower%20Observatory&query_place_id=ChIJqWqOqFeifDURpYJ5LnxX-Fw'
WHERE slug = 'n-seoul-tower-seoul';

UPDATE places SET
  google_place_id = 'ChIJIwCT4-yifDUR1E63iG76hr0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cheonggyecheon%20Walking%20Path&query_place_id=ChIJIwCT4-yifDUR1E63iG76hr0'
WHERE slug = 'cheonggyecheon-stream-seoul';

UPDATE places SET
  google_place_id = 'ChIJe_DH-eeifDURH6NzBYr0d7I',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Insadong%20Arts%20%26%20Craft%20District&query_place_id=ChIJe_DH-eeifDURH6NzBYr0d7I'
WHERE slug = 'insadong-seoul';

UPDATE places SET
  google_place_id = 'ChIJ0zY0YgCjfDURMdCFTOOcO8A',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hongojib%20Korean%20BBQ&query_place_id=ChIJ0zY0YgCjfDURMdCFTOOcO8A'
WHERE slug = 'hongojib-mapo-seoul';

UPDATE places SET
  google_place_id = 'ChIJtROsKNGYfDURglkDCPMlexY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Zzzip%20Guesthouse%20Hongdae&query_place_id=ChIJtROsKNGYfDURglkDCPMlexY'
WHERE slug = 'zzzip-guesthouse-hongdae-seoul';

UPDATE places SET
  google_place_id = 'ChIJUToRo7fpaDURo_ZMItcBfpc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Gamcheon%20Culture%20Village&query_place_id=ChIJUToRo7fpaDURo_ZMItcBfpc'
WHERE slug = 'gamcheon-culture-village-busan';

UPDATE places SET
  google_place_id = 'ChIJwabeuxuMaDURXC4Rb21AQaE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Haedong%20Yonggungsa%20Temple&query_place_id=ChIJwabeuxuMaDURXC4Rb21AQaE'
WHERE slug = 'haedong-yonggungsa-busan';

UPDATE places SET
  google_place_id = 'ChIJudkrFArpaDURbbCzajeQs0c',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Jagalchi%20Fish%20Market&query_place_id=ChIJudkrFArpaDURbbCzajeQs0c'
WHERE slug = 'jagalchi-market-busan';

UPDATE places SET
  google_place_id = 'ChIJOfX1e0zpaDURWq5Hp5x4-SM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Taejongdae%20Resort%20Park&query_place_id=ChIJOfX1e0zpaDURWq5Hp5x4-SM'
WHERE slug = 'taejongdae-park-busan';

UPDATE places SET
  google_place_id = 'ChIJVRLdCsjtaDURcdummQTLnRk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Oryukdo%20Skywalk&query_place_id=ChIJVRLdCsjtaDURcdummQTLnRk'
WHERE slug = 'oryukdo-skywalk-busan';

UPDATE places SET
  google_place_id = 'ChIJQ7OamaDBaDURVqEEI6RLxXA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Gwangalli%20Beach%20%26%20Promenade&query_place_id=ChIJQ7OamaDBaDURVqEEI6RLxXA'
WHERE slug = 'gwangalli-beach-busan';

UPDATE places SET
  google_place_id = 'ChIJFQwhL7CNaDURRlzyLdJf_kw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Nomad%20Live%20Hostel&query_place_id=ChIJFQwhL7CNaDURRlzyLdJf_kw'
WHERE slug = 'nomad-live-hostel-busan';

UPDATE places SET
  google_place_id = 'ChIJXwf-DlyNaDURmKxjwdWxY5k',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Haeundae%20Beach&query_place_id=ChIJXwf-DlyNaDURmKxjwdWxY5k'
WHERE slug = 'haeundae-beach-busan';

UPDATE places SET
  google_place_id = 'ChIJn2U13YOpQjQRPHbNYIzlhvs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Yaboo%20Cafe&query_place_id=ChIJn2U13YOpQjQRPHbNYIzlhvs'
WHERE slug = 'yaboo-cafe-taipei';

UPDATE places SET
  google_place_id = 'ChIJn4IIMompQjQRvDRpCo4YLLw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Halfway%20Coffee&query_place_id=ChIJn4IIMompQjQRvDRpCo4YLLw'
WHERE slug = 'halfway-coffee-taipei';

UPDATE places SET
  google_place_id = 'ChIJSTLZ6barQjQRMdkCqrP3CNU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Taipei%20101%20Observatory&query_place_id=ChIJSTLZ6barQjQRMdkCqrP3CNU'
WHERE slug = 'taipei-101-observatory-taipei';

UPDATE places SET
  google_place_id = 'ChIJcZT7-hdFXTQR0qekplqCFV8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Jiufen%20Old%20Street&query_place_id=ChIJcZT7-hdFXTQR0qekplqCFV8'
WHERE slug = 'jiufen-old-street-taipei';

UPDATE places SET
  google_place_id = 'ChIJIclBPsWrQjQRYSTe3UH7fwg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Star%20Hostel%20East&query_place_id=ChIJIclBPsWrQjQRYSTe3UH7fwg'
WHERE slug = 'star-hostel-east-taipei';

UPDATE places SET
  google_place_id = 'ChIJ78YPKQapQjQRfoWgW_w0hvs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Meander%20Taipei%20-%20Ximending&query_place_id=ChIJ78YPKQapQjQRfoWgW_w0hvs'
WHERE slug = 'meander-taipei-ximending';

UPDATE places SET
  google_place_id = 'ChIJTamiuZ2pQjQRsmnfkkID6UM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chiang%20Kai-shek%20Memorial%20Hall&query_place_id=ChIJTamiuZ2pQjQRsmnfkkID6UM'
WHERE slug = 'chiang-kai-shek-memorial-taipei';

UPDATE places SET
  google_place_id = 'ChIJmccOghOrQjQRpRCdqpKM43Y',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Workspot%20Coworking&query_place_id=ChIJmccOghOrQjQRpRCdqpKM43Y'
WHERE slug = 'workspot-taipei';

UPDATE places SET
  google_place_id = 'ChIJxUXPVmupQjQRtBB6oj-S5qI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ningxia%20Night%20Market&query_place_id=ChIJxUXPVmupQjQRtBB6oj-S5qI'
WHERE slug = 'ningxia-night-market-taipei';

UPDATE places SET
  google_place_id = 'ChIJbYl7d2F2bjQRnFdvyMBuZfI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chihkan%20Tower&query_place_id=ChIJbYl7d2F2bjQRnFdvyMBuZfI'
WHERE slug = 'chihkan-tower-tainan';

UPDATE places SET
  google_place_id = 'ChIJFbzVrGJ2bjQRkZC9jslaIgs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Confucius%20Temple&query_place_id=ChIJFbzVrGJ2bjQRkZC9jslaIgs'
WHERE slug = 'confucius-temple-tainan';

UPDATE places SET
  google_place_id = 'ChIJ_____wN2bjQRIOio8uGV_Og',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Anping%20Old%20Street&query_place_id=ChIJ_____wN2bjQRIOio8uGV_Og'
WHERE slug = 'anping-old-street-tainan';

UPDATE places SET
  google_place_id = 'ChIJY4zffFl3bjQReQRm5VXH-A8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lin%20Yong%20Tai%20Dried%20Fruit%20Store&query_place_id=ChIJY4zffFl3bjQReQRm5VXH-A8'
WHERE slug = 'lin-yong-tai-fruit-store-tainan';

UPDATE places SET
  google_place_id = 'ChIJQwtjhvfYbTQRL3Gv_yRSotk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Luermen%20Tianhou%20Temple&query_place_id=ChIJQwtjhvfYbTQRL3Gv_yRSotk'
WHERE slug = 'luermen-mazu-temple-tainan';

UPDATE places SET
  google_place_id = 'ChIJq6qqqnp0bjQRpvTHZeYTjKg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chimei%20Museum&query_place_id=ChIJq6qqqnp0bjQRpvTHZeYTjKg'
WHERE slug = 'chimei-museum-tainan';

UPDATE places SET
  google_place_id = 'ChIJlynOByF3bjQR_IzNSlgH-Ss',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Anping%20Treehouse&query_place_id=ChIJlynOByF3bjQR_IzNSlgH-Ss'
WHERE slug = 'anping-tree-house-tainan';

UPDATE places SET
  google_place_id = 'ChIJHyZ8z2t3bjQRJfvul9zxcOs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Historic%20Tainan%20Old%20City%20Walking%20Tour&query_place_id=ChIJHyZ8z2t3bjQRJfvul9zxcOs'
WHERE slug = 'tainan-old-street-walking-tour';

UPDATE places SET
  google_place_id = 'ChIJp_eQXWN2bjQRuBgUKDWwFhg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tainan%20Tea%20Culture%20Experience&query_place_id=ChIJp_eQXWN2bjQRuBgUKDWwFhg'
WHERE slug = 'shallun-tea-house-tainan';

UPDATE places SET
  google_place_id = 'ChIJ2R0Tz3yZ4jARTo_P3R5sS-Q',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Luka%20Hostel&query_place_id=ChIJ2R0Tz3yZ4jARTo_P3R5sS-Q'
WHERE slug = 'luka-hostel';

UPDATE places SET
  google_place_id = 'ChIJ3b78nRaZ4jARxEghQurreI4',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Once%20More%20Hostel%20Bangkok&query_place_id=ChIJ3b78nRaZ4jARxEghQurreI4'
WHERE slug = 'once-more-hostel';

UPDATE places SET
  google_place_id = 'ChIJL1EA0OWY4jARxE4BJAEMpNk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Somsak%20Noodles&query_place_id=ChIJL1EA0OWY4jARxE4BJAEMpNk'
WHERE slug = 'somsak-noodles';

UPDATE places SET
  google_place_id = 'ChIJyZMyxEie4jARAxudnxGQbTA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Featherstone%20Caf%C3%A9&query_place_id=ChIJyZMyxEie4jARAxudnxGQbTA'
WHERE slug = 'featherstone-cafe';

UPDATE places SET
  google_place_id = 'ChIJgcxFcQWZ4jARLsIR9Qia9H0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Wat%20Pho&query_place_id=ChIJgcxFcQWZ4jARLsIR9Qia9H0'
WHERE slug = 'wat-pho';

UPDATE places SET
  google_place_id = 'ChIJ68V6JtOY4jAREx42-cvq9R0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Maggie%20Choo%27s&query_place_id=ChIJ68V6JtOY4jAREx42-cvq9R0'
WHERE slug = 'maggie-choos';

UPDATE places SET
  google_place_id = 'ChIJTyjRrs2Y4jARAx3zbZs6rOM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Health%20Land%20Spa%20Sathorn&query_place_id=ChIJTyjRrs2Y4jARAx3zbZs6rOM'
WHERE slug = 'health-land-spa';

UPDATE places SET
  google_place_id = 'ChIJ3fiD6BSc4jARS324hNeR8ZE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chatuchak%20Weekend%20Market&query_place_id=ChIJ3fiD6BSc4jARS324hNeR8ZE'
WHERE slug = 'chatuchak-weekend-market';

UPDATE places SET
  google_place_id = 'ChIJicwRRFOe4jARAcJ7qJDLIe8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Roast%20Coffee%20and%20Eatery&query_place_id=ChIJicwRRFOe4jARAcJ7qJDLIe8'
WHERE slug = 'roast-coffee-eatery';

UPDATE places SET
  google_place_id = 'ChIJIdQIQbc72jARb7Z3AF_aLSg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ristr8to%20Coffee&query_place_id=ChIJIdQIQbc72jARb7Z3AF_aLSg'
WHERE slug = 'ristr8to-coffee';

UPDATE places SET
  google_place_id = 'ChIJCfacnYg62jARoaXVJHmPipU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Punspace%20Coworking%20Nimman&query_place_id=ChIJCfacnYg62jARoaXVJHmPipU'
WHERE slug = 'punspace-nimman';

UPDATE places SET
  google_place_id = 'ChIJAffoPqI62jARPqGzMT0b6Fc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lila%20Thai%20Massage&query_place_id=ChIJAffoPqI62jARPqGzMT0b6Fc'
WHERE slug = 'lila-thai-massage';

UPDATE places SET
  google_place_id = 'ChIJoym_ov072jARAmsIBzSXpb0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hug%20Hostel&query_place_id=ChIJoym_ov072jARAmsIBzSXpb0'
WHERE slug = 'hug-hostel';

UPDATE places SET
  google_place_id = 'ChIJ9Vbj3Yk62jAR4R5XMgrf6ag',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Khao%20Soi%20Nimman&query_place_id=ChIJ9Vbj3Yk62jAR4R5XMgrf6ag'
WHERE slug = 'khao-soi-nimman';

UPDATE places SET
  google_place_id = 'ChIJO2O10qqWUTAREYioi4E8t1Q',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tiger%20Cave%20Temple&query_place_id=ChIJO2O10qqWUTAREYioi4E8t1Q'
WHERE slug = 'tiger-cave-temple';

UPDATE places SET
  google_place_id = 'ChIJJ9MSXZmUUTARU4LjeXi9ExE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Pak-Up%20Hostel&query_place_id=ChIJJ9MSXZmUUTARU4LjeXi9ExE'
WHERE slug = 'pak-up-hostel';

UPDATE places SET
  google_place_id = 'ChIJ-aDr8-iA2jARwq6VsSTh24M',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Pai%20Canyon&query_place_id=ChIJ-aDr8-iA2jARwq6VsSTh24M'
WHERE slug = 'pai-canyon';

UPDATE places SET
  google_place_id = 'ChIJxesTbbKB2jAR6RysEmsplog',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Pai%20Walking%20Street%20Night%20Market&query_place_id=ChIJxesTbbKB2jAR6RysEmsplog'
WHERE slug = 'pai-walking-street';

UPDATE places SET
  google_place_id = 'ChIJBTY-7br8VDARpSjm6DFK6vA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Haad%20Rin%20Beach&query_place_id=ChIJBTY-7br8VDARpSjm6DFK6vA'
WHERE slug = 'haad-rin-beach';

UPDATE places SET
  google_place_id = 'ChIJw8VB5UUvdTEREzkmVsLe5To',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Common%20Room%20Project&query_place_id=ChIJw8VB5UUvdTEREzkmVsLe5To'
WHERE slug = 'the-common-room';

UPDATE places SET
  google_place_id = 'ChIJwbgPCkgvdTERztlzUY_RX6A',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Vietnam%20Cookery%20Center&query_place_id=ChIJwbgPCkgvdTERztlzUY_RX6A'
WHERE slug = 'vietnam-cookery-center';

UPDATE places SET
  google_place_id = 'ChIJTeYpMT8vdTERMH8sUnkta40',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ben%20Thanh%20Market&query_place_id=ChIJTeYpMT8vdTERMH8sUnkta40'
WHERE slug = 'ben-thanh-market';

UPDATE places SET
  google_place_id = 'ChIJdyfroEYvdTER2m7eTz44Bns',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Workshop%20Coffee&query_place_id=ChIJdyfroEYvdTER2m7eTz44Bns'
WHERE slug = 'the-workshop-coffee';

UPDATE places SET
  google_place_id = 'ChIJzwg3ojAvdTERqnQUK99K2Xw',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=War%20Remnants%20Museum&query_place_id=ChIJzwg3ojAvdTERqnQUK99K2Xw'
WHERE slug = 'war-remnants-museum';

UPDATE places SET
  google_place_id = 'ChIJ95W4Ib-rNTERpMcyh8TGG2Q',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hanoi%20Old%20Quarter&query_place_id=ChIJ95W4Ib-rNTERpMcyh8TGG2Q'
WHERE slug = 'hanoi-old-quarter';

UPDATE places SET
  google_place_id = 'ChIJP-LosL-rNTER_KBiQcNj3lI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Nexy%20Hostel&query_place_id=ChIJP-LosL-rNTER_KBiQcNj3lI'
WHERE slug = 'nexy-hostel';

UPDATE places SET
  google_place_id = 'ChIJXTOF7sCrNTERY3MOxYpAo_w',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cafe%20Giang%20Egg%20Coffee&query_place_id=ChIJXTOF7sCrNTERY3MOxYpAo_w'
WHERE slug = 'egg-coffee-giang';

UPDATE places SET
  google_place_id = 'ChIJ437seY-rNTERCkf4Ffj7dWs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hanoi%20Train%20Street&query_place_id=ChIJ437seY-rNTERCkf4Ffj7dWs'
WHERE slug = 'train-street';

UPDATE places SET
  google_place_id = 'ChIJwyzb3H0OQjERfjw-ZkTdF7c',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Lantern%20Town%20Hostel&query_place_id=ChIJwyzb3H0OQjERfjw-ZkTdF7c'
WHERE slug = 'lantern-town-hostel';

UPDATE places SET
  google_place_id = 'ChIJI4b6itUNQjERjYVfDgjBXmI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Reaching%20Out%20Teahouse&query_place_id=ChIJI4b6itUNQjERjYVfDgjBXmI'
WHERE slug = 'reaching-out-teahouse';

UPDATE places SET
  google_place_id = 'ChIJfWYZ_H4OQjERvGWi-4uzUy8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hoi%20An%20Ancient%20Town&query_place_id=ChIJfWYZ_H4OQjERvGWi-4uzUy8'
WHERE slug = 'hoi-an-ancient-town';

UPDATE places SET
  google_place_id = 'ChIJL1GKWJYZQjERLrEGqlK2kwQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Dragon%20Bridge&query_place_id=ChIJL1GKWJYZQjERLrEGqlK2kwQ'
WHERE slug = 'dragon-bridge';

UPDATE places SET
  google_place_id = 'ChIJ4w7694IXQjERrFXucqKL--o',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=My%20Khe%20Beach&query_place_id=ChIJ4w7694IXQjERrFXucqKL--o'
WHERE slug = 'my-khe-beach';

UPDATE places SET
  google_place_id = 'ChIJpTjuGjMTcTERhjx317psdj8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Crazy%20House%20Da%20Lat&query_place_id=ChIJpTjuGjMTcTERhjx317psdj8'
WHERE slug = 'crazy-house';

UPDATE places SET
  google_place_id = 'ChIJw-dBTv8TcTERPCSnIa35zyE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Da%20Lat%20Night%20Market&query_place_id=ChIJw-dBTv8TcTERPCSnIa35zyE'
WHERE slug = 'dalat-night-market';

UPDATE places SET
  google_place_id = 'ChIJU_Y875490i0RHKyhC_x-bRU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=The%20Yoga%20Barn%20Ubud&query_place_id=ChIJU_Y875490i0RHKyhC_x-bRU'
WHERE slug = 'yoga-barn-ubud';

UPDATE places SET
  google_place_id = 'ChIJu5hbBmo90i0R4po77axHom8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Seniman%20Coffee%20Studio&query_place_id=ChIJu5hbBmo90i0R4po77axHom8'
WHERE slug = 'seniman-coffee';

UPDATE places SET
  google_place_id = 'ChIJ4wD5Iwsi0i0R7QRsOGmJGo0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tegallalang%20Rice%20Terrace&query_place_id=ChIJ4wD5Iwsi0i0R7QRsOGmJGo0'
WHERE slug = 'tegallalang-rice-terrace';

UPDATE places SET
  google_place_id = 'ChIJZ5sY9kM90i0RVsPvSxZD7LY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Sacred%20Monkey%20Forest%20Sanctuary%20Ubud&query_place_id=ChIJZ5sY9kM90i0RVsPvSxZD7LY'
WHERE slug = 'ubud-monkey-forest';

UPDATE places SET
  google_place_id = 'ChIJgUd3yBpH0i0R58J1mGjwSY0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Outpost%20Coworking%20Canggu&query_place_id=ChIJgUd3yBpH0i0R58J1mGjwSY0'
WHERE slug = 'outpost-canggu';

UPDATE places SET
  google_place_id = 'ChIJSRrSTuNH0i0RX7GpKfK5k0k',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Finn%27s%20Beach%20Club&query_place_id=ChIJSRrSTuNH0i0RX7GpKfK5k0k'
WHERE slug = 'finns-beach-club';

UPDATE places SET
  google_place_id = 'ChIJrfg6aXY40i0RKbzqxLedkoY',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=La%20Brisa%20Beach%20Club&query_place_id=ChIJrfg6aXY40i0RKbzqxLedkoY'
WHERE slug = 'la-brisa-beach-club';

UPDATE places SET
  google_place_id = 'ChIJ5esTIBtH0i0RaqMKf-MsMZE',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ku%20De%20Ta&query_place_id=ChIJ5esTIBtH0i0RaqMKf-MsMZE'
WHERE slug = 'ku-de-ta';

UPDATE places SET
  google_place_id = 'ChIJ_XZL_xFH0i0RTo0EWBqsnRs',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Potato%20Head%20Beach%20Club&query_place_id=ChIJ_XZL_xFH0i0RTo0EWBqsnRs'
WHERE slug = 'potato-head-beach-club';

UPDATE places SET
  google_place_id = 'ChIJl9anCfCMei4Ry8NNdDRD0w0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Borobudur%20Temple&query_place_id=ChIJl9anCfCMei4Ry8NNdDRD0w0'
WHERE slug = 'borobudur-temple';

UPDATE places SET
  google_place_id = 'ChIJ0VnY2-Naei4RLVqVJTug5xk',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Prambanan%20Temple&query_place_id=ChIJ0VnY2-Naei4RLVqVJTug5xk'
WHERE slug = 'prambanan-temple';

UPDATE places SET
  google_place_id = 'ChIJvS9-OP_dzS0RXV5TSrKZRKc',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Gili%20Trawangan%20Night%20Market&query_place_id=ChIJvS9-OP_dzS0RXV5TSrKZRKc'
WHERE slug = 'gili-trawangan-night-market';

UPDATE places SET
  google_place_id = 'ChIJeyrRbRVVtjMRiT3CoUlYbws',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Spin%20Designer%20Hostel%20El%20Nido&query_place_id=ChIJeyrRbRVVtjMRiT3CoUlYbws'
WHERE slug = 'spin-designer-hostel';

UPDATE places SET
  google_place_id = 'ChIJA48DcIlTtjMRHYjURyc8mgo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Big%20Lagoon&query_place_id=ChIJA48DcIlTtjMRHYjURyc8mgo'
WHERE slug = 'big-lagoon-el-nido';

UPDATE places SET
  google_place_id = 'ChIJPaM9Xu0JBDMRy9VmalHFu9I',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Cloud%209%20Surfing%20Siargao&query_place_id=ChIJPaM9Xu0JBDMRy9VmalHFu9I'
WHERE slug = 'cloud-9-surfing';

UPDATE places SET
  google_place_id = 'ChIJie8EK_IJBDMRqS1JERgdQOU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Harana%20Surf%20Resort&query_place_id=ChIJie8EK_IJBDMRqS1JERgdQOU'
WHERE slug = 'harana-surf-resort';

UPDATE places SET
  google_place_id = 'ChIJzaFdmHHAqzMRzyRjfu-ZeDU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Kawasan%20Falls&query_place_id=ChIJzaFdmHHAqzMRzyRjfu-ZeDU'
WHERE slug = 'kawasan-falls';

UPDATE places SET
  google_place_id = 'ChIJ--F1Ez3KlzMRCLrAWKa_ngQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Intramuros&query_place_id=ChIJ--F1Ez3KlzMRCLrAWKa_ngQ'
WHERE slug = 'intramuros';

UPDATE places SET
  google_place_id = 'ChIJ93JdpqE9qjMRZ90HM2qFnNg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chocolate%20Hills&query_place_id=ChIJ93JdpqE9qjMRZ90HM2qFnNg'
WHERE slug = 'chocolate-hills';

UPDATE places SET
  google_place_id = 'ChIJ9RY_IIEzGQ0RC-XHMRreEUI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=GoodMorning%20Hostel%20Lisbon&query_place_id=ChIJ9RY_IIEzGQ0RC-XHMRreEUI'
WHERE slug = 'goodmorning-hostel';

UPDATE places SET
  google_place_id = 'ChIJ52dsQ340GQ0RYVWJDH-0lMo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Fabrica%20Coffee%20Roasters&query_place_id=ChIJ52dsQ340GQ0RYVWJDH-0lMo'
WHERE slug = 'fabrica-coffee-roasters';

UPDATE places SET
  google_place_id = 'ChIJS5zCw0LLHg0RP1FSz63cAjA',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Belem%20Tower&query_place_id=ChIJS5zCw0LLHg0RP1FSz63cAjA'
WHERE slug = 'belem-tower';

UPDATE places SET
  google_place_id = 'ChIJdWBeWYc0GQ0RktxySU7hjxM',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Time%20Out%20Market%20Lisbon&query_place_id=ChIJdWBeWYc0GQ0RktxySU7hjxM'
WHERE slug = 'time-out-market';

UPDATE places SET
  google_place_id = 'ChIJd5pejOJkJA0RT-Sh6F5ACH8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Livraria%20Lello&query_place_id=ChIJd5pejOJkJA0RT-Sh6F5ACH8'
WHERE slug = 'livraria-lello';

UPDATE places SET
  google_place_id = 'ChIJicetJOdkJA0R8GJ9Dy_dcgo',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Ribeira%20Porto&query_place_id=ChIJicetJOdkJA0R8GJ9Dy_dcgo'
WHERE slug = 'porto-ribeira';

UPDATE places SET
  google_place_id = 'ChIJ____P0_urw0RQ4d7yA3UxsU',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Riad%20Kniza&query_place_id=ChIJ____P0_urw0RQ4d7yA3UxsU'
WHERE slug = 'riad-kniza';

UPDATE places SET
  google_place_id = 'ChIJ9XrU2Wnurw0R0py4UQumAK4',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Hammam%20Mouassine&query_place_id=ChIJ9XrU2Wnurw0R0py4UQumAK4'
WHERE slug = 'hammam-mouassine';

UPDATE places SET
  google_place_id = 'ChIJ-WuddEHvrw0RDeah4wzCrnI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Jemaa%20el-Fnaa&query_place_id=ChIJ-WuddEHvrw0RDeah4wzCrnI'
WHERE slug = 'jemaa-el-fnaa';

UPDATE places SET
  google_place_id = 'ChIJM1tI-Ffznw0RK88Gwvp4b-U',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Fes%20el%20Bali%20Medina&query_place_id=ChIJM1tI-Ffznw0RK88Gwvp4b-U'
WHERE slug = 'fes-medina';

UPDATE places SET
  google_place_id = 'ChIJU_i7IVTznw0R05Hjrx3TIac',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Riad%20Fes%20Maya%20Suite%20%26%20Spa&query_place_id=ChIJU_i7IVTznw0R05Hjrx3TIac'
WHERE slug = 'riad-fes-maya';

UPDATE places SET
  google_place_id = 'ChIJsySgGR8nCw0R5rJN505n31Y',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Chefchaouen%20Blue%20Medina&query_place_id=ChIJsySgGR8nCw0R5rJN505n31Y'
WHERE slug = 'blue-city-medina';

UPDATE places SET
  google_place_id = 'ChIJ4U-9KsiOGGARARhaBLZLqS0',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Nui.%20HOSTEL%20%26%20BAR%20LOUNGE&query_place_id=ChIJ4U-9KsiOGGARARhaBLZLqS0'
WHERE slug = 'nui-hostel';

UPDATE places SET
  google_place_id = 'ChIJQ5Sa1PqJGGARUSaNKKOrMVg',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=teamLab%20Borderless&query_place_id=ChIJQ5Sa1PqJGGARUSaNKKOrMVg'
WHERE slug = 'teamlab-borderless';

UPDATE places SET
  google_place_id = 'ChIJW2cLzSGLGGARXAKXv6EkbqI',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Tsukiji%20Outer%20Market&query_place_id=ChIJW2cLzSGLGGARXAKXv6EkbqI'
WHERE slug = 'tsukiji-outer-market';

UPDATE places SET
  google_place_id = 'ChIJIW0uPRUPAWAR6eI6dRzKGns',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Fushimi%20Inari%20Shrine&query_place_id=ChIJIW0uPRUPAWAR6eI6dRzKGns'
WHERE slug = 'fushimi-inari';

UPDATE places SET
  google_place_id = 'ChIJrYtcv-urAWAR3XzWvXv8n_s',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Arashiyama%20Bamboo%20Grove&query_place_id=ChIJrYtcv-urAWAR3XzWvXv8n_s'
WHERE slug = 'arashiyama-bamboo';

UPDATE places SET
  google_place_id = 'ChIJg2DcJhXnAGARCbeAHoZrPeQ',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Dotonbori&query_place_id=ChIJg2DcJhXnAGARCbeAHoZrPeQ'
WHERE slug = 'dotonbori';

UPDATE places SET
  google_place_id = 'ChIJ_TooXM3gAGARQR6hXH3QAQ8',
  google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Osaka%20Castle&query_place_id=ChIJ_TooXM3gAGARQR6hXH3QAQ8'
WHERE slug = 'osaka-castle';

COMMIT;
