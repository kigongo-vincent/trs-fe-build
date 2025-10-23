"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2 } from "lucide-react"

export interface SearchableSelectOption {
    value: string
    label: string
    description?: string
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    loading?: boolean
    emptyMessage?: string
    className?: string
    onSearch?: (query: string) => void
    searchValue?: string
    onSearchValueChange?: (value: string) => void
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    disabled = false,
    loading = false,
    emptyMessage = "No options found.",
    className,
    onSearch,
    searchValue = "",
    onSearchValueChange,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [internalSearchValue, setInternalSearchValue] = React.useState("")

    const selectedOption = options.find((option) => option.value === value)

    const handleSearch = (query: string) => {
        if (onSearchValueChange) {
            onSearchValueChange(query)
        } else {
            setInternalSearchValue(query)
        }

        if (onSearch) {
            onSearch(query)
        }
    }

    const currentSearchValue = onSearchValueChange ? searchValue : internalSearchValue

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between",
                        !selectedOption && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : selectedOption ? (
                        <div className="flex flex-col items-start">
                            <span>{selectedOption.label}</span>
                            {selectedOption.description && (
                                <span className="text-xs text-muted-foreground">
                                    {selectedOption.description}
                                </span>
                            )}
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        value={currentSearchValue}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading ? (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span>Searching...</span>
                                </div>
                            ) : (
                                <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                                    {emptyMessage}
                                </div>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        {option.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
