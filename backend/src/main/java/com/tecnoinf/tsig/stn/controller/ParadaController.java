package com.tecnoinf.tsig.stn.controller;

import com.tecnoinf.tsig.stn.dto.ParadaDTO;
import com.tecnoinf.tsig.stn.model.Parada;
import com.tecnoinf.tsig.stn.service.ParadaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paradas")
public class ParadaController {

    private final ParadaService paradaService;

    @Autowired
    public ParadaController(ParadaService paradaService) {
        this.paradaService = paradaService;
    }

    @PostMapping
    public ResponseEntity<?> registrarParada(@Valid @RequestBody ParadaDTO paradaDTO) {
        try {
            Parada paradaCreada = paradaService.crearParada(paradaDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Parada registrada con éxito");
            response.put("parada", paradaCreada);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al registrar la parada");
            errorResponse.put("error", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> obtenerTodasLasParadas() {
        try {
            List<Parada> paradas = paradaService.obtenerTodasLasParadas();
            return new ResponseEntity<>(paradas, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al obtener las paradas");
            errorResponse.put("error", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerParadaPorId(@PathVariable Integer id) {
        try {
            Parada parada = paradaService.obtenerParadaPorId(id);
            if (parada == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(parada, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al obtener la parada");
            errorResponse.put("error", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{id}/coordenadas")
    public ResponseEntity<?> obtenerCoordenadasParada(@PathVariable Integer id) {
        try {
            ParadaDTO paradaDTO = paradaService.obtenerCoordenadasParada(id);
            if (paradaDTO == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(paradaDTO, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error al obtener las coordenadas de la parada");
            errorResponse.put("error", e.getMessage());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
