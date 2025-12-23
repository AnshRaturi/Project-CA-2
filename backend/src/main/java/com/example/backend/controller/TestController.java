package com.example.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class TestController {
    
    @GetMapping("/api/test")
    public String test() {
        return "Test endpoint is working! Current time: " + java.time.LocalTime.now();
    }
}