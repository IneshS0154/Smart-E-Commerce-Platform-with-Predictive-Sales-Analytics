import Navbar from '../components/Navbar';
import HeroSection from '../components/homepage/HeroSection';
import NewArrivalsSection from '../components/homepage/NewArrivalsSection';
import DetailsSection from '../components/homepage/DetailsSection';
import EverydayWearSection from '../components/homepage/EverydayWearSection';
import SupplierSection from '../components/homepage/SupplierSection';
import WomensSection from '../components/Women_s/WomensSection';
import CollectionsSection from '../components/homepage/CollectionsSection';
import NewsletterSection from '../components/homepage/NewsletterSection';
import Footer from '../components/Footer';
import MensSection from '../components/Men_s/MensSection';
import ScrollToTop from '../components/ScrollToTop';

function HomePage() {
  return (
    <div className="home-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <NewArrivalsSection />
      <DetailsSection />
      <EverydayWearSection />
      <SupplierSection />
      <WomensSection />
      {/* <CollectionsSection /> */}
      <MensSection/>
      <NewsletterSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default HomePage;
