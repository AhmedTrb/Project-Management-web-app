import NavBar from "@/components/LandingPage/NavBar";
import HeroSection from "@/components/LandingPage/HeroSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import ScreenshotSection from "@/components/LandingPage/ScreenshotSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorks";
import Footer from "@/components/LandingPage/Footer";




export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <ScreenshotSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
