package com.example.alumniassocaition1.config; // Or your preferred config package

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
// For a more robust connection pool like HikariCP (recommended for production):
// import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;


@Configuration
public class DataSourceConfig {

    // Remove @Value annotations if you are hardcoding

    @Bean
    @Primary
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();

        // ** Hardcode your values here FOR TESTING ONLY **
        // Replace these with your actual PostgreSQL details
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl("jdbc:postgresql://localhost:5432/alumniplatform"); // Ensure 'alumniplatform' DB exists
        dataSource.setUsername("postgres"); // Replace with your actual username
        dataSource.setPassword("123"); // Replace with your actual password



        /*
        // Example for explicit HikariCP configuration with hardcoded values:
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setJdbcUrl("jdbc:postgresql://localhost:5432/alumniplatform");
        dataSource.setUsername("your_actual_db_username");
        dataSource.setPassword("your_actual_db_password");
        // HikariCP specific settings
        // dataSource.setMaximumPoolSize(10);
        // ...
        return dataSource;
        */
        return dataSource;
    }
}
