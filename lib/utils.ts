import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
    const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
    return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok; // Returns true if the icon exists
    } catch {
        return false;
    }
};

export const getTechLogos = async (techArray: string[]) => {
    const logoURLs = techArray.map((tech) => {
        const normalized = normalizeTechName(tech);
        return {
            tech,
            url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
        };
    });

    const results = await Promise.all(
        logoURLs.map(async ({ tech, url }) => ({
            tech,
            url: (await checkIconExists(url)) ? url : "/tech.svg",
        }))
    );

    return results;
};

// Deterministic cover selection based on interviewId to prevent hydration mismatches
export const getInterviewCover = (interviewId?: string) => {
    // Fallback to a default value if interviewId is not provided
    const seed = interviewId || 'default';
    
    // Simple hash function to convert interviewId to a consistent index
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % interviewCovers.length;
    return `/covers${interviewCovers[index]}`;
};

// Keep the old function for backward compatibility, but make it deterministic
export const getRandomInterviewCover = (seed?: string) => {
    if (seed) {
        return getInterviewCover(seed);
    }
    // Fallback: use a deterministic value based on current date (day-level, not millisecond)
    const today = new Date();
    const daySeed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    return getInterviewCover(daySeed);
};