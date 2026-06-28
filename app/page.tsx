import HeroSection from "@/components/hero-section";
import Features from "@/components/features-3";
import Agenda from "@/components/agenda";
import CallToAction from "@/components/call-to-action";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { SpectrumStats } from "@/components/SpectrumStats";

export default function Home() {
    return (
        <>
            <HeroSection/>
            <FeaturedEvents/>
            <SpectrumStats/>
            <Features/>
            <Agenda/>
            <CallToAction/>
        </>
    )
}
