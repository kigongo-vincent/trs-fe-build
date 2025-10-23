"use client"

import * as React from "react"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { getConsultantsPaginated, type Consultant } from "@/services/consultants"
import { toast } from "sonner"

interface ConsultantSearchableSelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    departmentId?: string
}

export function ConsultantSearchableSelect({
    value,
    onValueChange,
    placeholder = "Select consultant...",
    disabled = false,
    className,
    departmentId,
}: ConsultantSearchableSelectProps) {
    const [options, setOptions] = React.useState<SearchableSelectOption[]>([])
    const [loading, setLoading] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")
    const [hasSearched, setHasSearched] = React.useState(false)

    // Convert consultants to options format
    const convertConsultantsToOptions = (consultants: Consultant[]): SearchableSelectOption[] => {
        return consultants.map((consultant) => ({
            value: consultant.id,
            label: consultant.fullName,
            description: consultant.email,
        }))
    }

    // Search consultants with debouncing
    const searchConsultants = React.useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setOptions([])
                setHasSearched(false)
                return
            }

            setLoading(true)
            try {
                const params: {
                    page?: number
                    limit?: number
                    search?: string
                    departmentId?: string
                } = {
                    page: 1,
                    limit: 20, // Limit results for better performance
                    search: query.trim(),
                }

                if (departmentId) {
                    params.departmentId = departmentId
                }

                const response = await getConsultantsPaginated(params)

                if (response.status === 200) {
                    const consultantOptions = convertConsultantsToOptions(response.data.items)
                    setOptions(consultantOptions)
                    setHasSearched(true)
                } else {
                    toast.error("Failed to search consultants")
                    setOptions([])
                }
            } catch (error) {
                console.error("Error searching consultants:", error)
                toast.error("An error occurred while searching consultants")
                setOptions([])
            } finally {
                setLoading(false)
            }
        },
        [departmentId]
    )

    // Debounced search effect
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchConsultants(searchValue)
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchValue, searchConsultants])

    // Load initial options if value is provided but no search has been done
    React.useEffect(() => {
        if (value && !hasSearched && options.length === 0) {
            // If we have a selected value but no options loaded, we need to find the consultant
            // This could be optimized by storing the consultant data when it's first selected
            searchConsultants("") // This will load some initial results
        }
    }, [value, hasSearched, options.length, searchConsultants])

    const handleSearch = (query: string) => {
        setSearchValue(query)
    }

    const emptyMessage = hasSearched
        ? "No consultants found matching your search."
        : "Type to search for consultants..."

    return (
        <SearchableSelect
            options={options}
            value={value}
            onValueChange={onValueChange}
            placeholder={placeholder}
            disabled={disabled}
            loading={loading}
            emptyMessage={emptyMessage}
            className={className}
            onSearch={handleSearch}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
        />
    )
}
