package com.example.kitchensink.controller;

import com.example.kitchensink.model.Contact;
import com.example.kitchensink.model.User;
import com.example.kitchensink.service.ContactService;
import com.example.kitchensink.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller for admin operations
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
@Tag(name = "Admin", description = "Admin operations API")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final ContactService contactService;
    private final UserService userService;

    /**
     * Get all contacts
     * 
     * @return List of all contacts
     */
    @GetMapping("/contacts")
    @Operation(summary = "Get all contacts", description = "Get all contacts in the system")
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }

    /**
     * Get contact by ID
     * 
     * @param id Contact ID
     * @return Contact data
     */
    @GetMapping("/contacts/{id}")
    @Operation(summary = "Get contact", description = "Get contact by ID")
    public ResponseEntity<Contact> getContact(@PathVariable String id) {
        Contact contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }

    /**
     * Update a contact
     * 
     * @param id Contact ID
     * @param contact Updated contact data
     * @return Updated contact
     */
    @PutMapping("/contacts/{id}")
    @Operation(summary = "Update contact", description = "Update an existing contact")
    public ResponseEntity<Contact> updateContact(
            @PathVariable String id, 
            @Valid @RequestBody Contact contact) {
        Contact updatedContact = contactService.updateContact(id, contact);
        return ResponseEntity.ok(updatedContact);
    }

    /**
     * Delete a contact
     * 
     * @param id Contact ID
     * @return Success message
     */
    @DeleteMapping("/contacts/{id}")
    @Operation(summary = "Delete contact", description = "Delete a contact")
    public ResponseEntity<?> deleteContact(@PathVariable String id) {
        contactService.deleteContact(id);
        return ResponseEntity.ok(new MessageResponse("Contact deleted successfully"));
    }

    /**
     * Get all users
     * 
     * @return List of all users
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get all users in the system")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    /**
     * Simple response message class
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
