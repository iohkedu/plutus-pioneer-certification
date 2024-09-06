import React, { ReactNode } from "react";

export const TextContainer = ({ scrollable, children }: { scrollable?: boolean, children: ReactNode }) => {
    return (
        <div className={`w-[664px] bg-zinc-50 border border-zinc-600 rounded-xl p-9 my-3 text-black ${scrollable ? 'overflow-auto' : ''}`}>
            {children}
        </div>
    );
};
