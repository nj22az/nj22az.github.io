/**
 * The other flavours of each line on Sakura's shelves.
 *
 * A konbini shelf is never one pack repeated: the same maker's line stands in three or
 * four flavours side by side, each a different colour. These are presentation only --
 * the catalogue item is still the one you buy -- so they live beside the brands rather
 * than in the catalogue. Each entry is [flavour, hue turn in degrees] off the line's own
 * pack (store-advertising.js paints the variant from the original).
 */
export const FLAVOURS=Object.freeze({
 chips:[['Nori seaweed',95],['Consommé',-38],['Sour cream',150]],
 crackers:[['Shrimp',-28],['Sesame',40]],
 biscuit:[['Chocolate',-25],['Strawberry',-60]],
 candy:[['Melon',90],['Grape',-110]],
 chocolate:[['Bitter',25],['Strawberry',-40]],
 noodles:[['Miso',25],['Curry',55],['Seafood',-150]],
 soup:[['Corn',35],['Clam',-140]],
 curry:[['Hot',-25],['Mild',40]],
 tea:[['Barley tea',-70],['Oolong',-35]],
 water:[['Sparkling',40]],
 cola:[['Zero',180]],
 orange:[['Apple',45],['Grape',-95]],
 soda:[['Melon',-90]],
 coffee:[['Café au lait',25],['Sugar free',-150]],
 beer:[['Dry',-30],['Black',170]],
 milk:[['Coffee milk',-170],['Strawberry',140]],
 yogurt:[['Aloe',-80],['Blueberry',60]],
 pudding:[['Caramel',-18],['Matcha',70]],
 bread:[['Melon bread',60],['Raisin',-40]],
 rice:[['Salmon',-25],['Tuna mayo',150],['Kelp',95]],
 sandwich:[['Ham',-30],['Tuna',150]],
 bento:[['Karaage',-25]],
 detergent:[['Floral',-80]],
 soap:[['Citrus',70],['Mint',140]],
 tissues:[['Lotion',-60]],
 toothpaste:[['Mint',120]],
 battery:[['AAA',140]],
 notebook:[['Graph paper',60]],
});

/** How many packs (the original and its flavours) a line shows. */
export const flavourCount=id=>1+(FLAVOURS[id]?.length||0);
