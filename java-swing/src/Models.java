package bloodsys;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Models {

    public static class User {
        public String id;
        public String name;
        public String email;
        public String role; // HOSPITAL, DONOR, BLOOD_BANK, ADMIN
        public double lat;
        public double lng;

        public User(String id, String name, String email, String role, double lat, double lng) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.lat = lat;
            this.lng = lng;
        }
    }

    public static class Donor {
        public String id;
        public String name;
        public String email;
        public String bloodGroup;
        public double lat;
        public double lng;
        public double reliabilityScore;
        public boolean isVerified;
        public boolean isAvailable;
        public int daysSinceLastDonation;

        public Donor(String id, String name, String email, String bloodGroup, double lat, double lng,
                     double reliabilityScore, boolean isVerified, boolean isAvailable, int daysSinceLastDonation) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.bloodGroup = bloodGroup;
            this.lat = lat;
            this.lng = lng;
            this.reliabilityScore = reliabilityScore;
            this.isVerified = isVerified;
            this.isAvailable = isAvailable;
            this.daysSinceLastDonation = daysSinceLastDonation;
        }
    }

    public static class InventoryItem {
        public String bloodGroup;
        public int unitsAvailable;

        public InventoryItem(String bloodGroup, int unitsAvailable) {
            this.bloodGroup = bloodGroup;
            this.unitsAvailable = unitsAvailable;
        }
    }

    public static class EmergencyRequest {
        public String id;
        public String hospitalName;
        public String bloodGroup;
        public int unitsRequired;
        public String urgency; // CRITICAL, HIGH
        public String status;  // PENDING, SEARCHING, RESERVED, FULFILLED, FAILED
        public String assignedTarget;
        public String createdAt;

        public EmergencyRequest(String id, String hospitalName, String bloodGroup, int unitsRequired,
                                String urgency, String status, String assignedTarget) {
            this.id = id;
            this.hospitalName = hospitalName;
            this.bloodGroup = bloodGroup;
            this.unitsRequired = unitsRequired;
            this.urgency = urgency;
            this.status = status;
            this.assignedTarget = assignedTarget;
            this.createdAt = new SimpleDateFormat("yyyy-MM-dd HH:mm").format(new Date());
        }
    }

    public static class AuditLog {
        public String id;
        public String requestId;
        public String decisionAction;
        public String reasoningText;
        public String timestamp;

        public AuditLog(String id, String requestId, String decisionAction, String reasoningText) {
            this.id = id;
            this.requestId = requestId;
            this.decisionAction = decisionAction;
            this.reasoningText = reasoningText;
            this.timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        }
    }
}
