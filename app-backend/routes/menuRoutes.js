const express = require('express');
const router = express.Router();

const menuData = [
  {
    category: "Burgers",
    products: [
      {
        id: "burgers-1",
        name: "Double Cheeseburger",
        image: "/images/burgers/double-cheeseburger.png",
        description: "Burger dublu cu branza si sos special",
        price: 24,
        time: 8
      },
      {
        id: "burgers-2",
        name: "Chicken Burger",
        image: "/images/burgers/chicken-burger.png",
        description: "Burger cu piept de pui crispy",
        price: 22,
        time: 7
      },
      {
        id: "burgers-3",
        name: "Philly CheeseBurger",
        image: "/images/burgers/philly-cheeseburger.png",
        description: "Burger cu carne de vita si branza topita",
        price: 25,
        time: 9
      },
      {
        id: "burgers-4",
        name: "Five Guys Burger",
        image: "/images/burgers/fiveguys.png",
        description: "Inspirat din reteta americana Five Guys",
        price: 26,
        time: 10
      },
      {
        id: "burgers-5",
        name: "In & Out Style Double Burger",
        image: "/images/burgers/in-out-cheese.png",
        description: "Burger cu doua tipuri de branza si carne suculenta",
        price: 23,
        time: 9
      },
      {
        id: "burgers-6",
        name: "CheeseBurger & Fires Menu",
        image: "/images/burgers/cheeseburger-fries-menu.png",
        description: "Meniu cu cheeseburger si cartofi",
        price: 28,
        time: 10
      }
    ]
  },
  {
    category: "Wraps & Sandwiches",
    products: [
      {
        id: "wraps-1",
        name: "Beef Doner",
        image: "/images/wraps-and-sandwiches/beef-doner.png",
        description: "Doner cu carne de vita si legume proaspete",
        price: 21,
        time: 7
      },
      {
        id: "wraps-2",
        name: "Chicken Doner",
        image: "/images/wraps-and-sandwiches/chicken-doner.png",
        description: "Doner cu carne de pui si sos garlic",
        price: 20,
        time: 6
      },
      {
        id: "wraps-3",
        name: "Beef Wrap",
        image: "/images/wraps-and-sandwiches/beef-wrap.png",
        description: "Wrap cu carne de vita si legume",
        price: 22,
        time: 6
      },
      {
        id: "wraps-4",
        name: "Chicken Wrap",
        image: "/images/wraps-and-sandwiches/chicken-wrap.png",
        description: "Wrap cu carne de pui crocanta",
        price: 21,
        time: 6
      }
    ]
  },
  {
    category: "Fries",
    products: [
      {
        id: "fries-1",
        name: "French Fries",
        image: "/images/fries/fries.png",
        description: "Cartofi prajiti clasici",
        price: 9,
        time: 4
      },
      {
        id: "fries-2",
        name: "Paysan Fries",
        image: "/images/fries/paysan-fries.png",
        description: "Cartofi in stil taranesc cu condimente",
        price: 10,
        time: 5
      },
      {
        id: "fries-3",
        name: "Parmesan Fries",
        image: "/images/fries/parm-fries.png",
        description: "Cartofi prajiti cu parmezan ras",
        price: 11,
        time: 5
      },
      {
        id: "fries-4",
        name: "Mexican Fries",
        image: "/images/fries/mexican-fries.png",
        description: "Cartofi picanti cu sos mexican",
        price: 11,
        time: 5
      }
    ]
  },
  {
    category: "Drinks",
    products: [
      {
        id: "drinks-1",
        name: "Coca Cola Zero",
        image: "/images/drinks/coca-cola-zero.png",
        description: "Suc fara zahar",
        price: 7,
        time: 1
      },
      {
        id: "drinks-2",
        name: "Coca Cola",
        image: "/images/drinks/coca-cola.png",
        description: "Coca Cola clasica",
        price: 7,
        time: 1
      },
      {
        id: "drinks-3",
        name: "Schweppes Mandarin",
        image: "/images/drinks/mandarin-schweppes.png",
        description: "Schweppes cu aroma de mandarina",
        price: 8,
        time: 1
      },
      {
        id: "drinks-4",
        name: "Schweppes Lemon",
        image: "/images/drinks/bitter-schweppes.png",
        description: "Schweppes lamaie",
        price: 8,
        time: 1
      },
      {
        id: "drinks-5",
        name: "Schweppes Tonic",
        image: "/images/drinks/tonic-schweppes.png",
        description: "Apa tonica Schweppes",
        price: 8,
        time: 1
      },
      {
        id: "drinks-6",
        name: "Dorna",
        image: "/images/drinks/still-water.png",
        description: "Apa plata Dorna",
        price: 6,
        time: 1
      },
      {
        id: "drinks-7",
        name: "Dorna Minerala",
        image: "/images/drinks/sparkling-water.png",
        description: "Apa minerala Dorna",
        price: 6,
        time: 1
      },
      {
        id: "drinks-8",
        name: "Chocolate Shake",
        image: "/images/drinks/shake.png",
        description: "Milkshake cu ciocolata",
        price: 12,
        time: 2
      }
    ]
  },
  {
    category: "Desserts",
    products: [
      {
        id: "desserts-1",
        name: "Oreo Cookie",
        image: "/images/desserts/oreo-cookie.png",
        description: "Prajitura cu Oreo",
        price: 9,
        time: 3
      },
      {
        id: "desserts-2",
        name: "Strawberry Donut",
        image: "/images/desserts/donut.png",
        description: "Gogoasa cu glazura de capsuni",
        price: 8,
        time: 3
      }
    ]
  }
];

router.get('/menu', (req, res) => {
  res.json(menuData);
});

const menuDataFlat = menuData.flatMap(c => c.products);
module.exports = { router, menuDataFlat };
