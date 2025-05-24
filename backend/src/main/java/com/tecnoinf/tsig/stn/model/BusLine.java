package com.tecnoinf.tsig.stn.model;

import com.tecnoinf.tsig.stn.enums.LineStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "bus_line")
@Setter
@Getter
public class BusLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LineStatus status;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
