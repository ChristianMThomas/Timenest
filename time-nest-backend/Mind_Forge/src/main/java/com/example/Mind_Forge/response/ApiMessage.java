package com.example.Mind_Forge.response;

public class ApiMessage {
    private String message;
    private int statusCode;

    public ApiMessage(String message, int statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
}
