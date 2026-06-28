'use client';

import HeroSection from "@/components/hero-section";
import Features from "@/components/features-3";
import Agenda from "@/components/agenda";
import CallToAction from "@/components/call-to-action";
import { EventsSection } from "@/components/EventsSection";

export default function Home() {
    return (
        <>
            <HeroSection/>
            <Features/>
            <Agenda/>
            <EventsSection/>
            <CallToAction/>
        </>
    )
}
