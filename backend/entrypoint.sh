set -e
while ! nc -z db 5432; do
  sleep 2
done
dotnet ef database update --project TaskManagerApi.csproj
exec dotnet TaskManagerApi.dll
