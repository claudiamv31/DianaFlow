using backend.Api;
using FluentAssertions;

namespace backend.Tests;

internal static class ApiErrorAssertions
{
    public static void ShouldHaveApiError(
        this object? value,
        string expectedCode,
        string? expectedField = null)
    {
        var error = value.Should().BeOfType<ApiError>().Subject;
        error.Code.Should().Be(expectedCode);
        error.Field.Should().Be(expectedField);
    }
}
