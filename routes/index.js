var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  
  const cities = [
    { id: 1, name: 'Szeged', description: 'Dóm tér és Szegedi Dóm, Szegedi Vadaspark, Fekete ház, Tisza-part sétány', image: '/images/szeged.jpg' },
    { id: 2, name: 'Budapest', description: 'Parlament, Halászbástya és Budai Vár, Szent István Bazilika, Termálfürdők', image: '/images/budapest.jpg' },
    { id: 3, name: 'Győr', description: 'Belváros és Barokk negyed, Győri Bazilika, Rába Quelle Élményfürdő, Széchenyi tér', image: '/images/győr.jpg' }
  ];

 const discountedTrips = [
    { id: 101, name: 'Pécsi városnézés', description: '3 napos városlátogatás', image: '/images/pecs.jpg', price: 49900 },
    { id: 102, name: 'Balatoni hétvége', description: '2 éjszaka a tóparton', image: '/images/siofok.jpg', price: 29900 }
  ];

  const testimonials = [
  { name: 'Kovács Péter', city: 'Budapest', text: 'Nagyon elégedett vagyok a TigerTravel szolgáltatásaival. Minden gördülékenyen ment!' },
  { name: 'Szabó Anna', city: 'Szeged', text: 'Fantasztikus utazás! Minden részletre odafigyeltek, szuper élmény volt.' },
  { name: 'Nagy Gábor', city: 'Győr', text: 'Kiváló ajánlatok és profi csapat. Mindenképp ajánlom mindenkinek!' }
];

  res.render('index', { cities, discountedTrips, testimonials  }); 
});

module.exports = router;
