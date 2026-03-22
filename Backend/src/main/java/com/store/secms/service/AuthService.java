package com.SmartCommerce.service;

import com.SmartCommerce.dto.AuthResponseDTO;
import com.SmartCommerce.dto.LoginRequestDTO;
import com.SmartCommerce.dto.RegisterRequestDTO;
import com.SmartCommerce.dto.UserDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.entity.UserRole;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtTokenProvider jwtTokenProvider,
        AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
            
            if (!user.getIsActive()) {
                throw new BadCredentialsException("Account is deactivated");
            }
            
            String token = jwtTokenProvider.generateToken(user);
            
            return new AuthResponseDTO(
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Login successful"
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        UserRole role = request.role();
        if (role == null) {
            role = UserRole.CUSTOMER;
        }
        
        if (role == UserRole.ADMIN || role == UserRole.SUPPORT_STAFF) {
            throw new IllegalArgumentException("Cannot register with ADMIN or SUPPORT_STAFF role");
        }

        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .role(role)
            .phoneNumber(request.phoneNumber())
            .address(request.address())
            .isActive(true)
            .build();

        User savedUser = userRepository.save(user);
        
        String token = jwtTokenProvider.generateToken(savedUser);
        
        return new AuthResponseDTO(
            token,
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            "Registration successful"
        );
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
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

    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
}
