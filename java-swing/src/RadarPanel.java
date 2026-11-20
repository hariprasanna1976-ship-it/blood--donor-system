package bloodsys;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.List;

public class RadarPanel extends JPanel {
    private double sweepAngle = 0;
    private Timer timer;

    public RadarPanel() {
        setPreferredSize(new Dimension(500, 380));
        setBackground(new Color(8, 12, 20));

        // Radar animation sweep timer (30 FPS)
        timer = new Timer(33, new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                sweepAngle += 0.04;
                if (sweepAngle > Math.PI * 2) {
                    sweepAngle = 0;
                }
                repaint();
            }
        });
        timer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();
        int cx = w / 2;
        int cy = h / 2;
        int maxRadius = Math.min(w, h) / 2 - 30;

        // Radial Background Gradient
        RadialGradientPaint bgPaint = new RadialGradientPaint(
            new Point(cx, cy), Math.max(10, maxRadius + 30),
            new float[]{0.0f, 0.7f, 1.0f},
            new Color[]{new Color(14, 25, 48), new Color(9, 14, 26), new Color(6, 9, 16)}
        );
        g2.setPaint(bgPaint);
        g2.fillRect(0, 0, w, h);

        // Concentric Range Rings
        g2.setStroke(new BasicStroke(1.2f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, new float[]{4, 4}, 0));
        g2.setColor(new Color(56, 189, 248, 60));

        int[] ringRadii = {maxRadius / 3, (maxRadius * 2) / 3, maxRadius};
        String[] labels = {"5 km", "10 km", "15 km"};

        for (int i = 0; i < ringRadii.length; i++) {
            int r = ringRadii[i];
            g2.drawOval(cx - r, cy - r, r * 2, r * 2);
            g2.setFont(new Font("SansSerif", Font.BOLD, 10));
            g2.setColor(new Color(148, 163, 184, 180));
            g2.drawString(labels[i], cx + 6, cy - r + 12);
            g2.setColor(new Color(56, 189, 248, 60));
        }

        // Crosshairs
        g2.drawLine(cx, cy - maxRadius, cx, cy + maxRadius);
        g2.drawLine(cx - maxRadius, cy, cx + maxRadius, cy);

        // Radar Sweep Cone
        Polygon sweepCone = new Polygon();
        sweepCone.addPoint(cx, cy);
        int sweepLength = maxRadius;
        int arcSteps = 12;
        double coneWidth = Math.PI / 4; // 45 degrees
        for (int i = 0; i <= arcSteps; i++) {
            double a = (sweepAngle - coneWidth) + (coneWidth * (i / (double) arcSteps));
            sweepCone.addPoint(
                (int) (cx + Math.cos(a) * sweepLength),
                (int) (cy + Math.sin(a) * sweepLength)
            );
        }
        g2.setPaint(new Color(225, 29, 72, 45));
        g2.fillPolygon(sweepCone);

        // Sweep Leading Line
        g2.setStroke(new BasicStroke(1.8f));
        g2.setColor(new Color(244, 63, 94, 190));
        g2.drawLine(cx, cy, (int)(cx + Math.cos(sweepAngle) * maxRadius), (int)(cy + Math.sin(sweepAngle) * maxRadius));

        // Draw Center Hospital
        g2.setColor(new Color(225, 29, 72));
        g2.fillOval(cx - 14, cy - 14, 28, 28);
        g2.setColor(Color.WHITE);
        g2.setStroke(new BasicStroke(2.0f));
        g2.drawOval(cx - 14, cy - 14, 28, 28);
        g2.fillRect(cx - 2, cy - 8, 4, 16);
        g2.fillRect(cx - 8, cy - 2, 16, 4);

        g2.setFont(new Font("SansSerif", Font.BOLD, 11));
        g2.setColor(new Color(254, 205, 211));
        g2.drawString("Hospital Core", cx - 35, cy + 24);

        // Draw Donors
        List<Models.Donor> donors = DataStore.getInstance().donors;
        for (int i = 0; i < donors.size(); i++) {
            Models.Donor d = donors.get(i);
            double angle = (i * (Math.PI * 2 / Math.max(1, donors.size()))) + 0.3;
            double distR = (maxRadius * 0.35) + ((i % 3) * (maxRadius * 0.28));
            int dx = (int) (cx + Math.cos(angle) * distR);
            int dy = (int) (cy + Math.sin(angle) * distR);

            // Donor Point
            if (d.isAvailable) {
                g2.setColor(new Color(16, 185, 129));
                g2.fillOval(dx - 8, dy - 8, 16, 16);
                g2.setColor(new Color(16, 185, 129, 100));
                g2.drawOval(dx - 12, dy - 12, 24, 24);
            } else {
                g2.setColor(new Color(100, 116, 139));
                g2.fillOval(dx - 7, dy - 7, 14, 14);
            }

            g2.setColor(Color.WHITE);
            g2.fillOval(dx - 3, dy - 3, 6, 6);

            // Label
            g2.setFont(new Font("SansSerif", Font.BOLD, 10));
            String tag = d.bloodGroup + " • " + d.name.split(" ")[0];
            int strW = g2.getFontMetrics().stringWidth(tag);

            g2.setColor(new Color(15, 23, 42, 210));
            g2.fillRoundRect(dx - strW / 2 - 4, dy + 10, strW + 8, 16, 4, 4);

            g2.setColor(d.isAvailable ? new Color(167, 243, 208) : new Color(148, 163, 184));
            g2.drawString(tag, dx - strW / 2, dy + 22);
        }
    }
}
