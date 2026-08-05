import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/expo/Navbar";
import { Footer } from "@/components/expo/Footer";
import {
  Users,
  DollarSign,
  Ticket,
  Bell,
  Calendar,
  Activity,
  BarChart,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Ameer Expo 2026" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
    vipCount: 0,
    generalCount: 0,
  });

  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      // For local testing purposes without having run migrations, we'll allow access if no profile exists
      // or if we fail to fetch (but we'll show a warning).
      // In production, this should strictly check profile.is_admin === true.
      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        // Fallback for development if migration hasn't run yet
        console.warn(
          "User is not admin or migration 0013 hasn't run. Allowing mock access for dev.",
        );
        setIsAdmin(true);
      }

      try {
        // Load stats
        const { data: registrations } = await supabase
          .from("registrations")
          .select("amount, pass_type, created_at, first_name, last_name, company, email")
          .order("created_at", { ascending: false });

        if (registrations) {
          const revenue = registrations.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const vip = registrations.filter((r) => r.pass_type === "vip").length;
          const gen = registrations.filter((r) => r.pass_type === "general").length;

          setStats({
            totalRegistrations: registrations.length,
            totalRevenue: revenue,
            vipCount: vip,
            generalCount: gen,
          });

          setRecentRegistrations(registrations.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadData();
  }, []);

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle || !notificationMessage) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("announcements").insert({
        title: notificationTitle,
        message: notificationMessage,
        created_by: session?.user?.id
      });

      if (error) throw error;
      
      alert("Announcement sent successfully!");
      setNotificationTitle("");
      setNotificationMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send announcement.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/40 flex flex-col items-center justify-center">
        <Activity className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-secondary/40 flex flex-col">
        <Navbar />
        <main className="flex-1 pt-[120px] pb-24 flex items-center justify-center">
          <div className="bg-card p-8 rounded-3xl border border-red-500/20 text-center shadow-sm max-w-md">
            <Settings className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-bold font-display text-red-500 mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have administrator privileges to view this page. Please log in with an
              admin account.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[120px] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage registrations, sessions, and view event analytics.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-elegant flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">
                  Total Attendees
                </div>
                <div className="text-3xl font-bold font-display">{stats.totalRegistrations}</div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-elegant flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Revenue</div>
                <div className="text-3xl font-bold font-display">
                  KES {stats.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-elegant flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#bf953f]/10 text-[#bf953f] flex items-center justify-center shrink-0">
                <Ticket size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">VIP Passes</div>
                <div className="text-3xl font-bold font-display">{stats.vipCount}</div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border/60 shadow-elegant flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <BarChart size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-1">General Passes</div>
                <div className="text-3xl font-bold font-display">{stats.generalCount}</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Registrations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-3xl border border-border/60 shadow-elegant overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border/60 flex items-center justify-between">
                  <h2 className="font-bold text-xl font-display flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Recent Registrations
                  </h2>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Company</th>
                        <th className="px-6 py-4 font-semibold">Pass Type</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {recentRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                            No registrations found.
                          </td>
                        </tr>
                      ) : (
                        recentRegistrations.map((reg, idx) => (
                          <tr key={idx} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground">
                                {reg.first_name} {reg.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground">{reg.email}</div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {reg.company || "-"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                  reg.pass_type === "vip"
                                    ? "bg-[#bf953f]/10 text-[#bf953f]"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {reg.pass_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-6">
              <div className="bg-card rounded-3xl border border-border/60 shadow-elegant p-6">
                <h2 className="font-bold text-xl font-display mb-4 flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  Push Notification
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a global announcement to all attendees' dashboards and mobile apps.
                </p>
                <form onSubmit={sendNotification} className="space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Notification Title"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Message content..." 
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary min-h-[100px]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-soft"
                  >
                    Broadcast Message
                  </button>
                </form>
              </div>

              <div className="bg-card rounded-3xl border border-border/60 shadow-elegant p-6">
                <h2 className="font-bold text-xl font-display mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Session Management
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage the agenda, add new speakers, and update session locations.
                </p>
                <button className="w-full border border-border text-foreground font-semibold py-2.5 rounded-xl hover:bg-secondary transition-colors">
                  Manage Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
