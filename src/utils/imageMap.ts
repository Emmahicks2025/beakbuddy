
// Static image mapping to avoid dynamic require issues with Metro bundler
const images: Record<string, any> = {
    'budgerigar.png': require('../../assets/s/sunconure.png'),
    'cockatiel.png': require('../../assets/s/cockatiel.png'),
    'african-grey.png': require('../../assets/s/sunconure.png'),
    'blue-gold-macaw.png': require('../../assets/s/bluegoldmacaw.png'),
    'sun-conure.png': require('../../assets/s/sunconure.png'),
    'lovebird.png': require('../../assets/s/lovebird.png'),
    'generic.png': require('../../assets/s/sunconure.png'),
    'ring-necked-parakeet.png': require('../../assets/s/sunconure.png'),
    // Generated images
    'scarlet-macaw.png': require('../../assets/s/scarletmacaw.png'),
    'hyacinth-macaw.png': require('../../assets/s/hyacinthmacaw.png'),
    'umbrella-cockatoo.png': require('../../assets/s/umbrellacockatoo.png'),
    'moluccan-cockatoo.png': require('../../assets/s/moluccancockatoo.png'),
    'goffins-cockatoo.png': require('../../assets/s/goffinscockatoo.png'),
    'monk-parakeet.png': require('../../assets/s/monkparakeet.png'),
    'plum-headed-parakeet.png': require('../../assets/s/plumheadedparakeet.png'),
    'alexandrine-parakeet.png': require('../../assets/s/alexandrineparakeet.png'),
    'eclectus-parrot.png': require('../../assets/s/eclectusparrot.png'),
    'yellow-naped-amazon.png': require('../../assets/s/yellownapedamazon.png'),
    'blue-fronted-amazon.png': require('../../assets/s/bluefrontedamazon.png'),
    'double-yellow-headed-amazon.png': require('../../assets/s/doubleyellowheadedamazon.png'),
    'black-headed-caique.png': require('../../assets/s/blackheadedcaique.png'),
    'white-bellied-caique.png': require('../../assets/s/whitebelliedcaique.png'),
    'senegal-parrot.png': require('../../assets/s/senegalparrot.png'),
    'meyers-parrot.png': require('../../assets/s/meyersparrot.png'),
    'jardines-parrot.png': require('../../assets/s/jardinesparrot.png'),
    'blue-headed-pionus.png': require('../../assets/s/blueheadedpionus.png'),
    'pacific-parrotlet.png': require('../../assets/s/pacificparrotlet.png'),
    'lineolated-parakeet.png': require('../../assets/s/lineolatedparakeet.png'),
    // Downloaded Wikimedia images (JPG)
    'green-cheeked-conure.jpg': require('../../assets/s/greencheekedconure.jpg'),
    'white-capped-pionus.jpg': require('../../assets/s/whitecappedpionus.jpg'),
    'bourkes-parakeet.jpg': require('../../assets/s/bourkesparakeet.jpg'),
    'hahns-macaw.jpg': require('../../assets/s/hahnsmacaw.jpg'),
    'severe-macaw.jpg': require('../../assets/s/severemacaw.jpg'),
    'red-rumped-parrot.jpg': require('../../assets/s/redrumpedparrot.jpg'),
    'eastern-rosella.jpg': require('../../assets/s/easternrosella.jpg'),
    'crimson-rosella.jpg': require('../../assets/s/crimsonrosella.jpg'),
    'canary-winged-parakeet.jpg': require('../../assets/s/canarywingedparakeet.jpg'),
    'dusky-conure.jpg': require('../../assets/s/duskyconure.jpg'),
    'jenday-conure.jpg': require('../../assets/s/jendayconure.jpg'),
    'nanday-conure.jpg': require('../../assets/s/nandayconure.jpg'),
    'patagonian-conure.jpg': require('../../assets/s/patagonianconure.jpg'),
    'red-crowned-kakariki.jpg': require('../../assets/s/redcrownedkakariki.jpg'),
    'yellow-crowned-kakariki.jpg': require('../../assets/s/yellowcrownedkakariki.jpg'),
    'galah-cockatoo.jpg': require('../../assets/s/galahcockatoo.jpg'),
    'sulphur-crested-cockatoo.jpg': require('../../assets/s/sulphurcrestedcockatoo.jpg'),
    'kakapo.jpg': require('../../assets/s/kakapo.jpg'),
};

export const getSpeciesImage = (imageAsset: string) => {
    console.log('[DEBUG] getSpeciesImage:', imageAsset);
    if (!imageAsset) return images['generic.png'];

    if (imageAsset.startsWith('http') || imageAsset.startsWith('data:') || imageAsset.startsWith('file:') || imageAsset.startsWith('content:')) {
        return { uri: imageAsset };
    }

    return images[imageAsset] || images['generic.png'];
};

export const isSpeciesImageAvailable = (imageAsset: string) => {
    return !!images[imageAsset];
};
