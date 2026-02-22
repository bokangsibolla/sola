import { upsertBatch } from '../../seed-utils';
import { thailandPlaces } from './thailand';
import { vietnamPlaces } from './vietnam';
import { indonesiaPlaces } from './indonesia';
import { philippinesPlaces } from './philippines';
import { malaysiaPlaces } from './malaysia';
import { singaporePlaces } from './singapore';
import { cambodiaPlaces } from './cambodia';
import { laosPlaces } from './laos';
import { myanmarPlaces } from './myanmar';
import { japanPlaces } from './japan';
import { portugalPlaces } from './portugal';
import { moroccoPlaces } from './morocco';
import { southAfricaPlaces } from './south-africa';
import { zimbabwePlaces } from './zimbabwe';
import { namibiaPlaces } from './namibia';
import { mozambiquePlaces } from './mozambique';
import { lesothoPlaces } from './lesotho';

export const allPlaces = [
  ...thailandPlaces,
  ...vietnamPlaces,
  ...indonesiaPlaces,
  ...philippinesPlaces,
  ...malaysiaPlaces,
  ...singaporePlaces,
  ...cambodiaPlaces,
  ...laosPlaces,
  ...myanmarPlaces,
  ...japanPlaces,
  ...portugalPlaces,
  ...moroccoPlaces,
  ...southAfricaPlaces,
  ...zimbabwePlaces,
  ...namibiaPlaces,
  ...mozambiquePlaces,
  ...lesothoPlaces,
];

export async function seedPlaces() {
  await upsertBatch('places', allPlaces, 'id');
}
