import Images from "../utils/images";

export const slides = [
  {
    id: 0,
    image: Images.destination,
    text: "Choose Your Destination",
    description: "First choose your destination where you want to go!",
  },
  {
    id: 1,
    image: Images.trip,
    text: "Wait for your driver",
    description: "Just wait for a while now until your driver is picking you!",
  },
  {
    id: 2,
    image: Images.bookRide,
    text: "Enjoy Your Trip",
    description:
      "Now enjoy your trip, pay your driver after reaching the destination!",
  },
];


export const CAB_TYPES = [
  {
    id: "sedan",
    name: "Stark Prime",
    quote: "Refined comfort for your everyday luxury.",
    detailedQuote: "“Stark Prime offers the perfect blend of luxury and everyday practicality. Designed for smooth rides, premium comfort, and a quiet cabin, it's ideal for business trips, airport pickups, or simply elevating your daily commute. With spacious seating and a refined interior, every journey feels first-class.”",
    image: require("@/assets/images/featuring/stark-prime.png"),
  },
  {
    id: "hatchback",
    name: "Stark Zip",
    quote: "Smart, quick, and made for city life.",
    detailedQuote: "“Stark Zip is built for the fast-moving city life — compact, agile, and incredibly efficient. Whether you're heading to work, college, or quick errands, it navigates through traffic with ease while keeping your ride comfortable and quick. Perfect for smart, everyday travel.”",
    image: require("@/assets/images/featuring/stark-zip.png"),
  },
  {
    id: "suv",
    name: "Stark Max",
    quote: "Command the road — space meets power.",
    detailedQuote: "“Stark Max gives you power, presence, and unmatched space. Whether it’s a family outing, a group trip, or luggage-heavy travel, this SUV ensures a confident ride. Enjoy elevated comfort, higher seating, and smooth handling on every kind of road.”",
    image: require("@/assets/images/featuring/stark-max.png"),
  },
];

export const NEARBY_PLACES = [
  {
    id: 1,
    title: "Airport",
    quote: "Catch your flight on time — stress-free rides, always.",
    detailedQuote: '“Skip the stress of airport travel. With timely pickups, ample luggage space, and reliable routes, we ensure you reach your terminal comfortably and without last-minute rush. Perfect for early flights, late-night departures, and business travel.”',
    image: require("@/assets/images/featuring/airport.png"),
  },
  {
    id: 4,
    title: "Movie Theatre",
    quote: "Enjoy the show — we’ll get you there on time.",
    detailedQuote: '“Heading for a movie night? Reach your theatre comfortably and right on time. Whether it’s a solo show, a date night, or an outing with friends, we’ll get you there smoothly so you can enjoy the experience from the very first scene.”',
    image: require("@/assets/images/featuring/theatre.png"),
  },
  {
    id: 2,
    title: "Railway Station",
    quote: "Smooth rides for seamless journeys.",
    detailedQuote: '“Avoid the chaos of station traffic and long waits. We offer smooth, well-timed rides to your train departure point, ensuring you arrive early, relaxed, and hassle-free — perfect for both short and long-distance journeys.”',
    image: require("@/assets/images/featuring/railway.png"),
  },
  {
    id: 3,
    title: "Shopping Mall",
    quote: "Shop more, park less — we’ll get you there.",
    detailedQuote: '“Whether you’re on a shopping spree or a quick visit, we get you to your favourite mall comfortably. No parking struggles, no long walks — just a smooth ride that makes every shopping experience better.”',
    image: require("@/assets/images/featuring/shopping.png"),
  },
  {
    id: 4,
    title: "Metro Station",
    quote: "Your quick link to the city — ride smart, ride easy.",
    detailedQuote: '“Your quick connection to the city begins here. Get dropped right at the metro entrance and continue your journey without delays. Ideal for daily commuters and fast city travel.”',
    image: require("@/assets/images/featuring/metro.png"),
  },
];

export const FEATURES = [
  {
    id: 1,
    title: "Safe & Secure",
    quote: "Your safety is our mission — verified drivers, live GPS tracking.",
    detailedQuote: '“Your safety is our highest priority. Every driver is verified through strict checks, and your ride is protected with live GPS tracking, route monitoring, and emergency support. Travel with complete peace of mind, every time you book.”',
    image: require("@/assets/images/featuring/safe.png"),
  },
  {
    id: 2,
    title: "Flexible Payments",
    quote: "Pay your driver your way — Cash, UPI, or online after the ride.",
    detailedQuote: '“Choose how you want to pay — Cash, UPI, or online. No rush, no confusion. Complete your payment smoothly after the ride ends, giving you full control and convenience on every trip.”',
    image: require("@/assets/images/featuring/cashless.png"),
  },
  {
    id: 3,
    title: "24/7 Support",
    quote: "Our support team is always a tap away — day or night.",
    detailedQuote: '“Anytime you travel, we’re right there with you. Our support team operates round the clock to assist with bookings, issues, or questions — ensuring your ride experience is smooth, safe, and reliable.”',
    image: require("@/assets/images/featuring/support.png"),
  },
  {
    id: 4,
    title: "Instant Booking & Tracking",
    quote: "Know your ride at every moment with real-time tracking.",
    detailedQuote: '“Book your ride in seconds and track your driver in real-time. From pickup to drop, you stay informed at every moment with live updates, driver details, and estimated arrival times.”',
    image: require("@/assets/images/featuring/tracking.png"),
  },
];

