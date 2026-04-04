package com.store.secms.repository;

import com.store.secms.entity.ProductStock;
import com.store.secms.entity.ProductStock.SizeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    List<ProductStock> findByProductId(Long productId);
    
    Optional<ProductStock> findByProductIdAndSize(Long productId, SizeEnum size);
}
