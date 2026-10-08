import type { LabelId } from "../types";

export type SamplePhoto = {
  id: string;
  file: string;
  expected: LabelId;
  water: boolean;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

export const SAMPLES: SamplePhoto[] = [
  {
    id: "bucket",
    file: "/samples/bucket.jpg",
    expected: "bucket",
    water: true,
    title: "Veronica bucket (hand-washing)",
    author: "Gkbediako",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Veronica_Bucket.jpg",
  },
  {
    id: "basin",
    file: "/samples/basin.jpg",
    expected: "bucket",
    water: false,
    title: "Plastic washbasin",
    author: "Mvolz",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Plastic_washbasin_bin.jpg",
  },
  {
    id: "pot",
    file: "/samples/pot.jpg",
    expected: "saucer",
    water: true,
    title: "Mayana in a recycled pot",
    author: "Maybeonlyone",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mayana_plants_in_a_recycled_pot.jpg",
  },
  {
    id: "tire",
    file: "/samples/tire.jpg",
    expected: "tire",
    water: true,
    title: "Plants grown using tyres as pot",
    author: "Gpkp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Plants_grown_using_tyres_as_pot.jpg",
  },
  {
    id: "coconut",
    file: "/samples/coconut.jpg",
    expected: "discard",
    water: true,
    title: "Coconut shells",
    author: "Gausanchennai",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Coconut_shells.jpg",
  },
  {
    id: "bottle",
    file: "/samples/bottle.jpg",
    expected: "discard",
    water: false,
    title: "Empty plastic bottle",
    author: "Echendu Tracy",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Empty_Plastic_Bottle.jpg",
  },
  {
    id: "jar",
    file: "/samples/jar.jpg",
    expected: "jar",
    water: true,
    title: "Cambodian clay fermentation vessel (Mondulkiri)",
    author: "Turaids",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Cambodian_clay_fermentation_vessel.jpg",
  },
  {
    id: "barrel",
    file: "/samples/barrel.jpg",
    expected: "jar",
    water: true,
    title: "Rain barrel",
    author: "USEPA Environmental-Protection-Agency",
    license: "Public domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rain_Barrel_(15455931038).jpg",
  },
  {
    id: "bowl",
    file: "/samples/bowl.jpg",
    expected: "pet_bowl",
    water: true,
    title: "Dog water bowl",
    author: "Ohiopetwatch",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dog_Water_Bowl.jpg",
  },
  {
    id: "grass",
    file: "/samples/grass.jpg",
    expected: "grass",
    water: false,
    title: "Grass",
    author: "Tobias Geberth",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Grass.jpg",
  },
];
