namespace ems.Configuration
{
    public static class CorsConfiguration
    {
        public static IServiceCollection AddCorsConfiguration(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var frontendUrls = configuration.GetSection("Frontend:Urls")
                .Get<string[]>() ?? [configuration["Frontend:Url"] ?? string.Empty];

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(frontendUrls.Where(url => !string.IsNullOrWhiteSpace(url)).ToArray())
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            return services;
        }
    }
}