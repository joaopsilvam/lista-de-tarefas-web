﻿using System.ComponentModel.DataAnnotations;

public class TaskItem
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; }
    public string Description { get; set; }
    [Required]
    public string Status { get; set; }
    public string ImagePath { get; set; }
}
