package com.SmartCommerce.service;

import com.SmartCommerce.dto.UserDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.entity.UserRole;
import com.SmartCommerce.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDTO createUser(UserDTO userDTO, String password) {
        if (userRepository.existsByUsername(userDTO.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(userDTO.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
            .username(userDTO.username())
            .email(userDTO.email())
            .password(passwordEncoder.encode(password))
            .firstName(userDTO.firstName())
            .lastName(userDTO.lastName())
            .role(userDTO.role() != null ? userDTO.role() : UserRole.CUSTOMER)
            .phoneNumber(userDTO.phoneNumber())
            .address(userDTO.address())
            .isActive(true)
            .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (!existingUser.getUsername().equals(userDTO.username()) 
            && userRepository.existsByUsername(userDTO.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (!existingUser.getEmail().equals(userDTO.email()) 
            && userRepository.existsByEmail(userDTO.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        existingUser.setFirstName(userDTO.firstName());
        existingUser.setLastName(userDTO.lastName());
        existingUser.setEmail(userDTO.email());
        existingUser.setPhoneNumber(userDTO.phoneNumber());
        existingUser.setAddress(userDTO.address());
        
        if (userDTO.role() != null) {
            existingUser.setRole(userDTO.role());
        }

        User updatedUser = userRepository.save(existingUser);
        return mapToDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return mapToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        return mapToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserDTO> getActiveUsers() {
        return userRepository.findByIsActiveTrue().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    public void activateUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setIsActive(true);
        userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getIsActive()
        );
    }
}
