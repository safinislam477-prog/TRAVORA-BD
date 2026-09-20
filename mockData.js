/* TRAVORA BD - Mock Datasets for Bangladesh Travel Super App */

window.TRAVORA_MOCK = {
  airports: [
    { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', lat: 23.8433, lng: 90.3978 },
    { code: 'CGP', name: 'Shah Amanat International Airport', city: 'Chattogram', country: 'Bangladesh', lat: 22.2496, lng: 91.8133 },
    { code: 'CXB', name: 'Cox\'s Bazar Airport', city: 'Cox\'s Bazar', country: 'Bangladesh', lat: 21.4522, lng: 91.9639 },
    { code: 'ZYL', name: 'Osmani International Airport', city: 'Sylhet', country: 'Bangladesh', lat: 24.9633, lng: 91.8667 },
    { code: 'JSR', name: 'Jashore Airport', city: 'Jashore', country: 'Bangladesh', lat: 23.1838, lng: 89.1608 },
    { code: 'RPR', name: 'Saidpur Airport', city: 'Rangpur/Saidpur', country: 'Bangladesh', lat: 25.7592, lng: 88.9086 },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 },
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543 },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657 },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7072 }
  ],

  airlines: [
    { code: 'BG', name: 'Biman Bangladesh Airlines', logo: '✈️' },
    { code: 'BS', name: 'US-Bangla Airlines', logo: '🟡' },
    { code: '2A', name: 'Air Astra', logo: '🟢' },
    { code: 'EK', name: 'Emirates', logo: '🔴' },
    { code: 'SQ', name: 'Singapore Airlines', logo: '🟦' }
  ],

  flights: [
    {
      id: 'FL-BG084',
      airlineCode: 'BG',
      airlineName: 'Biman Bangladesh Airlines',
      flightNumber: 'BG-084',
      fromCode: 'DAC',
      fromCity: 'Dhaka',
      toCode: 'LHR',
      toCity: 'London',
      departTime: '10:30 AM',
      arrivalTime: '04:15 PM',
      duration: '10h 45m',
      stops: 0,
      cabinClass: 'Economy',
      price: 88500,
      baggage: '30 kg check-in, 7 kg cabin',
      refundable: true
    },
    {
      id: 'FL-BS141',
      airlineCode: 'BS',
      airlineName: 'US-Bangla Airlines',
      flightNumber: 'BS-141',
      fromCode: 'DAC',
      fromCity: 'Dhaka',
      toCode: 'DXB',
      toCity: 'Dubai',
      departTime: '06:45 PM',
      arrivalTime: '10:15 PM',
      duration: '5h 30m',
      stops: 0,
      cabinClass: 'Economy',
      price: 45200,
      baggage: '25 kg check-in, 7 kg cabin',
      refundable: true
    },
    {
      id: 'FL-2A101',
      airlineCode: '2A',
      airlineName: 'Air Astra',
      flightNumber: '2A-101',
      fromCode: 'DAC',
      fromCity: 'Dhaka',
      toCode: 'CXB',
      toCity: 'Cox\'s Bazar',
      departTime: '08:00 AM',
      arrivalTime: '09:05 AM',
      duration: '1h 05m',
      stops: 0,
      cabinClass: 'Economy',
      price: 4800,
      baggage: '20 kg check-in, 7 kg cabin',
      refundable: false
    },
    {
      id: 'FL-BS143',
      airlineCode: 'BS',
      airlineName: 'US-Bangla Airlines',
      flightNumber: 'BS-143',
      fromCode: 'DAC',
      fromCity: 'Dhaka',
      toCode: 'CXB',
      toCity: 'Cox\'s Bazar',
      departTime: '01:30 PM',
      arrivalTime: '02:35 PM',
      duration: '1h 05m',
      stops: 0,
      cabinClass: 'Economy',
      price: 5200,
      baggage: '20 kg check-in, 7 kg cabin',
      refundable: true
    },
    {
      id: 'FL-EK583',
      airlineCode: 'EK',
      airlineName: 'Emirates',
      flightNumber: 'EK-583',
      fromCode: 'DAC',
      fromCity: 'Dhaka',
      toCode: 'JFK',
      toCity: 'New York',
      departTime: '10:00 AM',
      arrivalTime: '08:45 PM',
      duration: '18h 45m',
      stops: 1,
      cabinClass: 'Business',
      price: 245000,
      baggage: '40 kg check-in, 10 kg cabin',
      refundable: true
    }
  ],

  busCities: [
    'Dhaka', 'Chattogram', 'Cox\'s Bazar', 'Sylhet', 'Sreemangal', 
    'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Bogura', 'Kuakata'
  ],

  busOperators: [
    { name: 'Green Line Paribahan', type: 'Scania Multi-Axle AC Sleeper / Business Class' },
    { name: 'Shohag Paribahan', type: 'Volvo B11R AC' },
    { name: 'Hanif Enterprise', type: 'Hyundai Universe AC / Non-AC' },
    { name: 'Ena Transport', type: 'Hyundai AC' },
    { name: 'Desh Travels', type: 'Scania AC' },
    { name: 'Shyamoli Paribahan', type: 'Non-AC / AC Chair Coach' }
  ],

  buses: [
    {
      id: 'BUS-GL-101',
      operator: 'Green Line Paribahan',
      busType: 'Scania Multi-Axle AC (Double Decker)',
      from: 'Dhaka',
      to: 'Cox\'s Bazar',
      departureTime: '10:00 PM',
      arrivalTime: '07:30 AM',
      duration: '9h 30m',
      fare: 1800,
      availableSeats: 18,
      boardingPoints: ['Arambagh', 'Sayedabad', 'Gabtoli'],
      droppingPoints: ['Kolatoli Point', 'Dolphin Mor', 'Bus Terminal']
    },
    {
      id: 'BUS-SH-204',
      operator: 'Shohag Paribahan',
      busType: 'Volvo B11R AC Business Class',
      from: 'Dhaka',
      to: 'Chattogram',
      departureTime: '11:15 PM',
      arrivalTime: '05:30 AM',
      duration: '6h 15m',
      fare: 1400,
      availableSeats: 14,
      boardingPoints: ['Kamalapur', 'Sayedabad'],
      droppingPoints: ['Dampara', 'GEC Circle']
    },
    {
      id: 'BUS-HN-505',
      operator: 'Hanif Enterprise',
      busType: 'Hyundai Universe AC',
      from: 'Dhaka',
      to: 'Sylhet',
      departureTime: '08:30 AM',
      arrivalTime: '02:00 PM',
      duration: '5h 30m',
      fare: 850,
      availableSeats: 22,
      boardingPoints: ['Sayedabad', 'Uttara'],
      droppingPoints: ['Kadamtoli Bus Terminal', 'Subidbazar']
    },
    {
      id: 'BUS-DT-302',
      operator: 'Desh Travels',
      busType: 'Scania AC Sleeper',
      from: 'Dhaka',
      to: 'Rajshahi',
      departureTime: '11:00 PM',
      arrivalTime: '05:00 AM',
      duration: '6h 00m',
      fare: 1100,
      availableSeats: 12,
      boardingPoints: ['Gabtoli', 'Kalyanpur'],
      droppingPoints: ['Shiroil Bus Terminal', 'Rajshahi Railway Gate']
    }
  ],

  railwayStations: [
    { code: 'DA', name: 'Dhaka Kamalapur Railway Station', city: 'Dhaka' },
    { code: 'DAA', name: 'Dhaka Airport Railway Station', city: 'Dhaka' },
    { code: 'CTG', name: 'Chattogram Junction', city: 'Chattogram' },
    { code: 'SYL', name: 'Sylhet Railway Station', city: 'Sylhet' },
    { code: 'SRE', name: 'Sreemangal Railway Station', city: 'Sreemangal' },
    { code: 'RJS', name: 'Rajshahi Junction', city: 'Rajshahi' },
    { code: 'KHU', name: 'Khulna Railway Station', city: 'Khulna' }
  ],

  trains: [
    {
      id: 'TR-702',
      name: 'Suborno Express',
      number: '702',
      from: 'Dhaka Kamalapur Railway Station',
      to: 'Chattogram Junction',
      departureTime: '04:30 PM',
      arrivalTime: '09:30 PM',
      duration: '5h 00m',
      offDay: 'Monday',
      classes: [
        { code: 'SNIGDHA', name: 'Snigdha (AC Chair)', fare: 800, availability: 42 },
        { code: 'S_ALAM', name: 'Shovan Chair', fare: 420, availability: 95 }
      ]
    },
    {
      id: 'TR-788',
      name: 'Sonar Bangla Express',
      number: '788',
      from: 'Dhaka Kamalapur Railway Station',
      to: 'Chattogram Junction',
      departureTime: '07:00 AM',
      arrivalTime: '12:15 PM',
      duration: '5h 15m',
      offDay: 'Tuesday',
      classes: [
        { code: 'AC_S', name: 'AC Seat', fare: 950, availability: 18 },
        { code: 'SNIGDHA', name: 'Snigdha (AC Chair)', fare: 800, availability: 30 },
        { code: 'S_ALAM', name: 'Shovan Chair', fare: 420, availability: 60 }
      ]
    },
    {
      id: 'TR-709',
      name: 'Parabat Express',
      number: '709',
      from: 'Dhaka Kamalapur Railway Station',
      to: 'Sylhet Railway Station',
      departureTime: '06:20 AM',
      arrivalTime: '01:00 PM',
      duration: '6h 40m',
      offDay: 'Tuesday',
      classes: [
        { code: 'AC_B', name: 'AC Berth / Cabin', fare: 1250, availability: 8 },
        { code: 'SNIGDHA', name: 'Snigdha (AC Chair)', fare: 650, availability: 25 },
        { code: 'S_ALAM', name: 'Shovan Chair', fare: 360, availability: 110 }
      ]
    },
    {
      id: 'TR-754',
      name: 'Silk City Express',
      number: '754',
      from: 'Dhaka Kamalapur Railway Station',
      to: 'Rajshahi Junction',
      departureTime: '02:45 PM',
      arrivalTime: '08:30 PM',
      duration: '5h 45m',
      offDay: 'Sunday',
      classes: [
        { code: 'SNIGDHA', name: 'Snigdha (AC Chair)', fare: 720, availability: 20 },
        { code: 'S_ALAM', name: 'Shovan Chair', fare: 380, availability: 75 }
      ]
    }
  ],

  hotels: [
    {
      id: 'HOTEL-CXB-01',
      name: 'Sayeman Beach Resort',
      destination: 'Cox\'s Bazar',
      location: 'Marine Drive, Kolatoli, Cox\'s Bazar',
      lat: 21.4173,
      lng: 91.9806,
      rating: 4.8,
      reviewsCount: 342,
      pricePerNight: 8500,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      ],
      facilities: ['Ocean View', 'Infinity Pool', 'Free Wi-Fi', 'Complimentary Breakfast', 'Fitness Center', 'Private Beach Access'],
      rooms: [
        { type: 'Ocean View Deluxe King', price: 8500, capacity: '2 Guests', bed: '1 King Bed' },
        { type: 'Executive Suite Sea View', price: 14500, capacity: '3 Guests', bed: '1 Super King + Sofa' }
      ],
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
    },
    {
      id: 'HOTEL-SRE-02',
      name: 'Grand Sultan Tea Resort & Golf',
      destination: 'Sreemangal',
      location: 'Radhanagar, Sreemangal, Moulvibazar',
      lat: 24.2861,
      lng: 91.7486,
      rating: 4.9,
      reviewsCount: 289,
      pricePerNight: 12000,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
      ],
      facilities: ['Tea Garden View', 'Golf Course', '3 Swimming Pools', 'Spa', 'Fine Dining'],
      rooms: [
        { type: 'King Deluxe Garden View', price: 12000, capacity: '2 Guests', bed: '1 King Bed' },
        { type: 'Royal Suite', price: 22000, capacity: '4 Guests', bed: '2 King Beds' }
      ],
      cancellationPolicy: 'Non-refundable within 48 hours.'
    },
    {
      id: 'HOTEL-SAJ-03',
      name: 'Sajek Hill Resort & Cloud Cottage',
      destination: 'Sajek Valley',
      location: 'Ruilui Para, Sajek Valley, Rangamati',
      lat: 23.3820,
      lng: 92.2938,
      rating: 4.7,
      reviewsCount: 198,
      pricePerNight: 5500,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      ],
      facilities: ['Cloud View Balcony', 'Solar Power 24/7', 'Barbecue Zone', 'Free Breakfast'],
      rooms: [
        { type: 'Cloud View Wooden Cottage', price: 5500, capacity: '2 Guests', bed: '1 Double Bed' }
      ],
      cancellationPolicy: 'Free cancellation up to 3 days before check-in.'
    },
    {
      id: 'HOTEL-DAC-04',
      name: 'Pan Pacific Sonargaon Dhaka',
      destination: 'Dhaka',
      location: '107 Kazi Nazrul Islam Avenue, Dhaka 1215',
      lat: 23.7513,
      lng: 90.3929,
      rating: 4.6,
      reviewsCount: 512,
      pricePerNight: 14000,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
      ],
      facilities: ['City Center', 'Outdoor Pool', 'Health Club', '5 Restaurants', 'Airport Shuttle'],
      rooms: [
        { type: 'Deluxe City View Room', price: 14000, capacity: '2 Guests', bed: '1 King Bed' }
      ],
      cancellationPolicy: 'Free cancellation up to 24 hours before arrival.'
    }
  ],

  destinations: [
    { name: 'Cox\'s Bazar', title: 'World\'s Longest Sea Beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', count: '45+ Hotels' },
    { name: 'Sajek Valley', title: 'Kingdom of Clouds', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', count: '28+ Resorts' },
    { name: 'Saint Martin\'s', title: 'Coral Island Paradise', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80', count: '18+ Resorts' },
    { name: 'Sylhet & Sreemangal', title: 'Land of Green Tea Gardens', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80', count: '32+ Resorts' },
    { name: 'Bandarban', title: 'Peak Hills & Waterfalls', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80', count: '22+ Resorts' }
  ],

  mapMarkers: [
    { type: 'airport', name: 'Hazrat Shahjalal International Airport (DAC)', lat: 23.8433, lng: 90.3978, info: 'Dhaka Airport' },
    { type: 'station', name: 'Dhaka Kamalapur Railway Station', lat: 23.7330, lng: 90.4262, info: 'Main Rail Hub' },
    { type: 'terminal', name: 'Sayedabad Bus Terminal', lat: 23.7144, lng: 90.4319, info: 'Central Bus Hub' },
    { type: 'hotel', name: 'Pan Pacific Sonargaon Dhaka', lat: 23.7513, lng: 90.3929, info: '5-Star Luxury' },
    { type: 'hotel', name: 'Sayeman Beach Resort Cox\'s Bazar', lat: 21.4173, lng: 91.9806, info: 'Seafront Luxury' },
    { type: 'attraction', name: 'Kolatoli Sea Beach, Cox\'s Bazar', lat: 21.4180, lng: 91.9820, info: 'Famous Beach' },
    { type: 'attraction', name: 'Ruilui Para, Sajek Valley', lat: 23.3820, lng: 92.2938, info: 'Cloud Spot' }
  ]
};
