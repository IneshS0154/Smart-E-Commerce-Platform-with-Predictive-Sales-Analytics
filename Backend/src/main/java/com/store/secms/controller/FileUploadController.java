package com.store.secms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class FileUploadController {

    @Value("${app.upload.dir:../Frontend/SECMS/public/assets/images/products}")
    private String uploadBaseDir;

    /**
     * Upload a product image to the frontend public assets directory.
     * POST /api/upload/image
     *
     * Request params:
     *   file        – the image file (multipart)
     *   gender      – MALE or FEMALE
     *   category    – e.g. SPORTS_ACTIVE
     *   sellerName  – supplier's store name
     *   productName – product name being created
     *
     * Returns: { "url": "/assets/images/products/{gender}/{category}/{seller}/{product}/{filename}" }
     *          (relative URL served by Vite's public folder)
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "gender", defaultValue = "unisex") String gender,
            @RequestParam(value = "category", defaultValue = "general") String category,
            @RequestParam(value = "sellerName", defaultValue = "seller") String sellerName,
            @RequestParam(value = "productName", defaultValue = "product") String productName) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        try {
            // Sanitize path segments – lowercase, spaces → underscores, remove non-word chars
            String safeGender = sanitize(gender);
            String safeCategory = sanitize(category);
            String safeSeller = sanitize(sellerName);
            String safeProduct = sanitize(productName);

            // Build directory: uploads_base/gender/category/seller/product/
            Path targetDir = Paths.get(uploadBaseDir, safeGender, safeCategory, safeSeller, safeProduct);
            Files.createDirectories(targetDir);

            // Unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }
            String storedFilename = UUID.randomUUID().toString().replace("-", "") + extension;

            Files.copy(file.getInputStream(), targetDir.resolve(storedFilename),
                    StandardCopyOption.REPLACE_EXISTING);

            // Relative URL – served by Vite's public folder at root
            String relativeUrl = "/assets/images/products/"
                    + safeGender + "/" + safeCategory + "/" + safeSeller + "/" + safeProduct
                    + "/" + storedFilename;

            Map<String, String> response = new HashMap<>();
            response.put("url", relativeUrl);
            response.put("filename", storedFilename);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to store file: " + e.getMessage()));
        }
    }

    /** Lowercase, collapse whitespace → underscore, strip everything except word chars and dots. */
    private String sanitize(String input) {
        if (input == null || input.isBlank()) return "unknown";
        return input.toLowerCase()
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
    }
}
