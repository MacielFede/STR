package com.tecnoinf.tsig.stn.model;

import lombok.Data;

@Data
public class Parada {
    private Integer id;
    private String nombre;
    private String descripcion;
    private StatusParada status;
    private Boolean resguardada;
    public enum StatusParada {
        ACTIVA, INACTIVA, EN_MANTENIMIENTO
    }
}