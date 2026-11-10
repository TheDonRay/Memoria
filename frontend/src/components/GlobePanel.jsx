// COMPONENT: Dotted Globe behind of the home and login
// USED BY: login and ghome page. 

import globe from '../assets/globe.png'

export default function GlobePanel({ children, className = '' }) {
    return (
        <section className={`relative overflow-hidden bg-night text-print ${className}`}>
            {/* The globe picture fills the panel and gets cropped in order to fit */ }
            <img
                src={globe}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                />
                {/* a soft dark fade on the left so the headline stays easy to read */}
                <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/20 to-transparent" />

                { /* everything inside the panel sits above the picture */}
                <div className="relative z-10 flex w-full flex-1 flex-col p-6 md:p-12">
                    {children}
                </div>
        </section>
    )
}