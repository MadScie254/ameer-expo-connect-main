import { supabaseAdmin } from "./src/lib/supabase-server";

async function seed() {
  console.log("Seeding mock attendees into DB...");

  const mockUsers = [
    {
      id: "00000000-0000-4000-a000-000000000001",
      email: "sarah.jenkins@technova.com",
      first_name: "Sarah",
      last_name: "Jenkins",
      company: "TechNova Solutions",
      job_title: "Product Manager",
      industry: "Technology",
      bio: "Looking to connect with startup founders and investors in the SaaS space.",
      is_public: true,
    },
    {
      id: "00000000-0000-4000-a000-000000000002",
      email: "ahmed.sayed@globallogistics.com",
      first_name: "Ahmed",
      last_name: "Al-Sayed",
      company: "Global Logistics Ltd",
      job_title: "Director of Operations",
      industry: "Logistics",
      bio: "Interested in supply chain innovations and B2B trade partnerships.",
      is_public: true,
    },
    {
      id: "00000000-0000-4000-a000-000000000003",
      email: "grace.o@agrigrow.ke",
      first_name: "Grace",
      last_name: "Odinga",
      company: "AgriGrow Kenya",
      job_title: "CEO",
      industry: "Agriculture",
      bio: "Scaling sustainable farming solutions. Seeking agritech partnerships.",
      is_public: true,
    }
  ];

  for (const u of mockUsers) {
    const { error: insertErr } = await supabaseAdmin.from("profiles").upsert(u);
    if (insertErr) {
      console.error("Error inserting", u.first_name, insertErr);
    } else {
      console.log("Inserted", u.first_name);
    }
  }
  console.log("Done.");
}

seed().catch(console.error);
