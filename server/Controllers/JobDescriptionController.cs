﻿// server/Controllers/JobDescriptionController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;            // ← for IConfiguration

namespace TriPowersLLC.Controllers
{
    public class ChatMessage
    {
        public string Role { get; set; } = null!;
        public string Content { get; set; } = null!;
    }

    [Route("api/[controller]")]
    [ApiController]
    public class JobDescriptionController : ControllerBase
    {
        private readonly HttpClient _openAiClient;
        private readonly IConfiguration _configuration;

        // Inject IHttpClientFactory and IConfiguration
        public JobDescriptionController(IHttpClientFactory factory, IConfiguration configuration)
        {
            _openAiClient = factory.CreateClient("OpenAI");
            _configuration = configuration;
        }
        public class ChatRequest
        {
            public string Model { get; set; } = null!;
            public ChatMessage[] Messages { get; set; } = null!;
        }

       [HttpPost]
        public async Task<IActionResult> Generate([FromBody] ChatRequest request)
        {
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/v1/chat/completions")
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(new {
                        model = request.Model,
                        messages = request.Messages
            }),
            Encoding.UTF8,
            "application/json"
        )
    };

            HttpResponseMessage response;
            try
            {
                response = await _openAiClient.SendAsync(httpRequest);
                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    // Log all rate‐limit headers
                    foreach (var header in response.Headers)
                    {
                        if (header.Key.StartsWith("x-ratelimit-", StringComparison.OrdinalIgnoreCase) ||
                            header.Key.Equals("Retry-After", StringComparison.OrdinalIgnoreCase))
                        {
                            Console.WriteLine($"[OPENAI RATE] {header.Key}: {string.Join(", ", header.Value)}");
                        }
                    }
                    // Optionally read Retry-After header:
                    var retryAfter = response.Headers.RetryAfter?.Delta?.TotalSeconds;
                    return StatusCode(429, new
                    {
                        error = "Rate limit exceeded. Please wait and try again.",
                        retryAfter = response.Headers.RetryAfter?.Delta?.TotalSeconds
                    });

                }
                response.EnsureSuccessStatusCode();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine("[OPENAI ERROR] " + ex.Message);

                return StatusCode(502, new { error = "Failed to call OpenAI: " + ex.Message });
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var message = doc
                .RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            return Ok(new { description = message });
        }
    }

    public class JobPrompt
    {
        public string? Prompt { get; set; }
    }
}
