$jsonList = Invoke-RestMethod -Uri 'http://localhost:9222/json/list'
$page = $jsonList | Where-Object { $_.url -like "*sistemateos.github.oi*" }
if (-not $page) {
    Write-Host "No se encontro la pagina en Chrome Headless." -ForegroundColor Red
    exit
}

$wsUrl = $page.webSocketDebuggerUrl
Write-Host "Conectando al WebSocket de depuracion: $wsUrl" -ForegroundColor Cyan

$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>Debugger</title>
    <script>
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var logFile = fso.CreateTextFile("c:\\Users\\misae\\Downloads\\SISTEMA TEOS\\SISTEMA TEOS\\console_logs.txt", true);
        
        logFile.WriteLine("=== LOGS DE CONSOLA DE CHROME ===");
        
        var ws = new WebSocket("$wsUrl");
        
        ws.onopen = function() {
            logFile.WriteLine("[WS] Conectado.");
            ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
            ws.send(JSON.stringify({ id: 2, method: "Log.enable" }));
        };
        
        ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            if (data.method === "Runtime.consoleAPICalled") {
                var args = data.params.args.map(function(a) { return a.value || JSON.stringify(a); }).join(" ");
                logFile.WriteLine("[CONSOLE] " + args);
            }
            if (data.method === "Log.entryAdded") {
                logFile.WriteLine("[LOG] " + data.params.entry.text);
            }
        };
        
        ws.onerror = function(err) {
            logFile.WriteLine("[ERROR WS] " + JSON.stringify(err));
        };
        
        setTimeout(function() {
            logFile.Close();
            window.close();
        }, 3000);
    </script>
</head>
<body>
    <h3>Depurando...</h3>
</body>
</html>
"@

Set-Content -Path "temp_debugger.html" -Value $htmlContent

# Execute HTApp
Start-Process "mshta.exe" -ArgumentList "c:\Users\misae\Downloads\SISTEMA TEOS\SISTEMA TEOS\temp_debugger.html"
Start-Sleep -Seconds 5

if (Test-Path "console_logs.txt") {
    Get-Content "console_logs.txt"
} else {
    Write-Host "No se pudo generar console_logs.txt" -ForegroundColor Red
}

# Cleanup
Remove-Item "temp_debugger.html" -ErrorAction SilentlyContinue
# Stop Chrome
$chromeProcesses = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
foreach ($p in $chromeProcesses) {
    if ($p.Path -like "*chrome.exe*") {
        $p.Kill()
    }
}