export const DAILY_DESTINATIONS = [
  {
    id: 1,
    title: "Home",
    quote: "Reach home safe and relaxed.",
    detailedQuote: '“End your day on a peaceful note. Whether late at night or after work, we ensure a safe, comfortable ride straight to your doorstep. Relax and let us take you home smoothly.”',
    image: require("@/assets/images/featuring/home.png"),
  },
  {
    id: 2,
    title: "Work",
    quote: "Your everyday commute, simplified.",
    detailedQuote: '“Start your day right with a seamless ride to work. No more rushing, traffic stress, or delays — enjoy a consistent, on-time commute that fits perfectly into your routine.”',
    image: require("@/assets/images/featuring/work.png"),
  },
  {
    id: 3,
    title: "Gym",
    quote: "Stay fit — we’ll get you there on time.",
    detailedQuote: '“Make fitness a habit without transportation hassles. Reach your gym or fitness center quickly and on time, helping you stay committed to your wellness journey.”',
    image: require("@/assets/images/featuring/gym.png"),
  },
  {
    id: 4,
    title: "College",
    quote: "Reach class faster and stress-free.",
    detailedQuote: '“Morning classes or evening lectures, we’ve got you covered. Enjoy a reliable, safe ride to your campus — ideal for daily travel and tight schedules.”',
    image: require("@/assets/images/featuring/college.png"),
  },
  {
    id: 5,
    title: "Market",
    quote: "Quick trips for daily essentials.",
    detailedQuote: '“Whether it’s groceries or quick errands, we take the hassle out of local travel. Skip parking issues and crowded roads — enjoy a fast, smooth ride to your nearest market or store.”',
    image: require("@/assets/images/featuring/market.png"),
  },
  {
    id: 6,
    title: "Friends & Family",
    quote: "Perfect rides to meet and spend time with your favourites.",
    detailedQuote: '“From meetups to special moments, we help you stay close to the people who matter. Enjoy comfortable rides for gatherings, celebrations, or casual visits — making every moment easier to reach.”',
    image: require("@/assets/images/featuring/family.png"),
  },
];

export const EXPLORE_MORE = [
  {
    id: 1,
    title: "Nightlife Spots",
    quote: "Late-night plans? Glide through the city safely.",
    detailedQuote: '“Enjoy the city lights without worrying about driving or parking. Whether it’s a club, lounge, or evening event, travel safely with reliable rides that stay by your side through the night.”',
    image: require("@/assets/images/featuring/night-club.png"),
  },
  {
    id: 2,
    title: "Cafés & Restaurants",
    quote: "Ride to your favourite flavours, anytime.",
    detailedQuote: '“From quiet cafés to your favourite dining spots, reach comfortably and on time. Perfect for dates, meetups, or casual outings — enjoy a smooth ride that makes every meal special.”',
    image: require("@/assets/images/featuring/cafe.png"),
  },
  {
    id: 3,
    title: "Events & Concerts",
    quote: "Make every event unforgettable — we’ll get you there.",
    detailedQuote: '“Avoid traffic stress and parking troubles during busy events. Whether it’s a concert, show, or celebration, we get you there smoothly so you can focus on enjoying the experience.”',
    image: require("@/assets/images/featuring/events.png"),
  },
  {
    id: 4,
    title: "Outstation Trips",
    quote: "Long journeys made comfortable, fast, and safe.",
    detailedQuote: '“Planning a longer escape? Travel beyond the city with comfort, spacious cars, and smooth rides. Ideal for weekend getaways, family trips, and long highway journeys.”',
    image: require("@/assets/images/featuring/long-trips.png"),
  },
  {
    id: 5,
    title: "Temple & Worship Places",
    quote: "Reach peacefully — your spiritual journey begins here.",
    detailedQuote: '“Reach your place of worship in peace and comfort. Whether early mornings or festive days, we take you there smoothly — making your spiritual journeys serene and stress-free.”',
    image: require("@/assets/images/featuring/temple.png"),
  },
];
