
function estimatePlaceCost(placeType, budget) {

    const pricing = {
        restaurant: {
            low: 300,
            medium: 800,
            high: 2000
        },
        hotel: {
            low: 1200,
            medium: 3000,
            high: 7000
        },
        cafe: {
            low: 200,
            medium: 500,
            high: 1200
        },
        tourism: {
            low: 100,
            medium: 300,
            high: 800
        }
    };

    return pricing[placeType][budget];
}

module.exports = estimatePlaceCost;