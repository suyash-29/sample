﻿using System;
using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class PatientResponseDto
    {
        public int PatientID { get; set; }
        public string FullName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string ContactNumber { get; set; }
        public string Address { get; set; }
        public string MedicalHistory { get; set; }
    }
}
