import { createClient } from "../lib/supabase-server";
import HomeClient, { Race } from "./components/HomeClient";

// Force dynamic behavior since we check the date for NEXT race
export const dynamic = 'force-dynamic';

async function getNextRace(): Promise<Race | null> {
  const supabase = await createClient();
  const today = new Date().toISOString();
  
  try {
    const { data } = await supabase
      .from("races")
      .select("*")
      .gt("race_time", today)
      .order("race_time", { ascending: true })
      .limit(1);

    if (data && data.length > 0) {
      return data[0];
    } else {
      // Fallback to first race of season
      const { data: allRaces } = await supabase
        .from("races")
        .select("*")
        .order("race_time", { ascending: true })
        .limit(1);
      
      if (allRaces && allRaces.length > 0) {
        return allRaces[0];
      }
    }
  } catch (error) {
    console.error("Server Fetch Error:", error);
    return null;
  }
  return null;
}

export default async function Home() {
  const nextRace = await getNextRace();

  return <HomeClient initialNextRace={nextRace} />;
}