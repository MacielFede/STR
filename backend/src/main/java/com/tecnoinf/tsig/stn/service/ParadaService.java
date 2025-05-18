package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.ParadaDTO;
import com.tecnoinf.tsig.stn.model.Parada;
import com.tecnoinf.tsig.stn.model.Parada.StatusParada;
import com.tecnoinf.tsig.stn.utils.ResourceAlreadyExistsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Service
public class ParadaService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ParadaService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<Parada> PARADA_ROW_MAPPER = (ResultSet rs, int rowNum) -> {
        Parada parada = new Parada();
        parada.setId(rs.getInt("id"));
        parada.setNombre(rs.getString("nombre"));
        parada.setDescripcion(rs.getString("descripcion"));
        parada.setStatus(StatusParada.valueOf(rs.getString("status")));
        parada.setResguardada(rs.getBoolean("resguardada"));
        return parada;
    };

    @Transactional
    public Parada crearParada(ParadaDTO paradaDTO) {
        if (existeParadaConNombre(paradaDTO.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una parada con el nombre " + paradaDTO.getNombre());
        }

        String sql = "INSERT INTO parada (nombre, descripcion, status, resguardada, geom) " +
                     "VALUES (?, ?, ?::text, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)) " +
                     "RETURNING id";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, paradaDTO.getNombre());
            ps.setString(2, paradaDTO.getDescripcion());
            ps.setString(3, paradaDTO.getStatus().toString());
            ps.setBoolean(4, paradaDTO.getResguardada());
            ps.setDouble(5, paradaDTO.getLongitud()); 
            ps.setDouble(6, paradaDTO.getLatitud());   
            return ps;
        }, keyHolder);

        Number id = keyHolder.getKey();
        if (id == null) {
            throw new DataAccessException("No se pudo obtener el ID de la parada creada") {};
        }

        Parada parada = new Parada();
        parada.setId(id.intValue());
        parada.setNombre(paradaDTO.getNombre());
        parada.setDescripcion(paradaDTO.getDescripcion());
        parada.setStatus(paradaDTO.getStatus());
        parada.setResguardada(paradaDTO.getResguardada());

        return parada;
    }

    private boolean existeParadaConNombre(String nombre) {
        String sql = "SELECT COUNT(*) FROM parada WHERE nombre = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, nombre);
        return count != null && count > 0;
    }
    
    public Parada obtenerParadaPorId(Integer id) {
        String sql = "SELECT id, nombre, descripcion, status, resguardada " +
                     "FROM parada WHERE id = ?";
        
        List<Parada> paradas = jdbcTemplate.query(sql, PARADA_ROW_MAPPER, id);
        return paradas.isEmpty() ? null : paradas.get(0);
    }
    
    public List<Parada> obtenerTodasLasParadas() {
        String sql = "SELECT id, nombre, descripcion, status, resguardada " +
                     "FROM parada ORDER BY nombre";
        
        return jdbcTemplate.query(sql, PARADA_ROW_MAPPER);
    }
    
    public ParadaDTO obtenerCoordenadasParada(Integer id) {
        String sql = "SELECT id, nombre, descripcion, status, resguardada, " +
                     "ST_X(geom) as longitud, ST_Y(geom) as latitud " +
                     "FROM parada WHERE id = ?";
        
        List<ParadaDTO> paradaDTOs = jdbcTemplate.query(sql, (ResultSet rs, int rowNum) -> {
            ParadaDTO dto = new ParadaDTO();
            dto.setId(rs.getInt("id"));
            dto.setNombre(rs.getString("nombre"));
            dto.setDescripcion(rs.getString("descripcion"));
            dto.setStatus(StatusParada.valueOf(rs.getString("status")));
            dto.setResguardada(rs.getBoolean("resguardada"));
            dto.setLongitud(rs.getDouble("longitud"));
            dto.setLatitud(rs.getDouble("latitud"));
            return dto;
        }, id);
        
        return paradaDTOs.isEmpty() ? null : paradaDTOs.get(0);
    }
}