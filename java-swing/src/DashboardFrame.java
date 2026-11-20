package bloodsys;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.List;

public class DashboardFrame extends JFrame {

    private JLabel statPendingLabel;
    private JLabel statDonorsLabel;
    private JLabel statInventoryLabel;
    private JLabel statAuditLabel;

    private DefaultTableModel requestsTableModel;
    private JTable requestsTable;

    private DefaultTableModel donorsTableModel;
    private JTable donorsTable;

    private DefaultTableModel auditTableModel;
    private JTable auditTable;

    private JPanel inventoryCardsPanel;
    private RadarPanel radarPanel;

    public DashboardFrame() {
        setTitle("Agentic AI Blood Coordination System - Dashboard");
        setSize(1180, 800);
        setMinimumSize(new Dimension(980, 680));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(new Color(8, 12, 20));

        initUI();
        refreshAllData();
    }

    private void initUI() {
        setLayout(new BorderLayout());

        // TOP HEADER BAR
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(new Color(15, 23, 42));
        headerPanel.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(255, 255, 255, 20)));
        headerPanel.setPreferredSize(new Dimension(1180, 56));

        // Header Left: Logo & Engine Active Status
        JPanel headerLeft = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 12));
        headerLeft.setOpaque(false);

        JLabel logo = new JLabel("✚ Agentic AI Blood System");
        logo.setFont(new Font("SansSerif", Font.BOLD, 17));
        logo.setForeground(new Color(244, 63, 94));
        headerLeft.add(logo);

        JLabel engineStatus = new JLabel(" ● Autonomous Engine Online ");
        engineStatus.setFont(new Font("SansSerif", Font.BOLD, 11));
        engineStatus.setOpaque(true);
        engineStatus.setBackground(new Color(16, 185, 129, 35));
        engineStatus.setForeground(new Color(52, 211, 153));
        engineStatus.setBorder(BorderFactory.createLineBorder(new Color(16, 185, 129, 80), 1));
        headerLeft.add(engineStatus);

        headerPanel.add(headerLeft, BorderLayout.WEST);

        // Header Right: User Info & Logout Button
        JPanel headerRight = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 12));
        headerRight.setOpaque(false);

        Models.User user = DataStore.getInstance().currentUser;
        String userName = user != null ? user.name : "City Central Hospital";
        String userRole = user != null ? user.role : "HOSPITAL";

        JLabel userLabel = new JLabel("👤 " + userName + " [" + userRole + "] ");
        userLabel.setFont(new Font("SansSerif", Font.PLAIN, 12));
        userLabel.setForeground(new Color(203, 213, 225));
        headerRight.add(userLabel);

        JButton logoutBtn = new JButton("Switch / Logout");
        logoutBtn.setBackground(new Color(30, 41, 59));
        logoutBtn.setForeground(Color.WHITE);
        logoutBtn.setFocusPainted(false);
        logoutBtn.setFont(new Font("SansSerif", Font.PLAIN, 11));
        logoutBtn.setBorder(new EmptyBorder(5, 10, 5, 10));
        logoutBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        logoutBtn.addActionListener(e -> {
            new LoginFrame().setVisible(true);
            dispose();
        });
        headerRight.add(logoutBtn);

        headerPanel.add(headerRight, BorderLayout.EAST);
        add(headerPanel, BorderLayout.NORTH);

        // MAIN CONTENT CONTAINER
        JPanel mainContainer = new JPanel(new BorderLayout(0, 15));
        mainContainer.setOpaque(false);
        mainContainer.setBorder(new EmptyBorder(15, 15, 15, 15));

        // STATS CARDS ROW
        JPanel statsPanel = new JPanel(new GridLayout(1, 4, 15, 0));
        statsPanel.setOpaque(false);
        statsPanel.setPreferredSize(new Dimension(1150, 85));

        statPendingLabel = new JLabel("0", SwingConstants.CENTER);
        statDonorsLabel = new JLabel("0", SwingConstants.CENTER);
        statInventoryLabel = new JLabel("0", SwingConstants.CENTER);
        statAuditLabel = new JLabel("0", SwingConstants.CENTER);

        statsPanel.add(createStatCard("🚨 PENDING REQUESTS", statPendingLabel, new Color(244, 63, 94)));
        statsPanel.add(createStatCard("🩸 STANDBY DONORS", statDonorsLabel, new Color(52, 211, 153)));
        statsPanel.add(createStatCard("🏦 BANK INVENTORY UNITS", statInventoryLabel, new Color(56, 189, 248)));
        statsPanel.add(createStatCard("🤖 AI DECISIONS LOGGED", statAuditLabel, new Color(167, 139, 250)));

        mainContainer.add(statsPanel, BorderLayout.NORTH);

        // TABS PANEL
        JTabbedPane tabbedPane = new JTabbedPane();
        tabbedPane.setFont(new Font("SansSerif", Font.BOLD, 12));
        tabbedPane.setBackground(new Color(15, 23, 42));
        tabbedPane.setForeground(new Color(226, 232, 240));

        tabbedPane.addTab("🚨 Emergency Requests Hub", createRequestsTab());
        tabbedPane.addTab("📡 Donor Radar & Network", createRadarTab());
        tabbedPane.addTab("📦 Blood Bank Inventory", createInventoryTab());
        tabbedPane.addTab("🧠 AI Decision Audit Trail", createAuditTab());

        mainContainer.add(tabbedPane, BorderLayout.CENTER);
        add(mainContainer, BorderLayout.CENTER);
    }

    private JPanel createStatCard(String title, JLabel valueLabel, Color accentColor) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(new Color(15, 23, 42));
        card.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),
            new EmptyBorder(8, 12, 8, 12)
        ));

        JLabel titleLbl = new JLabel(title);
        titleLbl.setFont(new Font("SansSerif", Font.BOLD, 10));
        titleLbl.setForeground(new Color(148, 163, 184));
        card.add(titleLbl, BorderLayout.NORTH);

        valueLabel.setFont(new Font("SansSerif", Font.BOLD, 26));
        valueLabel.setForeground(accentColor);
        card.add(valueLabel, BorderLayout.CENTER);

        return card;
    }

    // TAB 1: EMERGENCY REQUESTS
    private JPanel createRequestsTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 10));
        panel.setBackground(new Color(11, 15, 23));
        panel.setBorder(new EmptyBorder(12, 12, 12, 12));

        // Toolbar
        JPanel toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        toolbar.setOpaque(false);

        JButton newReqBtn = new JButton("+ Post Emergency Request");
        newReqBtn.setBackground(new Color(225, 29, 72));
        newReqBtn.setForeground(Color.WHITE);
        newReqBtn.setFont(new Font("SansSerif", Font.BOLD, 12));
        newReqBtn.setFocusPainted(false);
        newReqBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        newReqBtn.addActionListener(e -> showNewRequestDialog());
        toolbar.add(newReqBtn);

        JButton runAgentBtn = new JButton("⚡ Run AI Coordinator on Selected");
        runAgentBtn.setBackground(new Color(139, 92, 246));
        runAgentBtn.setForeground(Color.WHITE);
        runAgentBtn.setFont(new Font("SansSerif", Font.BOLD, 12));
        runAgentBtn.setFocusPainted(false);
        runAgentBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        runAgentBtn.addActionListener(e -> handleRunAgentOnSelected());
        toolbar.add(runAgentBtn);

        JButton refreshBtn = new JButton("↻ Refresh");
        refreshBtn.setBackground(new Color(30, 41, 59));
        refreshBtn.setForeground(Color.WHITE);
        refreshBtn.setFocusPainted(false);
        refreshBtn.addActionListener(e -> refreshAllData());
        toolbar.add(refreshBtn);

        panel.add(toolbar, BorderLayout.NORTH);

        // Requests Table
        String[] columns = {"Request ID", "Hospital", "Blood Group", "Units", "Urgency", "Status", "Assigned Target", "Created At"};
        requestsTableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        requestsTable = new JTable(requestsTableModel);
        styleTable(requestsTable);

        JScrollPane scrollPane = new JScrollPane(requestsTable);
        scrollPane.getViewport().setBackground(new Color(15, 23, 42));
        scrollPane.setBorder(BorderFactory.createLineBorder(new Color(255, 255, 255, 15)));
        panel.add(scrollPane, BorderLayout.CENTER);

        return panel;
    }

    // TAB 2: DONOR RADAR & NETWORK
    private JPanel createRadarTab() {
        JPanel panel = new JPanel(new GridLayout(1, 2, 15, 0));
        panel.setBackground(new Color(11, 15, 23));
        panel.setBorder(new EmptyBorder(12, 12, 12, 12));

        // Left: Animated Radar
        JPanel radarCard = new JPanel(new BorderLayout(0, 8));
        radarCard.setBackground(new Color(15, 23, 42));
        radarCard.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),
            new EmptyBorder(10, 10, 10, 10)
        ));

        JLabel radarTitle = new JLabel("📡 Real-time Proximity Radar (Range 15 km)");
        radarTitle.setFont(new Font("SansSerif", Font.BOLD, 13));
        radarTitle.setForeground(new Color(226, 232, 240));
        radarCard.add(radarTitle, BorderLayout.NORTH);

        radarPanel = new RadarPanel();
        radarCard.add(radarPanel, BorderLayout.CENTER);
        panel.add(radarCard);

        // Right: Donor Registry
        JPanel donorCard = new JPanel(new BorderLayout(0, 8));
        donorCard.setBackground(new Color(15, 23, 42));
        donorCard.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),
            new EmptyBorder(10, 10, 10, 10)
        ));

        JPanel donorHeader = new JPanel(new BorderLayout());
        donorHeader.setOpaque(false);

        JLabel donorTitle = new JLabel("👥 Registered Volunteer Standby Donors");
        donorTitle.setFont(new Font("SansSerif", Font.BOLD, 13));
        donorTitle.setForeground(new Color(226, 232, 240));
        donorHeader.add(donorTitle, BorderLayout.WEST);

        JPanel btnBar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 5, 0));
        btnBar.setOpaque(false);

        JButton addDonorBtn = new JButton("+ Register Donor");
        addDonorBtn.setBackground(new Color(225, 29, 72));
        addDonorBtn.setForeground(Color.WHITE);
        addDonorBtn.setFont(new Font("SansSerif", Font.BOLD, 11));
        addDonorBtn.setFocusPainted(false);
        addDonorBtn.addActionListener(e -> showNewDonorDialog());
        btnBar.add(addDonorBtn);

        JButton toggleBtn = new JButton("Toggle Availability");
        toggleBtn.setBackground(new Color(30, 41, 59));
        toggleBtn.setForeground(Color.WHITE);
        toggleBtn.setFont(new Font("SansSerif", Font.PLAIN, 11));
        toggleBtn.setFocusPainted(false);
        toggleBtn.addActionListener(e -> handleToggleDonor());
        btnBar.add(toggleBtn);

        donorHeader.add(btnBar, BorderLayout.EAST);
        donorCard.add(donorHeader, BorderLayout.NORTH);

        String[] donorCols = {"Name", "Blood", "Reliability", "Verified", "Status"};
        donorsTableModel = new DefaultTableModel(donorCols, 0) {
            @Override
            public boolean isCellEditable(int row, int col) { return false; }
        };
        donorsTable = new JTable(donorsTableModel);
        styleTable(donorsTable);

        JScrollPane dScroll = new JScrollPane(donorsTable);
        dScroll.getViewport().setBackground(new Color(15, 23, 42));
        dScroll.setBorder(BorderFactory.createLineBorder(new Color(255, 255, 255, 15)));
        donorCard.add(dScroll, BorderLayout.CENTER);

        panel.add(donorCard);
        return panel;
    }

    // TAB 3: BLOOD BANK INVENTORY
    private JPanel createInventoryTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 12));
        panel.setBackground(new Color(11, 15, 23));
        panel.setBorder(new EmptyBorder(12, 12, 12, 12));

        JLabel titleLbl = new JLabel("🏦 Central Blood Bank - Stock Reserves Across All 8 Groups");
        titleLbl.setFont(new Font("SansSerif", Font.BOLD, 14));
        titleLbl.setForeground(new Color(226, 232, 240));
        panel.add(titleLbl, BorderLayout.NORTH);

        inventoryCardsPanel = new JPanel(new GridLayout(2, 4, 15, 15));
        inventoryCardsPanel.setOpaque(false);
        panel.add(inventoryCardsPanel, BorderLayout.CENTER);

        return panel;
    }

    // TAB 4: AUDIT TRAIL
    private JPanel createAuditTab() {
        JPanel panel = new JPanel(new BorderLayout(0, 10));
        panel.setBackground(new Color(11, 15, 23));
        panel.setBorder(new EmptyBorder(12, 12, 12, 12));

        JLabel lbl = new JLabel("🧠 Autonomous Algorithmic Decision Trail (Transparent AI Audit Logs)");
        lbl.setFont(new Font("SansSerif", Font.BOLD, 13));
        lbl.setForeground(new Color(226, 232, 240));
        panel.add(lbl, BorderLayout.NORTH);

        String[] auditCols = {"Log ID", "Request", "Action Taken", "Timestamp", "Clinical Reasoning Trace"};
        auditTableModel = new DefaultTableModel(auditCols, 0) {
            @Override
            public boolean isCellEditable(int r, int c) { return false; }
        };
        auditTable = new JTable(auditTableModel);
        styleTable(auditTable);
        auditTable.getColumnModel().getColumn(4).setPreferredWidth(450);

        JScrollPane aScroll = new JScrollPane(auditTable);
        aScroll.getViewport().setBackground(new Color(15, 23, 42));
        aScroll.setBorder(BorderFactory.createLineBorder(new Color(255, 255, 255, 15)));
        panel.add(aScroll, BorderLayout.CENTER);

        return panel;
    }

    private void styleTable(JTable table) {
        table.setBackground(new Color(15, 23, 42));
        table.setForeground(new Color(241, 245, 249));
        table.setGridColor(new Color(30, 41, 59));
        table.setRowHeight(28);
        table.setFont(new Font("SansSerif", Font.PLAIN, 12));
        table.getTableHeader().setBackground(new Color(30, 41, 59));
        table.getTableHeader().setForeground(new Color(148, 163, 184));
        table.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 11));
        table.setSelectionBackground(new Color(225, 29, 72, 100));
        table.setSelectionForeground(Color.WHITE);

        DefaultTableCellRenderer centerRenderer = new DefaultTableCellRenderer();
        centerRenderer.setHorizontalAlignment(JLabel.CENTER);
        for (int i = 0; i < table.getColumnCount(); i++) {
            if (i != 4 && i != 6) {
                table.getColumnModel().getColumn(i).setCellRenderer(centerRenderer);
            }
        }
    }

    public void refreshAllData() {
        DataStore store = DataStore.getInstance();

        // 1. Refresh Counters
        statPendingLabel.setText(String.valueOf(store.getPendingRequestsCount()));
        statDonorsLabel.setText(String.valueOf(store.getAvailableDonorCount()));
        statInventoryLabel.setText(String.valueOf(store.getTotalInventoryUnits()));
        statAuditLabel.setText(String.valueOf(store.auditLogs.size()));

        // 2. Refresh Requests Table
        requestsTableModel.setRowCount(0);
        for (Models.EmergencyRequest r : store.requests) {
            requestsTableModel.addRow(new Object[]{
                r.id, r.hospitalName, r.bloodGroup, r.unitsRequired, r.urgency, r.status, r.assignedTarget, r.createdAt
            });
        }

        // 3. Refresh Donors Table
        donorsTableModel.setRowCount(0);
        for (Models.Donor d : store.donors) {
            donorsTableModel.addRow(new Object[]{
                d.name, d.bloodGroup, d.reliabilityScore + "/10", (d.isVerified ? "✓ Yes" : "No"), (d.isAvailable ? "● Available" : "○ Busy")
            });
        }

        // 4. Refresh Inventory Cards
        inventoryCardsPanel.removeAll();
        for (Models.InventoryItem item : store.inventory.values()) {
            JPanel card = new JPanel(new BorderLayout(5, 5));
            card.setBackground(new Color(15, 23, 42));
            boolean isLow = item.unitsAvailable < 3;
            card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(isLow ? new Color(225, 29, 72, 120) : new Color(255, 255, 255, 20), 1),
                new EmptyBorder(10, 10, 10, 10)
            ));

            JPanel top = new JPanel(new BorderLayout());
            top.setOpaque(false);
            JLabel bgLbl = new JLabel(item.bloodGroup);
            bgLbl.setFont(new Font("SansSerif", Font.BOLD, 18));
            bgLbl.setForeground(new Color(244, 63, 94));
            top.add(bgLbl, BorderLayout.WEST);

            JLabel status = new JLabel(isLow ? "Low Stock" : item.unitsAvailable >= 8 ? "Healthy" : "Moderate");
            status.setFont(new Font("SansSerif", Font.PLAIN, 10));
            status.setForeground(isLow ? new Color(244, 63, 94) : new Color(52, 211, 153));
            top.add(status, BorderLayout.EAST);
            card.add(top, BorderLayout.NORTH);

            JLabel unitsLbl = new JLabel(item.unitsAvailable + " units ready", SwingConstants.CENTER);
            unitsLbl.setFont(new Font("SansSerif", Font.BOLD, 16));
            unitsLbl.setForeground(Color.WHITE);
            card.add(unitsLbl, BorderLayout.CENTER);

            JPanel btnRow = new JPanel(new GridLayout(1, 3, 4, 0));
            btnRow.setOpaque(false);

            JButton minusBtn = new JButton("-1");
            minusBtn.setBackground(new Color(30, 41, 59));
            minusBtn.setForeground(Color.WHITE);
            minusBtn.setFont(new Font("SansSerif", Font.BOLD, 10));
            minusBtn.setFocusPainted(false);
            minusBtn.addActionListener(e -> {
                if (item.unitsAvailable > 0) {
                    item.unitsAvailable--;
                    refreshAllData();
                }
            });

            JButton plusBtn = new JButton("+1");
            plusBtn.setBackground(new Color(30, 41, 59));
            plusBtn.setForeground(Color.WHITE);
            plusBtn.setFont(new Font("SansSerif", Font.BOLD, 10));
            plusBtn.setFocusPainted(false);
            plusBtn.addActionListener(e -> {
                item.unitsAvailable++;
                refreshAllData();
            });

            JButton restockBtn = new JButton("+5");
            restockBtn.setBackground(new Color(225, 29, 72));
            restockBtn.setForeground(Color.WHITE);
            restockBtn.setFont(new Font("SansSerif", Font.BOLD, 10));
            restockBtn.setFocusPainted(false);
            restockBtn.addActionListener(e -> {
                item.unitsAvailable += 5;
                refreshAllData();
            });

            btnRow.add(minusBtn);
            btnRow.add(plusBtn);
            btnRow.add(restockBtn);
            card.add(btnRow, BorderLayout.SOUTH);

            inventoryCardsPanel.add(card);
        }
        inventoryCardsPanel.revalidate();
        inventoryCardsPanel.repaint();

        // 5. Refresh Audit Trail
        auditTableModel.setRowCount(0);
        for (Models.AuditLog log : store.auditLogs) {
            auditTableModel.addRow(new Object[]{
                log.id, log.requestId, log.decisionAction, log.timestamp, log.reasoningText
            });
        }

        if (radarPanel != null) {
            radarPanel.repaint();
        }
    }

    private void handleRunAgentOnSelected() {
        int selectedRow = requestsTable.getSelectedRow();
        if (selectedRow == -1) {
            // If none selected, run on the first pending request
            for (int i = 0; i < DataStore.getInstance().requests.size(); i++) {
                if ("PENDING".equalsIgnoreCase(DataStore.getInstance().requests.get(i).status)) {
                    selectedRow = i;
                    break;
                }
            }
        }

        if (selectedRow == -1) {
            JOptionPane.showMessageDialog(this, "Please select an emergency request from the table to coordinate.", "No Request Selected", JOptionPane.INFORMATION_MESSAGE);
            return;
        }

        Models.EmergencyRequest req = DataStore.getInstance().requests.get(selectedRow);
        AICoordinator.MatchResult result = AICoordinator.executeCoordination(req);
        refreshAllData();

        // Show decision dialog with step trace
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style='width:380px;font-family:sans-serif;'>");
        sb.append("<h3 style='color:").append(result.success ? "#10b981" : "#e11d48").append(";'>");
        sb.append(result.success ? "✓ Coordination Dispatch Successful" : "⚠️ Coordination Alert").append("</h3>");
        sb.append("<p><b>Action:</b> ").append(result.action).append("</p>");
        sb.append("<p>").append(result.message).append("</p><hr>");
        sb.append("<h4>Autonomous Execution Trace:</h4><ul>");
        for (String step : result.steps) {
            sb.append("<li style='font-size:11px;margin-bottom:3px;'>").append(step).append("</li>");
        }
        sb.append("</ul></body></html>");

        JOptionPane.showMessageDialog(this, sb.toString(), "AI Agent Coordination Result", JOptionPane.INFORMATION_MESSAGE);
    }

    private void handleToggleDonor() {
        int row = donorsTable.getSelectedRow();
        if (row != -1) {
            Models.Donor d = DataStore.getInstance().donors.get(row);
            d.isAvailable = !d.isAvailable;
            refreshAllData();
        } else {
            JOptionPane.showMessageDialog(this, "Select a donor from the table to toggle availability.");
        }
    }

    private void showNewRequestDialog() {
        JDialog dialog = new JDialog(this, "Post Emergency Blood Request", true);
        dialog.setSize(420, 340);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(new Color(15, 23, 42));
        dialog.setLayout(new GridLayout(5, 2, 10, 15));
        ((JPanel)dialog.getContentPane()).setBorder(new EmptyBorder(20, 20, 20, 20));

        String[] groups = {"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"};
        JComboBox<String> bgCombo = new JComboBox<>(groups);

        JSpinner unitsSpinner = new JSpinner(new SpinnerNumberModel(2, 1, 10, 1));

        String[] urgencies = {"CRITICAL", "HIGH"};
        JComboBox<String> urgCombo = new JComboBox<>(urgencies);

        JCheckBox autoCoordCheck = new JCheckBox("Auto-dispatch AI Agent immediately", true);
        autoCoordCheck.setOpaque(false);
        autoCoordCheck.setForeground(Color.WHITE);

        dialog.add(createDialogLabel("Blood Group:"));
        dialog.add(bgCombo);
        dialog.add(createDialogLabel("Units Required:"));
        dialog.add(unitsSpinner);
        dialog.add(createDialogLabel("Urgency Classification:"));
        dialog.add(urgCombo);
        dialog.add(createDialogLabel("Autonomous Action:"));
        dialog.add(autoCoordCheck);

        JButton cancelBtn = new JButton("Cancel");
        cancelBtn.addActionListener(e -> dialog.dispose());

        JButton submitBtn = new JButton("Broadcast Request");
        submitBtn.setBackground(new Color(225, 29, 72));
        submitBtn.setForeground(Color.WHITE);
        submitBtn.addActionListener(e -> {
            String bg = (String) bgCombo.getSelectedItem();
            int units = (Integer) unitsSpinner.getValue();
            String urg = (String) urgCombo.getSelectedItem();
            String id = "REQ-" + (int)(1000 + Math.random() * 9000);

            Models.EmergencyRequest req = new Models.EmergencyRequest(id, DataStore.getInstance().currentUser.name, bg, units, urg, "PENDING", "Unassigned");
            DataStore.getInstance().requests.add(0, req);

            if (autoCoordCheck.isSelected()) {
                AICoordinator.executeCoordination(req);
            }

            refreshAllData();
            dialog.dispose();
        });

        dialog.add(cancelBtn);
        dialog.add(submitBtn);
        dialog.setVisible(true);
    }

    private void showNewDonorDialog() {
        JDialog dialog = new JDialog(this, "Register Volunteer Blood Donor", true);
        dialog.setSize(420, 320);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(new Color(15, 23, 42));
        dialog.setLayout(new GridLayout(5, 2, 10, 15));
        ((JPanel)dialog.getContentPane()).setBorder(new EmptyBorder(20, 20, 20, 20));

        JTextField nameField = new JTextField("Dr. Wayne Campbell");
        JTextField emailField = new JTextField("wayne@example.com");
        JComboBox<String> bgCombo = new JComboBox<>(new String[]{"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"});
        JSpinner scoreSpinner = new JSpinner(new SpinnerNumberModel(9.5, 1.0, 10.0, 0.1));

        dialog.add(createDialogLabel("Full Name:"));
        dialog.add(nameField);
        dialog.add(createDialogLabel("Email:"));
        dialog.add(emailField);
        dialog.add(createDialogLabel("Blood Group:"));
        dialog.add(bgCombo);
        dialog.add(createDialogLabel("Reliability Score:"));
        dialog.add(scoreSpinner);

        JButton cancelBtn = new JButton("Cancel");
        cancelBtn.addActionListener(e -> dialog.dispose());

        JButton saveBtn = new JButton("Add to Radar");
        saveBtn.setBackground(new Color(225, 29, 72));
        saveBtn.setForeground(Color.WHITE);
        saveBtn.addActionListener(e -> {
            String name = nameField.getText().trim();
            String email = emailField.getText().trim();
            String bg = (String) bgCombo.getSelectedItem();
            double score = (Double) scoreSpinner.getValue();

            Models.Donor d = new Models.Donor("d-" + (int)(100 + Math.random() * 900), name, email, bg, 40.7180 + (Math.random() - 0.5) * 0.04, -74.0030 + (Math.random() - 0.5) * 0.04, score, true, true, 100);
            DataStore.getInstance().donors.add(0, d);
            refreshAllData();
            dialog.dispose();
        });

        dialog.add(cancelBtn);
        dialog.add(saveBtn);
        dialog.setVisible(true);
    }

    private JLabel createDialogLabel(String text) {
        JLabel l = new JLabel(text);
        l.setForeground(new Color(203, 213, 225));
        l.setFont(new Font("SansSerif", Font.BOLD, 12));
        return l;
    }
}
