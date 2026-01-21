import React, { createContext, useContext, useState } from "react";
import { useSharedValue, withSpring } from "react-native-reanimated";

interface SidebarContextType {
    isOpen: boolean;
    toggleSidebar: () => void;
    progress: any; // SharedValue<number>
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const progress = useSharedValue(0);

    const toggleSidebar = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        progress.value = withSpring(nextState ? 1 : 0, {
            damping: 15,
            stiffness: 120,
            mass: 0.8,
            velocity: 1
        });
    };

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, progress }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};
