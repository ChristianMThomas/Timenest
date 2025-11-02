package com.example.Mind_Forge.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll() // Public auth endpoints
                        .requestMatchers(HttpMethod.POST, "/timelogs").hasRole("EMPLOYEE")
                        .requestMatchers(HttpMethod.PUT, "/timelogs/**").hasRole("EXECUTIVE")
                        .requestMatchers(HttpMethod.DELETE, "/timelogs/**").hasRole("EXECUTIVE")
                        .requestMatchers("/timelogs/me").hasAnyRole("EMPLOYEE", "EXECUTIVE")
                        .requestMatchers("/timelogs/company/**").hasRole("EXECUTIVE")
                        .requestMatchers(HttpMethod.GET, "/workareas", "/workareas/**").hasAnyRole("EMPLOYEE", "EXECUTIVE")
                        .requestMatchers(HttpMethod.POST, "/workareas").hasRole("EXECUTIVE")
                        .requestMatchers(HttpMethod.PUT, "/workareas/**").hasRole("EXECUTIVE")
                        .requestMatchers(HttpMethod.DELETE, "/workareas/**").hasRole("EXECUTIVE")
                        .anyRequest().authenticated() // All other endpoints require auth
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("https://www.timenest.tech", "http://www.timenest.tech"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true); // Important for cookies or auth headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}