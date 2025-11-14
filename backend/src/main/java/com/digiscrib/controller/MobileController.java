package com.digiscrib.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mobile")
public class MobileController {

    @PostMapping("/predict")
    public Map<String, Object> predictDigit(@RequestParam("image") MultipartFile image) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Mock prediction - replace with actual ML model later
            int predictedDigit = (int) (Math.random() * 10);
            double confidence = Math.random();
            
            response.put("success", true);
            response.put("predicted_digit", predictedDigit);
            response.put("confidence", confidence);
            response.put("message", "Prediction successful");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/status")
    public Map<String, String> status() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "online");
        response.put("message", "MNIST Backend is running");
        return response;
    }
}