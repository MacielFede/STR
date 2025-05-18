package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.model.Parada.StatusParada;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class ParadaDTO {
    private Integer id;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    
    private String descripcion;
    
    @NotNull(message = "El status es obligatorio")
    private StatusParada status;
    
    @NotNull(message = "Debe indicar si la parada está resguardada")
    private Boolean resguardada;
    
    @NotNull(message = "La latitud es obligatoria")
    private Double latitud;
    
    @NotNull(message = "La longitud es obligatoria")
    private Double longitud;
}
