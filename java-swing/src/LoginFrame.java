package bloodsys;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class LoginFrame extends JFrame {

    private JTextField emailField;
    private JPasswordField passField;
    private JLabel statusLabel;

    public LoginFrame() {
        setTitle("Agentic AI Blood System - Portal Authentication");
        setSize(820, 560);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        getContentPane().setBackground(new Color(11, 15, 23));

        initUI();
    }

    private void initUI() {
        setLayout(new BorderLayout());

        // Header Banner
        JPanel headerPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 20, 15));
        headerPanel.setBackground(new Color(15, 23, 42));
        headerPanel.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, new Color(255, 255, 255, 25)));

        JLabel titleLabel = new JLabel("✚ Agentic AI Blood Coordination System");
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 18));
        titleLabel.setForeground(new Color(244, 63, 94));
        headerPanel.add(titleLabel);

        add(headerPanel, BorderLayout.NORTH);

        // Center Split: Left = Role Switcher, Right = Form
        JPanel centerPanel = new JPanel(new GridLayout(1, 2, 20, 0));
        centerPanel.setOpaque(false);
        centerPanel.setBorder(new EmptyBorder(25, 25, 25, 25));

        // Left: Preset Roles
        JPanel leftPanel = new JPanel();
        leftPanel.setLayout(new BoxLayout(leftPanel, BoxLayout.Y_AXIS));
        leftPanel.setBackground(new Color(15, 23, 42));
        leftPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(255, 255, 255, 20), 1),
            new EmptyBorder(20, 20, 20, 20)
        ));

        JLabel leftTitle = new JLabel("1-Click Preset Roles");
        leftTitle.setFont(new Font("SansSerif", Font.BOLD, 16));
        leftTitle.setForeground(Color.WHITE);
        leftPanel.add(leftTitle);

        JLabel leftSub = new JLabel("<html><body style='width:240px;color:#94a3b8;'>Select any authorized role to test its live workflow and coordination interface:</body></html>");
        leftSub.setFont(new Font("SansSerif", Font.PLAIN, 12));
        leftSub.setBorder(new EmptyBorder(5, 0, 15, 0));
        leftPanel.add(leftSub);

        String[][] roles = {
            {"🏥 Hospital Emergency", "cityhospital@bloodsys.com", "HOSPITAL"},
            {"🩸 Active Donor (O-)", "alex.rivera@example.com", "DONOR"},
            {"🏦 Central Blood Bank", "centralbank@bloodsys.com", "BLOOD_BANK"},
            {"🛡️ System Admin", "admin@bloodsys.com", "ADMIN"}
        };

        for (String[] r : roles) {
            JButton roleBtn = new JButton("<html><b>" + r[0] + "</b><br><font color='#94a3b8' size='2'>" + r[1] + "</font></html>");
            roleBtn.setAlignmentX(Component.LEFT_ALIGNMENT);
            roleBtn.setMaximumSize(new Dimension(320, 50));
            roleBtn.setBackground(new Color(30, 41, 59));
            roleBtn.setForeground(Color.WHITE);
            roleBtn.setFocusPainted(false);
            roleBtn.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(225, 29, 72, 60), 1),
                new EmptyBorder(8, 10, 8, 10)
            ));
            roleBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));

            roleBtn.addActionListener(e -> {
                emailField.setText(r[1]);
                passField.setText("password123");
                statusLabel.setText("Selected " + r[2] + " role.");
                statusLabel.setForeground(new Color(52, 211, 153));
            });

            leftPanel.add(roleBtn);
            leftPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        }

        centerPanel.add(leftPanel);

        // Right: Sign In Form
        JPanel rightPanel = new JPanel();
        rightPanel.setLayout(new BoxLayout(rightPanel, BoxLayout.Y_AXIS));
        rightPanel.setBackground(new Color(15, 23, 42));
        rightPanel.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(225, 29, 72, 80), 1),
            new EmptyBorder(25, 25, 25, 25)
        ));

        JLabel loginTitle = new JLabel("Portal Sign In");
        loginTitle.setFont(new Font("SansSerif", Font.BOLD, 18));
        loginTitle.setForeground(Color.WHITE);
        rightPanel.add(loginTitle);

        JLabel loginSub = new JLabel("Authorized personnel security checkpoint");
        loginSub.setFont(new Font("SansSerif", Font.PLAIN, 12));
        loginSub.setForeground(new Color(148, 163, 184));
        loginSub.setBorder(new EmptyBorder(5, 0, 20, 0));
        rightPanel.add(loginSub);

        // Email Label & Input
        JLabel emailLbl = new JLabel("Account Email:");
        emailLbl.setFont(new Font("SansSerif", Font.BOLD, 12));
        emailLbl.setForeground(new Color(203, 213, 225));
        rightPanel.add(emailLbl);

        emailField = new JTextField("cityhospital@bloodsys.com");
        emailField.setMaximumSize(new Dimension(320, 35));
        emailField.setBackground(new Color(17, 24, 39));
        emailField.setForeground(Color.WHITE);
        emailField.setCaretColor(Color.WHITE);
        emailField.setFont(new Font("SansSerif", Font.PLAIN, 13));
        emailField.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
            new EmptyBorder(5, 8, 5, 8)
        ));
        rightPanel.add(emailField);

        rightPanel.add(Box.createRigidArea(new Dimension(0, 15)));

        // Password Label & Input
        JLabel passLbl = new JLabel("Password:");
        passLbl.setFont(new Font("SansSerif", Font.BOLD, 12));
        passLbl.setForeground(new Color(203, 213, 225));
        rightPanel.add(passLbl);

        passField = new JPasswordField("password123");
        passField.setMaximumSize(new Dimension(320, 35));
        passField.setBackground(new Color(17, 24, 39));
        passField.setForeground(Color.WHITE);
        passField.setCaretColor(Color.WHITE);
        passField.setFont(new Font("SansSerif", Font.PLAIN, 13));
        passField.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(51, 65, 85), 1),
            new EmptyBorder(5, 8, 5, 8)
        ));
        rightPanel.add(passField);

        JLabel hintLbl = new JLabel("Demo Password: password123");
        hintLbl.setFont(new Font("SansSerif", Font.ITALIC, 11));
        hintLbl.setForeground(new Color(100, 116, 139));
        hintLbl.setBorder(new EmptyBorder(3, 0, 15, 0));
        rightPanel.add(hintLbl);

        // Sign In Button
        JButton signInBtn = new JButton("Enter Coordination Dashboard →");
        signInBtn.setMaximumSize(new Dimension(320, 42));
        signInBtn.setBackground(new Color(225, 29, 72));
        signInBtn.setForeground(Color.WHITE);
        signInBtn.setFont(new Font("SansSerif", Font.BOLD, 13));
        signInBtn.setFocusPainted(false);
        signInBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        signInBtn.setBorder(new EmptyBorder(10, 15, 10, 15));

        signInBtn.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleLogin();
            }
        });

        rightPanel.add(signInBtn);

        statusLabel = new JLabel(" ");
        statusLabel.setFont(new Font("SansSerif", Font.PLAIN, 11));
        statusLabel.setBorder(new EmptyBorder(10, 0, 0, 0));
        rightPanel.add(statusLabel);

        centerPanel.add(rightPanel);
        add(centerPanel, BorderLayout.CENTER);
    }

    private void handleLogin() {
        String email = emailField.getText().trim();
        String pass = new String(passField.getPassword()).trim();

        if (email.isEmpty() || pass.isEmpty()) {
            statusLabel.setText("Please enter both email and password.");
            statusLabel.setForeground(new Color(244, 63, 94));
            return;
        }

        // Determine user identity
        DataStore store = DataStore.getInstance();
        if (email.contains("hospital")) {
            store.currentUser = new Models.User("usr-hosp", "City Central Hospital", email, "HOSPITAL", 40.7128, -74.0060);
        } else if (email.contains("alex") || email.contains("donor")) {
            store.currentUser = new Models.User("usr-donor", "Alex Rivera (Universal Donor)", email, "DONOR", 40.7180, -74.0030);
        } else if (email.contains("bank")) {
            store.currentUser = new Models.User("usr-bank", "Central Metro Blood Bank", email, "BLOOD_BANK", 40.7138, -74.0070);
        } else {
            store.currentUser = new Models.User("usr-admin", "System Administrator", email, "ADMIN", 40.7128, -74.0060);
        }

        // Open DashboardFrame
        SwingUtilities.invokeLater(() -> {
            new DashboardFrame().setVisible(true);
            dispose();
        });
    }
}
