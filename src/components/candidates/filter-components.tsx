"use client";

/**
 * Advanced filtering components for /candidates page.
 * - LocationSearch: debounced text input for fuzzy location matching
 * - ExperienceSlider: dual-range slider for experience (0–30+)
 * - RelocationToggle: switch to show only candidates willing to relocate
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Plane } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────────
// LocationSearch — Debounced Input
// ────────────────────────────────────────────────────────────────────────────────
interface LocationSearchProps {
    value: string;
    onChange: (value: string) => void;
    delay?: number;
}

export function LocationSearch({ value, onChange, delay = 400 }: LocationSearchProps) {
    const [local, setLocal] = useState(value);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Sync external → local when parent resets
    useEffect(() => {
        setLocal(value);
    }, [value]);

    const handleChange = useCallback(
        (val: string) => {
            setLocal(val);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => onChange(val), delay);
        },
        [onChange, delay]
    );

    // Cleanup on unmount
    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <div className="relative flex-1 min-w-[160px]">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
                placeholder="Filter by location..."
                className="pl-9 h-9 text-sm"
                value={local}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────────
// ExperienceSlider — Dual Range (0–30)
// ────────────────────────────────────────────────────────────────────────────────
interface ExperienceSliderProps {
    min: number;
    max: number;
    onChange: (min: number, max: number) => void;
}

const EXP_MAX = 30;

export function ExperienceSlider({ min, max, onChange }: ExperienceSliderProps) {
    const [localMin, setLocalMin] = useState(min);
    const [localMax, setLocalMax] = useState(max);

    useEffect(() => {
        setLocalMin(min);
        setLocalMax(max);
    }, [min, max]);

    const commitChange = useCallback(
        (newMin: number, newMax: number) => {
            onChange(newMin, newMax);
        },
        [onChange]
    );

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.min(Number(e.target.value), localMax);
        setLocalMin(val);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(Number(e.target.value), localMin);
        setLocalMax(val);
    };

    const handleMouseUp = () => {
        commitChange(localMin, localMax);
    };

    // Calculate track fill percentages
    const minPercent = (localMin / EXP_MAX) * 100;
    const maxPercent = (localMax / EXP_MAX) * 100;

    return (
        <div className="min-w-[200px]">
            <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-xs font-medium text-text-muted">Experience</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
                    {localMin}–{localMax === EXP_MAX ? "30+" : localMax} yrs
                </Badge>
            </div>

            {/* Dual range track */}
            <div className="relative h-5 flex items-center">
                {/* Track background */}
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
                {/* Active range fill */}
                <div
                    className="absolute h-1.5 bg-accent rounded-full"
                    style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                />
                {/* Min thumb */}
                <input
                    type="range"
                    min={0}
                    max={EXP_MAX}
                    value={localMin}
                    onChange={handleMinChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: localMin > EXP_MAX - 5 ? 5 : 3 }}
                />
                {/* Max thumb */}
                <input
                    type="range"
                    min={0}
                    max={EXP_MAX}
                    value={localMax}
                    onChange={handleMaxChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                    style={{ zIndex: 4 }}
                />
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────────
// RelocationToggle
// ────────────────────────────────────────────────────────────────────────────────
interface RelocationToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function RelocationToggle({ checked, onChange }: RelocationToggleProps) {
    return (
        <Button
            variant={checked ? "default" : "outline"}
            size="sm"
            className={`h-9 text-xs gap-1.5 transition-all ${checked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                : "text-text-muted hover:text-emerald-600 hover:border-emerald-300"
                }`}
            onClick={() => onChange(!checked)}
        >
            <Plane className="h-3.5 w-3.5" />
            Open to Relocate
        </Button>
    );
}
