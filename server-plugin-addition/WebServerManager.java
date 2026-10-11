package me.moneysmp.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import me.moneysmp.MoneySMP;
import me.moneysmp.managers.*;
import me.moneysmp.models.PlayerTier;
import me.moneysmp.models.Team;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * Embedded HTTP server that exposes a lightweight JSON API endpoint:
 * GET /api/leaderboard
 * 
 * Supports CORS so the web app can query it from any domain or localhost.
 */
public class WebServerManager {

    private final MoneySMP plugin;
    private final TeamManager teamManager;
    private final CreditManager creditManager;
    private final TierManager tierManager;
    private final PhaseManager phaseManager;
    private final EliminationManager eliminationManager;
    private final EventManager eventManager;

    private HttpServer server;
    private int port = 8080;

    public WebServerManager(MoneySMP plugin, TeamManager teamManager, CreditManager creditManager,
                            TierManager tierManager, PhaseManager phaseManager,
                            EliminationManager eliminationManager, EventManager eventManager) {
        this.plugin = plugin;
        this.teamManager = teamManager;
        this.creditManager = creditManager;
        this.tierManager = tierManager;
        this.phaseManager = phaseManager;
        this.eliminationManager = eliminationManager;
        this.eventManager = eventManager;

        // Read port from config.yml if specified (default 8080)
        this.port = plugin.getConfig().getInt("web-server.port", 8080);
    }

    public void start() {
        boolean enabled = plugin.getConfig().getBoolean("web-server.enabled", true);
        if (!enabled) {
            plugin.getLogger().info("[WebAPI] Web server is disabled in config.yml.");
            return;
        }

        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);
            server.createContext("/api/leaderboard", new LeaderboardHandler());
            server.setExecutor(Executors.newCachedThreadPool());
            server.start();
            plugin.getLogger().info("[WebAPI] Live Leaderboard REST API running at http://0.0.0.0:" + port + "/api/leaderboard");
        } catch (IOException e) {
            plugin.getLogger().severe("[WebAPI] Could not start HTTP server on port " + port + ": " + e.getMessage());
        }
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            plugin.getLogger().info("[WebAPI] HTTP server stopped.");
        }
    }

    private class LeaderboardHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Enable Cross-Origin Resource Sharing (CORS)
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            // Build JSON payload
            String jsonResponse = buildLeaderboardJson();
            byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);

            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private String buildLeaderboardJson() {
        Collection<Team> teams = teamManager.getTeams();
        List<Team> sortedTeams = new ArrayList<>(teams);

        // Sort descending by total team game credits
        sortedTeams.sort((t1, t2) -> {
            int c1 = calculateTeamCredits(t1);
            int c2 = calculateTeamCredits(t2);
            return Integer.compare(c2, c1);
        });

        int totalParticipants = 0;
        int totalEliminated = 0;

        StringBuilder teamsJson = new StringBuilder();
        teamsJson.append("[");

        for (int i = 0; i < sortedTeams.size(); i++) {
            Team team = sortedTeams.get(i);
            int totalCredits = calculateTeamCredits(team);

            OfflinePlayer capPlayer = Bukkit.getOfflinePlayer(team.getCaptain());
            String captainName = capPlayer.getName() != null ? capPlayer.getName() : "Unknown";

            int aliveCount = 0;
            int deadCount = 0;

            StringBuilder membersJson = new StringBuilder();
            membersJson.append("[");

            List<UUID> memberUuids = team.getMembers();
            for (int m = 0; m < memberUuids.size(); m++) {
                UUID mUuid = memberUuids.get(m);
                OfflinePlayer op = Bukkit.getOfflinePlayer(mUuid);
                String pName = op.getName() != null ? op.getName() : "Player";

                PlayerTier tier = tierManager.getTier(mUuid);
                boolean isCaptain = mUuid.equals(team.getCaptain());
                boolean isEliminated = eliminationManager.isEliminated(mUuid);

                if (isEliminated) {
                    deadCount++;
                    totalEliminated++;
                } else {
                    aliveCount++;
                }
                totalParticipants++;

                int gameCredits = creditManager.getGameCredits(mUuid);
                int draftCredits = creditManager.getDraftCredits(mUuid);

                membersJson.append("{")
                        .append("\"uuid\":\"").append(mUuid).append("\",")
                        .append("\"name\":\"").append(escapeJson(pName)).append("\",")
                        .append("\"tier\":\"").append(tier.name()).append("\",")
                        .append("\"gameCredits\":").append(gameCredits).append(",")
                        .append("\"draftCredits\":").append(draftCredits).append(",")
                        .append("\"isCaptain\":").append(isCaptain).append(",")
                        .append("\"isEliminated\":").append(isEliminated)
                        .append("}");

                if (m < memberUuids.size() - 1) {
                    membersJson.append(",");
                }
            }
            membersJson.append("]");

            teamsJson.append("{")
                    .append("\"id\":\"").append(escapeJson(team.getName().toLowerCase())).append("\",")
                    .append("\"name\":\"").append(escapeJson(team.getName())).append("\",")
                    .append("\"colorCode\":\"").append(escapeJson(team.getColorCode())).append("\",")
                    .append("\"captain\":\"").append(team.getCaptain()).append("\",")
                    .append("\"captainName\":\"").append(escapeJson(captainName)).append("\",")
                    .append("\"totalCredits\":").append(totalCredits).append(",")
                    .append("\"aliveCount\":").append(aliveCount).append(",")
                    .append("\"eliminatedCount\":").append(deadCount).append(",")
                    .append("\"members\":").append(membersJson)
                    .append("}");

            if (i < sortedTeams.size() - 1) {
                teamsJson.append(",");
            }
        }
        teamsJson.append("]");

        String phase = phaseManager.getCurrentPhase().name();
        String phaseDisplayName = switch (phaseManager.getCurrentPhase()) {
            case DRAFT -> "Draft Phase";
            case GRACE -> "Grace Period";
            case PVP -> "Combat & Eliminations";
            case FINALE -> "Finale Showdown";
        };

        boolean kothActive = eventManager.isKothActive();
        boolean bingoActive = eventManager.isBingoActive();

        return "{" +
                "\"status\":{" +
                "\"serverName\":\"Willy Money SMP\"," +
                "\"onlinePlayers\":" + Bukkit.getOnlinePlayers().size() + "," +
                "\"maxPlayers\":" + Bukkit.getMaxPlayers() + "," +
                "\"phase\":\"" + phase + "\"," +
                "\"phaseName\":\"" + escapeJson(phaseDisplayName) + "\"," +
                "\"kothActive\":" + kothActive + "," +
                "\"bingoActive\":" + bingoActive + "," +
                "\"totalTeams\":" + sortedTeams.size() + "," +
                "\"totalParticipants\":" + totalParticipants + "," +
                "\"eliminatedCount\":" + totalEliminated + "," +
                "\"lastUpdated\":\"" + Instant.now().toString() + "\"" +
                "}," +
                "\"teams\":" + teamsJson +
                "}";
    }

    private int calculateTeamCredits(Team team) {
        int total = 0;
        for (UUID member : team.getMembers()) {
            total += creditManager.getGameCredits(member);
        }
        return total;
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
