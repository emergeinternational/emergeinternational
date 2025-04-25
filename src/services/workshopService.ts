import { supabase } from "@/integrations/supabase/client";

export interface Workshop {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  spots?: number;
  is_archived: boolean;
  registration_link?: string;
  created_at: string;
  updated_at: string;
}

// Static fallback data for upcoming workshops
const fallbackUpcomingWorkshops: Workshop[] = [
  {
    id: "1",
    name: "Fashion Design Bootcamp",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    location: "Emerge Creative Hub, Addis Ababa",
    description: "An intensive three-day bootcamp covering the essentials of fashion design including sketching, pattern making, and garment construction.",
    spots: 15,
    is_archived: false,
    registration_link: "https://emergeaddis.com/bootcamp-registration",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sustainable Textiles Workshop",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    location: "Green Fashion Center, Addis Ababa",
    description: "Learn about sustainable textile sourcing, eco-friendly dyeing techniques, and responsible production methods.",
    spots: 20,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Digital Fashion Marketing",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    location: "Tech Hub, Addis Ababa",
    description: "Master the art of marketing fashion products online through social media, email marketing, and digital advertising.",
    spots: 25,
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Static fallback data for archived workshops
const fallbackArchivedWorkshops: Workshop[] = [
  {
    id: "4",
    name: "Fashion Photography Basics",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    location: "Creative Studio, Addis Ababa",
    description: "A hands-on workshop covering the fundamentals of fashion photography including lighting, composition, and post-processing.",
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Business of Fashion",
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 months ago
    location: "Enterprise Center, Addis Ababa",
    description: "Learn the business side of fashion including pricing strategies, production planning, and retail distribution.",
    is_archived: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const getWorkshops = async (showArchived: boolean = false): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('is_archived', showArchived)
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching workshops:", error);
      return showArchived ? fallbackArchivedWorkshops : fallbackUpcomingWorkshops;
    }

    return data || (showArchived ? fallbackArchivedWorkshops : fallbackUpcomingWorkshops);
  } catch (error) {
    console.error("Unexpected error in getWorkshops:", error);
    return showArchived ? fallbackArchivedWorkshops : fallbackUpcomingWorkshops;
  }
};

export const getArchivedWorkshops = async (): Promise<Workshop[]> => {
  return getWorkshops(true);
};
