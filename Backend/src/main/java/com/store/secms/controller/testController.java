package com.store.secms.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")

public class testController {

    @GetMapping("/ping")
    public String ping(){
        return "Backend is Running";
    }
}
