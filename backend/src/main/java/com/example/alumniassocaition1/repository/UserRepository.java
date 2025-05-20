// --- File: com/example/alumniassocaition1/repository/UserRepository.java ---
package com.example.alumniassocaition1.repository;

import com.example.alumniassocaition1.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import for @Query
import org.springframework.data.repository.query.Param; // Import for @Param
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Find a user by their unique email address (used for login and checks)
    Optional<User> findByEmail(String email);

    // Find all users belonging to a specific college (used by admin)
    List<User> findByCollegeCollegeId(Long collegeId);

    // Find users whose name contains a given string (case-insensitive search) - General search
    List<User> findByNameContainingIgnoreCase(String name);

    /**
     * Checks if a user exists with the given email.
     * This method will be automatically implemented by Spring Data JPA.
     *
     * @param email the email to check for
     * @return true if a user with the given email exists, false otherwise
     */
    boolean existsByEmail(String email);

    // --- NEW METHODS FOR COLLEGE-SCOPED SEARCH ---
    /**
     * Finds users within a specific college whose names contain the given string (case-insensitive).
     * @param collegeId The ID of the college to search within.
     * @param name The search term for the user's name.
     * @return A list of matching users.
     */
    List<User> findByCollegeCollegeIdAndNameContainingIgnoreCase(Long collegeId, String name);

    /**
     * Finds users within a specific college whose emails contain the given string (case-insensitive).
     * @param collegeId The ID of the college to search within.
     * @param email The search term for the user's email.
     * @return A list of matching users.
     */
    List<User> findByCollegeCollegeIdAndEmailContainingIgnoreCase(Long collegeId, String email);

    /**
     * Searches for users within a specific college by name or email.
     * This is an alternative using @Query for combined logic.
     * The SearchServiceImpl currently uses the two methods above and combines results in Java.
     * You can choose which approach you prefer.
     *
     * @param collegeId The ID of the college.
     * @param searchTerm The term to search for in name or email.
     * @return A list of matching User entities.
     */
    @Query("SELECT u FROM User u WHERE u.college.collegeId = :collegeId AND " +
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<User> searchUsersInCollegeByNameOrEmail(@Param("collegeId") Long collegeId, @Param("searchTerm") String searchTerm);

}