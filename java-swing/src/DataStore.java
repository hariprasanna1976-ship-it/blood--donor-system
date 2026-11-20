package bloodsys;

import java.util.*;

public class DataStore {
    private static DataStore instance;

    public List<Models.Donor> donors = new ArrayList<>();
    public Map<String, Models.InventoryItem> inventory = new LinkedHashMap<>();
    public List<Models.EmergencyRequest> requests = new ArrayList<>();
    public List<Models.AuditLog> auditLogs = new ArrayList<>();

    public Models.User currentUser;

    private DataStore() {
        seedInitialData();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    private void seedInitialData() {
        // Current user default (Hospital)
        currentUser = new Models.User("usr-1", "City Central Hospital", "cityhospital@bloodsys.com", "HOSPITAL", 40.7128, -74.0060);

        // 8 Blood Group Inventory
        String[] groups = {"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        int[] units = {14, 6, 10, 4, 8, 3, 5, 2};
        for (int i = 0; i < groups.length; i++) {
            inventory.put(groups[i], new Models.InventoryItem(groups[i], units[i]));
        }

        // Donors
        donors.add(new Models.Donor("d-1", "Alex Rivera (Universal)", "alex.rivera@example.com", "O-", 40.7180, -74.0030, 9.9, true, true, 110));
        donors.add(new Models.Donor("d-2", "Sarah Connor", "sarah.connor@example.com", "A+", 40.7250, -74.0090, 9.2, true, true, 95));
        donors.add(new Models.Donor("d-3", "Marcus Vance", "marcus.vance@example.com", "B-", 40.7110, -74.0150, 8.8, true, true, 102));
        donors.add(new Models.Donor("d-4", "Dr. Elena Rostova", "elena.rostova@example.com", "AB+", 40.7300, -73.9950, 9.7, true, true, 130));
        donors.add(new Models.Donor("d-5", "David Kim", "david.kim@example.com", "B+", 40.7090, -74.0010, 8.5, true, true, 80));
        donors.add(new Models.Donor("d-6", "John Doe", "john.doe@example.com", "O+", 40.7150, -74.0100, 9.5, true, true, 120));

        // Sample Requests
        requests.add(new Models.EmergencyRequest("REQ-9012", "City Central Hospital", "O-", 2, "CRITICAL", "PENDING", "Unassigned"));
        requests.add(new Models.EmergencyRequest("REQ-8431", "St. Jude Trauma Ward", "A+", 3, "HIGH", "RESERVED", "Central Blood Bank (3 units)"));
        requests.add(new Models.EmergencyRequest("REQ-7104", "Metro Surgical Center", "B-", 1, "HIGH", "RESERVED", "Donor: Marcus Vance"));

        // Sample Initial Audit Logs
        auditLogs.add(new Models.AuditLog("LOG-101", "REQ-8431", "START_SEARCH", "Agent activated for Request #REQ-8431 (A+, 3 units, HIGH)."));
        auditLogs.add(new Models.AuditLog("LOG-102", "REQ-8431", "INVENTORY_RESERVED", "Reserved 3 units of A+ from Central Blood Bank (1.2 km away)."));
        auditLogs.add(new Models.AuditLog("LOG-103", "REQ-7104", "START_SEARCH", "Agent activated for Request #REQ-7104 (B-, 1 unit, HIGH)."));
        auditLogs.add(new Models.AuditLog("LOG-104", "REQ-7104", "INVENTORY_EMPTY", "Bank inventory low. Fallback to active donor radar."));
        auditLogs.add(new Models.AuditLog("LOG-105", "REQ-7104", "DONOR_ASSIGNED", "Assigned Donor Marcus Vance (B-) | Distance: 1.1km | Score: 93.4"));
    }

    public int getAvailableDonorCount() {
        int count = 0;
        for (Models.Donor d : donors) {
            if (d.isAvailable) count++;
        }
        return count;
    }

    public int getTotalInventoryUnits() {
        int count = 0;
        for (Models.InventoryItem item : inventory.values()) {
            count += item.unitsAvailable;
        }
        return count;
    }

    public int getPendingRequestsCount() {
        int count = 0;
        for (Models.EmergencyRequest r : requests) {
            if ("PENDING".equalsIgnoreCase(r.status) || "SEARCHING".equalsIgnoreCase(r.status)) count++;
        }
        return count;
    }
}
