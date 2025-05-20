package com.example.alumniassocaition1.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donation_id")
    private Long donationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // The donor
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false) // The recipient college
    private College college;

    @Column(nullable = false, precision = 10, scale = 2) // Example precision
    private BigDecimal amount;

    @Column(nullable = false, length = 3) // e.g., "INR", "USD"
    private String currency;

    @Column(name = "razorpay_payment_id", length = 50) // From Razorpay after successful payment
    private String razorpayPaymentId;

    @Column(name = "razorpay_order_id", length = 50, unique = true) // From Razorpay when order is created
    private String razorpayOrderId;

    @Column(name = "razorpay_signature", length = 100) // For verification
    private String razorpaySignature;

    @Column(nullable = false, length = 20) // e.g., 'CREATED', 'SUCCESSFUL', 'FAILED'
    private String status;

    @Column(name = "donated_at", updatable = false)
    private LocalDateTime donatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        donatedAt = now;
        updatedAt = now;
        if (status == null) {
            status = "CREATED"; // Default status on creation
        }
        if (currency == null) {
            currency = "INR"; // Default currency
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
