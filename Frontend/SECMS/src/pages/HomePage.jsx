import Navbar from '../components/Navbar';
import HeroSection from '../components/homepage/HeroSection';
import NewArrivalsSection from '../components/homepage/NewArrivalsSection';
import DetailsSection from '../components/homepage/DetailsSection';
import EverydayWearSection from '../components/homepage/EverydayWearSection';
import WomensSection from '../components/Women_s/WomensSection';
import CollectionsSection from '../components/homepage/CollectionsSection';
import NewsletterSection from '../components/homepage/NewsletterSection';
import Footer from '../components/Footer';
import MensSection from '../components/Men_s/MensSection';

function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <NewArrivalsSection />
      <DetailsSection />
      <EverydayWearSection />
      <WomensSection />
      {/* <CollectionsSection /> */}
      <MensSection/>
      <NewsletterSection />
      <Footer />
    </>
  );
}

export default HomePage;
