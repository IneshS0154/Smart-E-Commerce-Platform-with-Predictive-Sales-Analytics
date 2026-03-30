package com.SmartCommerce.config;

import com.SmartCommerce.entity.Product;
import com.SmartCommerce.entity.Supplier;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.ProductRepository;
import com.SmartCommerce.repository.SupplierRepository;
import com.SmartCommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initSuppliers();
        initProducts();
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("admin123@anywear.com")) {
            User admin = User.builder()
                .email("admin123@anywear.com")
                .password(passwordEncoder.encode("admin123"))
                .firstName("Admin")
                .lastName("User")
                .phone("+1234567890")
                .role(User.Role.ADMIN)
                .enabled(true)
                .build();
            userRepository.save(admin);
            log.info("Admin user created: admin123@anywear.com / admin123");
        }

        if (!userRepository.existsByEmail("customer123@anywear.com")) {
            User customer = User.builder()
                .email("customer123@anywear.com")
                .password(passwordEncoder.encode("customer123"))
                .firstName("John")
                .lastName("Customer")
                .phone("+1234567891")
                .role(User.Role.CUSTOMER)
                .enabled(true)
                .build();
            userRepository.save(customer);
            log.info("Customer user created: customer123@anywear.com / customer123");
        }
    }

    private void initSuppliers() {
        if (supplierRepository.count() == 0) {
            Supplier supplier = Supplier.builder()
                .name("Premium Sports Supply Co.")
                .email("supply@anywear.com")
                .phone("+1234567899")
                .companyName("Premium Sports Supply Co.")
                .address("123 Fashion Avenue, New York, NY 10001")
                .taxId("TAX-123456789")
                .active(true)
                .build();
            supplierRepository.save(supplier);
            log.info("Supplier created: Premium Sports Supply Co.");
        }
    }

    private void initProducts() {
        if (productRepository.count() == 0) {
            Supplier supplier = supplierRepository.findAll().get(0);

            Product product1 = Product.builder()
                .name("ULTRABOOST 22")
                .description("Experience incredible energy return with the Ultraboost 22. These running shoes feature a BOOST midsole that provides exceptional cushioning and responsiveness with every step.")
                .price(new BigDecimal("189.99"))
                .stockQuantity(50)
                .category("Running")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500")
                .sku("UB22-BLK")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product1);

            Product product2 = Product.builder()
                .name("NMD_R1")
                .description("The NMD_R1 blends heritage style with modern innovation. Features BOOST midsole and signature NMD plugs for a sleek, progressive silhouette.")
                .price(new BigDecimal("149.99"))
                .stockQuantity(35)
                .category("Lifestyle")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500")
                .sku("NMD-WHT")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product2);

            Product product3 = Product.builder()
                .name("STAN SMITH")
                .description("The iconic Stan Smith sneaker. Originally designed for tennis, now a street style staple. Clean, simple, timeless.")
                .price(new BigDecimal("109.99"))
                .stockQuantity(75)
                .category("Lifestyle")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500")
                .sku("STAN-WHT")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product3);

            Product product4 = Product.builder()
                .name("SUPERNOVA")
                .description("Designed for comfort and performance. The Supernova features responsive cushioning and a breathable mesh upper for optimal running experience.")
                .price(new BigDecimal("129.99"))
                .stockQuantity(40)
                .category("Running")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500")
                .sku("SUP-BLU")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product4);

            Product product5 = Product.builder()
                .name("FORUM LOW")
                .description("The Forum Low brings retro basketball style to the streets. Features a leather upper and iconic ankle strap for a bold look.")
                .price(new BigDecimal("119.99"))
                .stockQuantity(30)
                .category("Basketball")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500")
                .sku("FORUM-WHT")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product5);

            Product product6 = Product.builder()
                .name("GAZELLE")
                .description("The Gazelle is a timeless classic. Originally a training shoe, now a fashion icon. Premium suede upper with iconic 3-stripes.")
                .price(new BigDecimal("99.99"))
                .stockQuantity(60)
                .category("Lifestyle")
                .brand("Adidas")
                .imageUrl("https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500")
                .sku("GAZ-NAV")
                .supplier(supplier)
                .active(true)
                .averageRating(0.0)
                .reviewCount(0)
                .build();
            productRepository.save(product6);

            log.info("6 sample products created");
        }
    }
}
