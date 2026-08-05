using AdvanceLab.Api.Models;

namespace AdvanceLab.Api.DTOs;

public record CreateB2BInquiryRequest(
    string OrganizationName,
    string ContactPerson,
    string Email,
    string Phone,
    B2BBusinessType BusinessType,
    string? City,
    string? Message);

public record B2BInquiryResponse(
    int Id,
    string OrganizationName,
    string ContactPerson,
    string Email,
    string Phone,
    B2BBusinessType BusinessType,
    string? City,
    string? Message,
    B2BInquiryStatus Status,
    DateTime CreatedAt);

public record UpdateB2BInquiryStatusRequest(B2BInquiryStatus Status);
