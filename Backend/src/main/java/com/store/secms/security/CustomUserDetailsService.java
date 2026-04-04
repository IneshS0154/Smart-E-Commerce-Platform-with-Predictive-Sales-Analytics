package com.store.secms.security;

import com.store.secms.entity.Customer;
import com.store.secms.repository.CustomerLoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private CustomerLoginRepository customerLoginRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customerLoginRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username))
                .getCustomer();

        return new User(
                customer.getUsername(),
                customer.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + customer.getRole()))
        );
    }
}
