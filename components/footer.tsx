import Link from 'next/link'
import V0Icon from "@/components/icons/v0-icon";
import React from "react";

const links = [
    {
        title: 'About',
        href: '#about',
    },
    {
        title: 'Events',
        href: '#events',
    },
    {
        title: 'Schedule',
        href: '#agenda',
    },
    {
        title: 'Contact',
        href: '#contact',
    },
]

export default function FooterSection() {
    return (
        <footer className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <Link
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit">
                    <V0Icon size={30} className='text-foreground'/>
                </Link>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>
                <span className="text-muted-foreground block text-center text-sm font-mono">© 2026 Spectrum Festival. A student tech and culture celebration • <Link
                    href="https://v0.dev"
                    className="text-foreground underline">Built with v0</Link></span>
            </div>
        </footer>
    )
}
