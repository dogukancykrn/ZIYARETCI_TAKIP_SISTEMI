using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string password = "admin123";
        string hash = BCrypt.Net.BCrypt.HashPassword(password);
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"Hash: {hash}");
        Console.WriteLine($"Verification: {BCrypt.Net.BCrypt.Verify(password, hash)}");
    }
}
