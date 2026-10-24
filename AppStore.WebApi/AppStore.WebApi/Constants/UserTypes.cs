namespace AppStore.WebApi.Constants
{
    public static class UserTypes
    {
        public const string Admin = "Admin";
        public const string SalesPerson = "Sales-Person";

        public static readonly string[] All = { Admin, SalesPerson };

        public static bool IsValid(string? type) => All.Contains(type);
    }
}