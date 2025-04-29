package com.example.kitchensink.repository;

import com.example.kitchensink.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

/**
 * Repository for User entity operations
 */
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
}
