"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Filter } from "lucide-react";

interface FilterBarProps {
    filters: {
        position?: string;
        job_opening?: string;
        domain?: string;
    };
    options: {
        positions: string[];
        jobOpenings: string[];
        domains: string[];
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export function FilterBar({
    filters,
    options,
    onFilterChange,
    onClearFilters,
}: FilterBarProps) {
    const hasActiveFilters = filters.position || filters.job_opening || filters.domain;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Filters</h3>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Position Filter */}
                <Select
                    value={filters.position || "all"}
                    onValueChange={(val) => onFilterChange("position", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black z-50">
                        <SelectItem value="all">All Positions</SelectItem>
                        {options.positions && options.positions.length > 0 ? (
                            options.positions.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">No positions</div>
                        )}
                    </SelectContent>
                </Select>

                {/* Job Opening Filter */}
                <Select
                    value={filters.job_opening || "all"}
                    onValueChange={(val) => onFilterChange("job_opening", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Job Opening" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black z-50">
                        <SelectItem value="all">All Jobs</SelectItem>
                        {options.jobOpenings && options.jobOpenings.length > 0 ? (
                            options.jobOpenings.map((j) => (
                                <SelectItem key={j} value={j}>
                                    {j}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">No jobs</div>
                        )}
                    </SelectContent>
                </Select>

                {/* Domain Filter */}
                <Select
                    value={filters.domain || "all"}
                    onValueChange={(val) => onFilterChange("domain", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black z-50">
                        <SelectItem value="all">All Domains</SelectItem>
                        {options.domains && options.domains.length > 0 ? (
                            options.domains.map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d}
                                </SelectItem>
                            ))
                        ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">No domains</div>
                        )}
                    </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-auto md:ml-0"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
