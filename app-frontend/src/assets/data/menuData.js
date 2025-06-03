const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const menuData = [
  {
    category: "Burgers",
    products: [
      { name: "Double Cheeseburger", image: `${BASE_URL}/images/burgers/double-cheeseburger.png`, description: "Burger dublu cu branza si sos special", price: 24, time: 8 },
      { name: "Chicken Burger", image: `${BASE_URL}/images/burgers/chicken-burger.png`, description: "Burger cu piept de pui crispy", price: 22, time: 7 },
      { name: "Philly CheeseBurger", image: `${BASE_URL}/images/burgers/philly-cheeseburger.png`, description: "Burger cu carne de vita si branza topita", price: 25, time: 9 },
      { name: "Five Guys Burger", image: `${BASE_URL}/images/burgers/fiveguys.png`, description: "Inspirat din reteta americana Five Guys", price: 26, time: 10 },
      { name: "In & Out Burger", image: `${BASE_URL}/images/burgers/in-out-cheese.png`, description: "Burger cu doua tipuri de branza si carne suculenta", price: 23, time: 9 },
      { name: "CheeseBurger & Fires Menu", image: `${BASE_URL}/images/burgers/cheeseburger-fries-menu.png`, description: "Meniu cu cheeseburger si cartofi", price: 28, time: 10 }
    ]
  },
  {
    category: "Wraps & Sandwiches",
    products: [
      { name: "Beef Doner", image: `${BASE_URL}/images/wraps-and-sandwiches/beef-doner.png`, description: "Doner cu carne de vita si legume proaspete", price: 21, time: 7 },
      { name: "Chicken Doner", image: `${BASE_URL}/images/wraps-and-sandwiches/chicken-doner.png`, description: "Doner cu carne de pui si sos garlic", price: 20, time: 6 },
      { name: "Beef Wrap", image: `${BASE_URL}/images/wraps-and-sandwiches/beef-wrap.png`, description: "Wrap cu carne de vita si legume", price: 22, time: 6 },
      { name: "Chicken Wrap", image: `${BASE_URL}/images/wraps-and-sandwiches/chicken-wrap.png`, description: "Wrap cu carne de pui crocanta", price: 21, time: 6 }
    ]
  },
  {
    category: "Fries",
    products: [
      { name: "French Fries", image: `${BASE_URL}/images/fries/fries.png`, description: "Cartofi prajiti clasici", price: 9, time: 4 },
      { name: "Paysan Fries", image: `${BASE_URL}/images/fries/paysan-fries.png`, description: "Cartofi in stil taranesc cu condimente", price: 10, time: 5 },
      { name: "Parmesan Fries", image: `${BASE_URL}/images/fries/parm-fries.png`, description: "Cartofi prajiti cu parmezan ras", price: 11, time: 5 },
      { name: "Mexican Fries", image: `${BASE_URL}/images/fries/mexican-fries.png`, description: "Cartofi picanti cu sos mexican", price: 11, time: 5 }
    ]
  },
  {
    category: "Drinks",
    products: [
      { name: "Coca Cola Zero", image: `${BASE_URL}/images/drinks/coca-cola-zero.png`, description: "Suc fara zahar", price: 7, time: 1 },
      { name: "Coca Cola", image: `${BASE_URL}/images/drinks/coca-cola.png`, description: "Coca Cola clasica", price: 7, time: 1 },
      { name: "Schweppes Mandarin", image: `${BASE_URL}/images/drinks/mandarin-schweppes.png`, description: "Schweppes cu aroma de mandarina", price: 8, time: 1 },
      { name: "Schweppes Lemon", image: `${BASE_URL}/images/drinks/bitter-schweppes.png`, description: "Schweppes lamaie", price: 8, time: 1 },
      { name: "Schweppes Tonic", image: `${BASE_URL}/images/drinks/tonic-schweppes.png`, description: "Apa tonica Schweppes", price: 8, time: 1 },
      { name: "Dorna", image: `${BASE_URL}/images/drinks/still-water.png`, description: "Apa plata Dorna", price: 6, time: 1 },
      { name: "Dorna Minerala", image: `${BASE_URL}/images/drinks/sparkling-water.png`, description: "Apa minerala Dorna", price: 6, time: 1 },
      { name: "Chocolate Shake", image: `${BASE_URL}/images/drinks/shake.png`, description: "Milkshake cu ciocolata", price: 12, time: 2 }
    ]
  },
  {
    category: "Desserts",
    products: [
      { name: "Oreo Cookie", image: `${BASE_URL}/images/desserts/oreo-cookie.png`, description: "Prajitura cu Oreo", price: 9, time: 3 },
      { name: "Strawberry Donut", image: `${BASE_URL}/images/desserts/donut.png`, description: "Gogoasa cu glazura de capsuni", price: 8, time: 3 }
    ]
  }
];

export default menuData;
