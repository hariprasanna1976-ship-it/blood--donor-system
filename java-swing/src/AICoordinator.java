package bloodsys;

import java.util.*;

public class AICoordinator {

    // Compatibility rules: Recipient -> List of compatible Donor blood groups
    private static final Map<String, List<String>> COMPATIBILITY = new HashMap<>();

    static {
        COMPATIBILITY.put("O-", Arrays.asList("O-"));
        COMPATIBILITY.put("O+", Arrays.asList("O-", "O+"));
        COMPATIBILITY.put("A-", Arrays.asList("O-", "A-"));
        COMPATIBILITY.put("A+", Arrays.asList("O-", "O+", "A-", "A+"));
        COMPATIBILITY.put("B-", Arrays.asList("O-", "B-"));
        COMPATIBILITY.put("B+", Arrays.asList("O-", "O+", "B-", "B+"));
        COMPATIBILITY.put("AB-", Arrays.asList("O-", "A-", "B-", "AB-"));
        COMPATIBILITY.put("AB+", Arrays.asList("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"));
    }

    public static double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    public static class MatchResult {
        public boolean success;
        public String action;
        public String message;
        public List<String> steps = new ArrayList<>();
    }

    public static MatchResult executeCoordination(Models.EmergencyRequest req) {
        DataStore store = DataStore.getInstance();
        MatchResult result = new MatchResult();

        double hospitalLat = store.currentUser != null ? store.currentUser.lat : 40.7128;
        double hospitalLng = store.currentUser != null ? store.currentUser.lng : -74.0060;

        // Step 1: Start search
        String startMsg = "Agent activated for " + req.id + " (" + req.bloodGroup + ", " + req.unitsRequired + " units, " + req.urgency + ").";
        result.steps.add("[START_SEARCH] " + startMsg);
        store.auditLogs.add(0, new Models.AuditLog(UUID.randomUUID().toString().substring(0, 8), req.id, "START_SEARCH", startMsg));
        req.status = "SEARCHING";

        List<String> compatibleGroups = COMPATIBILITY.getOrDefault(req.bloodGroup, Collections.singletonList(req.bloodGroup));

        // Step 2: Check Blood Bank Inventory
        Models.InventoryItem bestStock = null;
        for (String group : compatibleGroups) {
            Models.InventoryItem item = store.inventory.get(group);
            if (item != null && item.unitsAvailable >= req.unitsRequired) {
                bestStock = item;
                break;
            }
        }

        if (bestStock != null) {
            // Found in bank
            bestStock.unitsAvailable -= req.unitsRequired;
            req.status = "RESERVED";
            req.assignedTarget = "Central Blood Bank (" + req.unitsRequired + " units of " + bestStock.bloodGroup + ")";
            String successMsg = "Autonomous reservation: Reserved " + req.unitsRequired + " unit(s) of " +
                                bestStock.bloodGroup + " from Central Blood Bank. ETA ~15 mins.";
            result.success = true;
            result.action = "INVENTORY_RESERVED";
            result.message = successMsg;
            result.steps.add("[INVENTORY_RESERVED] " + successMsg);
            store.auditLogs.add(0, new Models.AuditLog(UUID.randomUUID().toString().substring(0, 8), req.id, "INVENTORY_RESERVED", successMsg));
            return result;
        }

        // Step 3: Bank empty -> Scan Donor Network
        String invEmptyMsg = "Bank inventory insufficient for " + req.bloodGroup + ". Fallback to live donor radar scan.";
        result.steps.add("[INVENTORY_EMPTY] " + invEmptyMsg);
        store.auditLogs.add(0, new Models.AuditLog(UUID.randomUUID().toString().substring(0, 8), req.id, "INVENTORY_EMPTY", invEmptyMsg));

        // Filter eligible donors
        List<Models.Donor> candidates = new ArrayList<>();
        for (Models.Donor d : store.donors) {
            if (d.isAvailable && compatibleGroups.contains(d.bloodGroup) && d.daysSinceLastDonation >= 90) {
                candidates.add(d);
            }
        }

        if (candidates.isEmpty()) {
            req.status = "FAILED";
            String failMsg = "Critical Alert: No active, eligible donors found matching " + req.bloodGroup + ". Dispatch broadcast sent to regional centers.";
            result.success = false;
            result.action = "NO_DONORS_FOUND";
            result.message = failMsg;
            result.steps.add("[NO_DONORS_FOUND] " + failMsg);
            store.auditLogs.add(0, new Models.AuditLog(UUID.randomUUID().toString().substring(0, 8), req.id, "NO_DONORS_FOUND", failMsg));
            return result;
        }

        // Rank donors by multi-factor score
        Models.Donor bestDonor = null;
        double bestScore = -9999;
        double bestDist = 0;

        for (Models.Donor d : candidates) {
            double dist = calculateDistanceKm(hospitalLat, hospitalLng, d.lat, d.lng);
            double bonus = d.isVerified ? 20.0 : 0.0;
            double score = (d.reliabilityScore * 10.0) + bonus - (dist * 2.2);

            result.steps.add("Candidate: " + d.name + " (" + d.bloodGroup + ") | Dist: " + dist + "km | Reliability: " + d.reliabilityScore + "/10 | Score: " + Math.round(score * 10.0)/10.0);

            if (score > bestScore) {
                bestScore = score;
                bestDonor = d;
                bestDist = dist;
            }
        }

        // Assign best donor
        bestDonor.isAvailable = false;
        req.status = "RESERVED";
        req.assignedTarget = "Donor: " + bestDonor.name + " (" + bestDonor.bloodGroup + ")";

        String donorAssignedMsg = "Optimal match confirmed: Donor " + bestDonor.name + " (" + bestDonor.bloodGroup +
                                  ") assigned. Distance: " + bestDist + " km | Score: " + Math.round(bestScore * 10.0)/10.0 + ". Alert dispatched.";
        result.success = true;
        result.action = "DONOR_ASSIGNED";
        result.message = donorAssignedMsg;
        result.steps.add("[DONOR_ASSIGNED] " + donorAssignedMsg);
        store.auditLogs.add(0, new Models.AuditLog(UUID.randomUUID().toString().substring(0, 8), req.id, "DONOR_ASSIGNED", donorAssignedMsg));

        return result;
    }
}
