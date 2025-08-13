using System;
using BCrypt.Net;

class Program
{
    static void Main()
    {
        string password = "Sgunes";
        string hash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt());
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"Hash: {hash}");
        Console.WriteLine($"Verification: {BCrypt.Net.BCrypt.Verify(password, hash)}");
    }
}
