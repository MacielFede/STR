package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.LineStatus;
import lombok.Getter;

public record CreateBusLineRequest (
        String number,
        LineStatus status,
        Long companyId
) { }
