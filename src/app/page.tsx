/* eslint-disable react/no-unescaped-entities */
import { Suspense } from "react";
import { Clock, MapPin, Phone, Mail, Star, Users, Fuel } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnitWithRelations } from "@/store/unitStore";
import { PackageWithRelations } from "@/store/packageStore";
import { CarUnitCard } from "@/components/unit/UnitCard";
import { PackageCard } from "@/components/package/PackageCard";
import { Loading } from "@/components/loading";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchUnits() {
  const response = await fetch(`${baseUrl}/api/unit`, {
    cache: "no-store", // Ensures fresh data for SSR
  });
  if (!response.ok) {
    throw new Error("Failed to fetch units");
  }
  return response.json() as Promise<UnitWithRelations[]>;
}
async function fetchPackages() {
  const response = await fetch(`${baseUrl}/api/package`, {
    cache: "no-store", // Ensures fresh data for SSR
  });
  if (!response.ok) {
    throw new Error("Failed to fetch units");
  }
  return response.json() as Promise<PackageWithRelations[]>;
}

async function UnitList() {
  const units = await fetchUnits();
  if (!units.length) {
    return null;
  }
  return units.map((unit: UnitWithRelations) => (
    <CarUnitCard variant="guest" unit={unit} key={unit.id} />
  ));
}
async function PackageList() {
  const packages = await fetchPackages();
  if (!packages.length) {
    return null;
  }
  return packages.map((pkg: PackageWithRelations) => (
    <PackageCard variant="guest" package={pkg} key={pkg.id} />
  ));
}

export default function Component() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <a href="#">
                <span className="text-2xl font-bold text-gray-900">
                  Amadewi <span className="text-primary">Trans</span>
                </span>
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#fleet"
                className="text-gray-700 hover:text-yellow-600 transition-colors"
              >
                Fleet
              </a>
              <a
                href="#packages"
                className="text-gray-700 hover:text-yellow-600 transition-colors"
              >
                Packages
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-yellow-600 transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-yellow-600 transition-colors"
              >
                Contact
              </a>
            </nav>
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative text-white"
        style={{
          backgroundImage:
            "url('https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing//pexels-elina-sazonova-1850547.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "top-left",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-cyan-800/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-center justify-between">
            <div className="max-w-[600px]">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Explore Bali with
                <span className="block text-yellow-300">Amadewi Trans</span>
              </h1>
              <p className="text-xl mb-8 text-yellow-100">
                Premium car rental and tour packages in Bali. Every rental
                includes professional driver and gasoline for your 12-hour
                adventure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Book Car Rental
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-yellow-600 bg-transparent"
                >
                  View Tour Packages
                </Button>
              </div>
            </div>
            <div className="relative hidden h-[500px] w-[500px] md:block">
              <Image
                src="https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing//wellcome-picture.png"
                alt="Happy Service"
                fill
                priority
                className="rounded-lg shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Amadewi Trans?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the best of Bali with our premium transport services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Professional Driver Included</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every rental comes with an experienced, licensed driver who
                  knows Bali's best routes and hidden gems.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Fuel className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Gasoline Included</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  No hidden costs! All fuel expenses are covered in your rental
                  package for worry-free exploration.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>12-Hour Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Full day service from sunrise to sunset. Perfect for exploring
                  multiple destinations across Bali.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vehicle Fleet Section */}
      <section id="fleet" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Vehicle Fleet
            </h2>
            <p className="text-lg text-gray-600">
              Choose from our range of well-maintained vehicles with
              professional drivers
            </p>
          </div>
          <Suspense fallback={<Loading />}>
            <div className="flex justify-center items-start flex-wrap gap-6">
              <UnitList />
            </div>
          </Suspense>
        </div>
      </section>

      {/* Tour Packages Section */}
      <section id="packages" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tour Packages
            </h2>
            <p className="text-lg text-gray-600">
              Discover Bali's most beautiful destinations with our curated tour
              packages
            </p>
          </div>
          <Suspense fallback={<Loading />}>
            <div className="flex justify-center items-start flex-wrap gap-6">
              <PackageList />
            </div>
          </Suspense>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of visitors to Bali
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Amazing service! Our driver was so knowledgeable about Bali
                  and took us to incredible places we never would have found on
                  our own."
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Australia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Perfect for families! The 12-hour service gave us plenty of
                  time to explore multiple temples and enjoy lunch at scenic
                  spots."
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-500">Singapore</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Great value for money! Having gasoline included made
                  budgeting so much easier. Highly recommend Amadewi Trans!"
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold">Emma Wilson</p>
                    <p className="text-sm text-gray-500">United Kingdom</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Amadewi Trans
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                With years of experience in Bali's tourism industry, Amadewi
                Trans has been the trusted choice for thousands of visitors
                seeking reliable and comfortable transportation services.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is to provide exceptional transport experiences that
                allow you to discover the true beauty of Bali without worrying
                about navigation, parking, or fuel costs.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    5000+
                  </div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    10+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d986.1965664816537!2d115.25982926958571!3d-8.616507673496006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwMzYnNTkuNCJTIDExNcKwMTUnMzcuNyJF!5e0!3m2!1sid!2sid!4v1754241025660!5m2!1sid!2sid"
                width="500"
                height="500"
                className="border border-primary rounded-xl shadow-xl"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 text-foreground">
            <h2 className="text-3xl font-bold mb-4">Ready to Explore Bali?</h2>
            <p className="text-xl">
              Contact us today to book your perfect Bali adventure
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-600 bg-opacity-10 rounded-lg p-8">
              <Phone className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-yellow-100 mb-4">
                Available 24/7 for bookings
              </p>
              <p className="text-2xl font-bold">
                {process.env.NEXT_PUBLIC_CONTACT_NUMBER}
              </p>
            </div>
            <div className="bg-gray-600 bg-opacity-10 rounded-lg p-8">
              <Mail className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-yellow-100 mb-4">Quick response guaranteed</p>
              <p className="text-xl font-bold">
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </p>
            </div>
            <div className="bg-gray-600 bg-opacity-10 rounded-lg p-8">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-yellow-100 mb-4">
                Located in the heart of Bali
              </p>
              <p className="text-xl font-bold">Batubulan, Gianyar, Bali</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold">
                  Amadewi <span className="text-primary">Trans</span>
                </span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for exploring the beautiful island of Bali.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 select-none">
                <li>
                  <div className="hover:text-white transition-colors">
                    Car Transport
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Tour Packages
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Airport Transfer
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Custom Tours
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Popular Destinations
              </h4>
              <ul className="space-y-2 text-gray-400 select-none">
                <li>
                  <div className="hover:text-white transition-colors">Ubud</div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Kuta Beach
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Tanah Lot
                  </div>
                </li>
                <li>
                  <div className="hover:text-white transition-colors">
                    Mount Batur
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{process.env.NEXT_PUBLIC_CONTACT_NUMBER}</li>
                <li>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</li>
                <li>Batubulan, Gianyar, Bali</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Amadewi Trans. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
