# Agentic AI Blood Coordination System (Java Swing JFrame Edition)

This is the complete desktop edition of the **Agentic AI Blood Coordination System** built purely using Java Swing (`JFrame`, `JPanel`, `JTabbedPane`, `JTable`, and `Graphics2D`).

---

## 🚀 How to Run the JFrame Application

### Option 1 (One-Click):
Double-click `run-swing-app.bat` in the project root, or `java-swing\run.bat`.

### Option 2 (Command Line):
In your terminal, navigate to the `java-swing` directory and run:
```bash
java -jar AgenticBloodSystem.jar
```

---

## 🏗️ Architecture & JFrame Structure

- **`LoginFrame.java` (`extends JFrame`)**:
  - Secure entry checkpoint with **1-Click Preset Roles**:
    - 🏥 Hospital (`cityhospital@bloodsys.com`)
    - 🩸 Active Donor (`alex.rivera@example.com` - O- Universal Donor)
    - 🏦 Blood Bank (`centralbank@bloodsys.com`)
    - 🛡️ System Admin (`admin@bloodsys.com`)
  - Authenticates and opens `DashboardFrame`.

- **`DashboardFrame.java` (`extends JFrame`)**:
  - **KPI Metrics Cards**: Real-time counters for Pending Requests, Standby Donors, Inventory Units, and AI Decisions.
  - **4 Functional Tabs (`JTabbedPane`)**:
    1. **Emergency Requests Hub**:
       - View all active emergency broadcasts.
       - **"⚡ Run AI Coordinator on Selected"**: Executes the autonomous agent matching algorithm on any pending emergency.
       - **"+ Post Emergency Request"**: Modal dialog (`JDialog`) to broadcast new emergency requests.
    2. **Donor Radar & Network**:
       - `RadarPanel.java` (`extends JPanel`): Real-time animated circular radar with concentric 5km/10km/15km range rings, rotating sweep line, central hospital, and live color-coded donor points.
       - Donor registry table with reliability scores (1-10) and availability toggles.
    3. **Blood Bank Inventory**:
       - Live cards for all 8 blood groups (`O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`) with real-time stock levels, health indicators, and `-1`, `+1`, `+5 Restock` buttons.
    4. **AI Decision Audit Trail**:
       - Transparent `JTable` displaying full `AI_AuditLog` entries with exact timestamps and clinical reasoning traces.

- **`AICoordinator.java`**:
  - **Haversine Distance**: Spherical distance calculation between coordinates.
  - **Clinical Compatibility Matrix**: Rh factor and universal donor/recipient rules.
  - **Multi-Factor Scoring**: `Score = (Reliability * 10) + Verification Bonus - (Distance * 2.2)`.
  - **Safe Fallback**: Automatically reserves bank units first before calling standby donors.

- **`DataStore.java`**:
  - Pre-seeded in-memory store matching the SQLite database records.
