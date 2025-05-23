package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.BusLineResponse;
import com.tecnoinf.tsig.stn.dto.CreateBusLineRequest;
import com.tecnoinf.tsig.stn.dto.UpdateBusLineRequest;
import com.tecnoinf.tsig.stn.model.BusLine;
import com.tecnoinf.tsig.stn.model.Company;
import com.tecnoinf.tsig.stn.repository.BusLineRepository;
import com.tecnoinf.tsig.stn.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusLineService {
    private final BusLineRepository busLineRepository;
    private final CompanyRepository companyRepository;

    public BusLineService(BusLineRepository busLineRepository, CompanyRepository companyRepository) {
        this.busLineRepository = busLineRepository;
        this.companyRepository = companyRepository;
    }

    public BusLineResponse create(CreateBusLineRequest request) {
        Company company = companyRepository.findById(request.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));

        BusLine busLine = new BusLine();
        busLine.setNumber(request.number());
        busLine.setStatus(request.status());
        busLine.setCompany(company);

        BusLine savedBusLine = busLineRepository.save(busLine);
        return mapToResponse(savedBusLine);
    }

    public BusLineResponse update(Long id, UpdateBusLineRequest request) {
        BusLine busLine = busLineRepository.findById(id).orElseThrow(() -> new RuntimeException("BusLine not found"));

        Company company = companyRepository.findById(request.companyId()).orElseThrow(() -> new RuntimeException("Company not found"));

        busLine.setNumber(request.number());
        busLine.setStatus(request.status());
        busLine.setCompany(company);
        BusLine updatedBusLine = busLineRepository.save(busLine);

        return mapToResponse(updatedBusLine);
    }

    public void delete(Long id) {
        busLineRepository.deleteById(id);
    }

    public List<BusLineResponse> findAll() {
        return busLineRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private BusLineResponse mapToResponse(BusLine busLine) {
        return new BusLineResponse(
                busLine.getId(),
                busLine.getNumber(),
                busLine.getStatus(),
                busLine.getCompany().getId()
        );
    }
}
