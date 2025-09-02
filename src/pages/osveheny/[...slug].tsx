import type { GetServerSideProps } from 'next';
import CatalogIndex, { getServerSideProps as originalGetServerSideProps } from './index';
import { } from './index';

export default CatalogIndex;

const brandSlugToName: Record<string, string> = {
  lightstar: 'LightStar',
  maytoni: 'Maytoni',
  novotech: 'Novotech',
  lumion: 'Lumion',
  artelamp: 'Artelamp',
  denkirs: 'Denkirs',
  stluce: 'StLuce',
  kinklight: 'KinkLight',
  sonex: 'Sonex',
  odeonlight: 'OdeonLight',
  elektrostandart: 'Elektrostandart',
  favourite: 'Favourite'
};

const categorySlugToName: Record<string, string> = {
  'chandeliers': 'Люстра',
  'chandeliers/pendant-chandeliers': 'Подвесная люстра',
  'chandeliers/ceiling-chandeliers': 'Потолочная люстра',
  'chandeliers/rod-chandeliers': 'Люстра на штанге',
  'chandeliers/cascade-chandeliers': 'Люстра каскадная',
  'chandeliers/crystal-chandeliers': 'Люстра хрустальная',
  'ceiling-fans': 'Люстра вентилятор',
  'lights': 'Светильники',
  'lights/ceiling-lights': 'Потолочный светильник',
  'lights/pendant-lights': 'Подвесной светильник',
  'lights/wall-lights': 'Настенный светильник',
  'lights/recessed-lights': 'Светильник встраиваемый',
  'lights/surface-mounted-lights': 'Светильник накладной',
  'lights/track-lights': 'Трековый светильник',
  'lights/spot-lights': 'Точечный светильник',
  'wall-sconces': 'Бра',
  'floor-lamps': 'Торшер',
  'table-lamps': 'Настольная лампа',
  'led-strip-profiles': 'Профиль для ленты',
  'led-strips': 'Светодиодная лента',
  'outdoor-lights': 'Уличный светильник',
  'outdoor-lights/outdoor-wall-lights': 'Настенный уличный светильник',
  'outdoor-lights/ground-lights': 'Грунтовый светильник',
  'outdoor-lights/landscape-lights': 'Ландшафтный светильник',
  'outdoor-lights/park-lights': 'Парковый светильник',
  'accessories': 'Комплектующие',
  'accessories/connectors': 'Коннектор',
  'accessories/cords': 'Шнур',
  'accessories/power-supplies': 'Блок питания',
  'accessories/lamp-holders': 'Патрон',
  'accessories/mounting': 'Крепление для светильников',
  'accessories/lampshades': 'Плафон',
  'accessories/controllers': 'Контроллер для светодиодной ленты'
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slugParam = ctx.params?.slug;
  const slugArray = Array.isArray(slugParam) ? slugParam as string[] : [];

  let source: string | undefined;
  let category: string | undefined;

  if (slugArray.length > 0) {
    const first = slugArray[0];
    const brandName = brandSlugToName[first];
    if (brandName) {
      source = brandName;
      const rest = slugArray.slice(1).join('/');
      if (rest) {
        category = categorySlugToName[rest];
      }
    } else {
      const joined = slugArray.join('/');
      category = categorySlugToName[joined] || categorySlugToName[first];
    }
  }

  const nextCtx = {
    ...ctx,
    query: {
      ...ctx.query,
      ...(source ? { source } : {}),
      ...(category ? { category } : {})
    }
  } as Parameters<typeof originalGetServerSideProps>[0];

  return originalGetServerSideProps(nextCtx);
};


