package com.example.Mind_Forge.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    private final OkHttpClient httpClient = new OkHttpClient();

    public void sendVerificationEmail(String to, String subject, String htmlContent) throws IOException {
        String jsonPayload = String.format(
            "{\"from\":\"%s\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":\"%s\"}",
            fromEmail,
            to,
            subject,
            htmlContent.replace("\"", "\\\"").replace("\n", "\\n")
        );

        RequestBody body = RequestBody.create(
            jsonPayload,
            MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
            .url("https://api.resend.com/emails")
            .addHeader("Authorization", "Bearer " + resendApiKey)
            .addHeader("Content-Type", "application/json")
            .post(body)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to send email via Resend: " + response.code() + " - " + response.body().string());
            }
            System.out.println("Email sent successfully via Resend to: " + to);
        }
    }

}