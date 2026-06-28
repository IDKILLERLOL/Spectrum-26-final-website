import {TextEffect} from "@/components/motion-primitives/text-effect";
import React from "react";
import {transitionVariants} from "@/lib/utils";
import {AnimatedGroup} from "@/components/motion-primitives/animated-group";

export default function Agenda() {
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:grid-cols-[1fr_auto]">
                    <div className="text-center lg:text-left">
                        <TextEffect
                            triggerOnView
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="mb-4 text-3xl font-semibold md:text-4xl">
                            Agenda
                        </TextEffect>
                    </div>

                    <AnimatedGroup
                        triggerOnView
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
                                    },
                                },
                            },
                            ...transitionVariants,
                        }}
                        className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0"
                    >
                        <div className="pb-6">
                            <div className="font-medium space-x-2">
                                <span className='text-muted-foreground font-mono '>08:00</span>
                                <span>Opening Ceremony</span>
                            </div>
                            <p className="text-muted-foreground mt-4">Inaugural speech and welcome to Spectrum 26. Meet the organizers and sponsors.</p>
                        </div>
                        <div className="py-6">
                            <div className="font-medium space-x-2">
                                <span className='text-muted-foreground font-mono '>09:00</span>
                                <span>Keynote Address</span>
                            </div>
                            <p className="text-muted-foreground mt-4">Industry leaders share insights on technology and innovation trends.</p>
                        </div>
                        <div className="py-6">
                            <div className="font-medium space-x-2">
                                <span className='text-muted-foreground font-mono '>10:00</span>
                                <span>Events Begin</span>
                            </div>
                            <p className="text-muted-foreground mt-4">Code sprints, design challenges, and cultural performances simultaneously across venues.</p>
                        </div>
                        <div className="py-6">
                            <div className="font-medium space-x-2">
                                <span className='text-muted-foreground font-mono '>17:00</span>
                                <span>Closing & Award Ceremony</span>
                            </div>
                            <p className="text-muted-foreground mt-4">Prize distribution, announcements, and celebration with the entire community.</p>
                        </div>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
