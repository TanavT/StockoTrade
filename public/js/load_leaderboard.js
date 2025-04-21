document.addEventListener("DOMContentLoaded", function () {
    // Example data - replace with fetch call if pulling from server
    const leaderboard = [
        { username: "trader123", totalValue: 10342.55 },
        { username: "alphaWolf", totalValue: 9876.23 },
        { username: "stockKing", totalValue: 9534.10 }
    ];

    const tbody = document.getElementById("leaderboard-body");
    leaderboard.forEach(player => {
        const row = document.createElement("tr");

        const userCell = document.createElement("td");
        userCell.textContent = player.username;

        const valueCell = document.createElement("td");
        valueCell.textContent = `$${player.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        row.appendChild(userCell);
        row.appendChild(valueCell);
        tbody.appendChild(row);
    });
});