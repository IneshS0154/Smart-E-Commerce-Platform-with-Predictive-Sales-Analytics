package com.store.secms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Also serve /assets/images/products/** from the backend port as a fallback,
     * mapping to the same frontend public directory.
     * The primary serving is done by Vite's dev server.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String frontendPublicPath = Paths.get("../Frontend/SECMS/public/assets/images/products")
                .toAbsolutePath().toString();
        registry.addResourceHandler("/assets/images/products/**")
                .addResourceLocations("file:" + frontendPublicPath + "/");
    }
}
