package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.LineStatus;

public record UpdateBusLineRequest (String number, LineStatus status, Long companyId) { }
