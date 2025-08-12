package com.example.Mind_Forge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
@PropertySource("classpath:.env.properties")
public class TimeNestApplication {

	public static void main(String[] args) {
		SpringApplication.run(TimeNestApplication.class, args);
	}

}
