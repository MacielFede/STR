package com.tecnoinf.tsig.stn.controller;

import com.tecnoinf.tsig.stn.dto.BusLineResponse;
import com.tecnoinf.tsig.stn.dto.CreateBusLineRequest;
import com.tecnoinf.tsig.stn.dto.UpdateBusLineRequest;
import com.tecnoinf.tsig.stn.service.BusLineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/bus-lines")
public class BusLineController {
    private final BusLineService busLineService;

    public BusLineController(BusLineService busLineService) {
        this.busLineService = busLineService;
    }

    @PostMapping
    public ResponseEntity<BusLineResponse> create(@RequestBody CreateBusLineRequest request) {
        return ResponseEntity.ok(busLineService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusLineResponse> update(@PathVariable Long id, @RequestBody UpdateBusLineRequest request) {
        return ResponseEntity.ok(busLineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        busLineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<BusLineResponse>> getAll() {
        return ResponseEntity.ok(busLineService.findAll());
    }
}
