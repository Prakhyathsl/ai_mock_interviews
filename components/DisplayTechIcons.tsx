"use client";
import React, { useEffect, useState } from 'react'
import {cn, getTechLogos} from "@/lib/utils";
import Image from "next/image";

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    const [techIcons, setTechIcons] = useState<Array<{ tech: string; url: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTechIcons = async () => {
            try {
                const icons = await getTechLogos(techStack);
                setTechIcons(icons);
            } catch (error) {
                console.error('Error loading tech icons:', error);
                // Fallback to default icons if fetch fails
                setTechIcons(techStack.slice(0, 3).map(tech => ({ tech, url: '/tech.svg' })));
            } finally {
                setIsLoading(false);
            }
        };

        loadTechIcons();
    }, [techStack]);

    if (isLoading) {
        return (
            <div className="flex flex-row gap-2">
                {techStack.slice(0, 3).map((tech) => (
                    <div key={tech} className="relative group bg-dark-300 rounded-full p-2 flex-center size-9 animate-pulse">
                        <div className="size-5 bg-dark-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-row">{techIcons.slice(0,
            3).map(({ tech, url }, index) => (
                <div key={tech} className={cn("relative group bg-dark-300 rounded-full p-2 flex-center", index >=1 && '-ml-3')}>
                    <span className="tech-tooltip">{tech}</span>
                    <Image src={url} alt={tech} width={100} height={100} className="size-5" />
                </div>
        ))}</div>
    )
}
export default DisplayTechIcons
