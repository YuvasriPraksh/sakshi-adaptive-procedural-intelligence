$base = "C:\Users\HP\OneDrive\Desktop\Sakshi-Ai\Backend"

$inits = @(
    "app\__init__.py",
    "app\api\__init__.py",
    "app\api\v1\__init__.py",
    "app\api\v1\auth\__init__.py",
    "app\api\v1\users\__init__.py",
    "app\api\v1\cases\__init__.py",
    "app\api\v1\evidence\__init__.py",
    "app\api\v1\workflow\__init__.py",
    "app\api\v1\analytics\__init__.py",
    "app\api\v1\reports\__init__.py",
    "app\api\v1\notifications\__init__.py",
    "app\api\v1\audit\__init__.py",
    "app\api\v1\ai\__init__.py",
    "app\api\v1\risk\__init__.py",
    "app\api\v1\readiness\__init__.py",
    "app\api\v1\public\__init__.py",
    "app\core\__init__.py",
    "app\models\__init__.py",
    "app\schemas\__init__.py",
    "app\services\__init__.py",
    "app\repositories\__init__.py",
    "app\dependencies\__init__.py",
    "app\middleware\__init__.py",
    "app\utils\__init__.py",
    "app\tests\__init__.py"
)

foreach ($f in $inits) {
    Set-Content -Path "$base\$f" -Value "" -Encoding UTF8
}

Write-Host "All __init__.py files created successfully."
