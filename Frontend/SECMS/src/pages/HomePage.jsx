import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import NewArrivalsSection from '../components/NewArrivalsSection';
import DetailsSection from '../components/DetailsSection';
import EverydayWearSection from '../components/EverydayWearSection';
import CollectionsSection from '../components/CollectionsSection';
import NewsletterSection from '../components/NewsletterSection';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <NewArrivalsSection />
      <DetailsSection />
      <EverydayWearSection />
      <CollectionsSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}

export default HomePage;
