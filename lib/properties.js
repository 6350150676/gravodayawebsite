// Placeholder property data. This will later be replaced by data from the
// database (Supabase / MongoDB) once the backend is wired up.

export const properties = [
  {
    id: "1",
    title: "3 BHK Luxury Apartment",
    city: "Dehradun",
    type: "Apartment",
    bhk: 3,
    price: 7500000, // in INR
    area: 1450, // sq ft
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    description:
      "A spacious 3 BHK apartment in the heart of Dehradun with modern interiors, ample natural light, and premium fittings. Walking distance from schools, hospitals, and markets.",
    amenities: ["Covered Parking", "24x7 Security", "Power Backup", "Lift", "Park"],
    location: "Rajpur Road, Dehradun",
    featured: true,
  },
  {
    id: "2",
    title: "2 BHK Modern Flat",
    city: "Dehradun",
    type: "Apartment",
    bhk: 2,
    price: 4800000,
    area: 980,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    description:
      "Cozy 2 BHK flat ideal for small families, featuring an open kitchen, balcony with valley views, and a gated community with all essential amenities.",
    amenities: ["Parking", "Security", "Power Backup", "Lift"],
    location: "Sahastradhara Road, Dehradun",
    featured: true,
  },
  {
    id: "3",
    title: "Independent Villa",
    city: "Mussoorie",
    type: "Villa",
    bhk: 4,
    price: 18500000,
    area: 3200,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    description:
      "A premium independent villa with panoramic mountain views, private garden, and four spacious bedrooms. Perfect for those seeking luxury and privacy.",
    amenities: ["Private Garden", "Parking", "Servant Room", "Modular Kitchen", "Terrace"],
    location: "Mall Road, Mussoorie",
    featured: true,
  },
  {
    id: "4",
    title: "Residential Plot",
    city: "Dehradun",
    type: "Plot",
    bhk: 0,
    price: 6000000,
    area: 2000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
    description:
      "Prime residential plot in a fast-developing locality with clear title, road access, and all approvals in place. Build your dream home here.",
    amenities: ["Corner Plot", "Gated Layout", "Water Connection", "Wide Road"],
    location: "Premnagar, Dehradun",
    featured: false,
  },
  {
    id: "5",
    title: "1 BHK Budget Flat",
    city: "Haridwar",
    type: "Apartment",
    bhk: 1,
    price: 2500000,
    area: 600,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    description:
      "Affordable 1 BHK flat perfect for first-time buyers or investment. Well connected to the main city and railway station.",
    amenities: ["Parking", "Security", "Water Supply"],
    location: "Jwalapur, Haridwar",
    featured: false,
  },
  {
    id: "6",
    title: "Commercial Office Space",
    city: "Dehradun",
    type: "Commercial",
    bhk: 0,
    price: 9500000,
    area: 1100,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
    description:
      "Ready-to-move commercial office space in a prime business district with ample parking, high footfall, and modern infrastructure.",
    amenities: ["Parking", "Lift", "Power Backup", "Reception Area"],
    location: "EC Road, Dehradun",
    featured: false,
  },
];

export function getPropertyById(id) {
  return properties.find((p) => p.id === id);
}

export function formatPrice(price) {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export const cities = ["All", ...new Set(properties.map((p) => p.city))];
export const types = ["All", ...new Set(properties.map((p) => p.type))];
