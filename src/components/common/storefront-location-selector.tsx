import React, { useState, useMemo, useEffect } from "react";
import { Check, ChevronsUpDown, Globe, MapPin, Building, Plus, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCountries, useStates, useCities, useVerifyPincode } from "@/hooks/use-api";

interface StorefrontLocationSelectorProps {
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  onCountryChange: (country: string, countryCode: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onPincodeChange: (pincode: string) => void;
  disabled?: boolean;
}

export function StorefrontLocationSelector({
  country = "India",
  state = "",
  city = "",
  pincode = "",
  onCountryChange,
  onStateChange,
  onCityChange,
  onPincodeChange,
  disabled = false,
}: StorefrontLocationSelectorProps) {
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const { data: countries = [], isLoading: loadingCountries } = useCountries();

  const activeCountryCode = useMemo(() => {
    if (!country) return "IN";
    const match = countries.find(
      (c) =>
        c.countryName.toLowerCase() === country.toLowerCase() ||
        c.countryCode.toLowerCase() === country.toLowerCase(),
    );
    return match ? match.countryCode : "IN";
  }, [country, countries]);

  const { data: states = [], isLoading: loadingStates } = useStates(activeCountryCode);
  const { data: cities = [], isLoading: loadingCities } = useCities(activeCountryCode, state);

  // Live Pincode Verification
  const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
  const { data: pinVerification, isLoading: loadingPin } = useVerifyPincode(cleanPin);

  // Auto-populate or detect state mismatch
  useEffect(() => {
    if (activeCountryCode === "IN" && cleanPin.length === 6 && pinVerification?.valid && pinVerification.state) {
      if (!state) {
        onStateChange(pinVerification.state);
        if (!city && pinVerification.district) {
          onCityChange(pinVerification.district);
        }
      }
    }
  }, [cleanPin, pinVerification, state, city, activeCountryCode, onStateChange, onCityChange]);

  const stateMismatch = useMemo(() => {
    if (activeCountryCode !== "IN" || cleanPin.length !== 6 || !pinVerification?.valid || !pinVerification.state || !state) {
      return null;
    }
    const cleanCurrent = state.trim().toLowerCase();
    const cleanVerified = pinVerification.state.trim().toLowerCase();
    if (!cleanCurrent.includes(cleanVerified) && !cleanVerified.includes(cleanCurrent)) {
      return pinVerification.state;
    }
    return null;
  }, [activeCountryCode, cleanPin, pinVerification, state]);

  // State filtering
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return states;
    return states.filter(
      (s) => s.stateName.toLowerCase().includes(q) || (s.stateCode && s.stateCode.toLowerCase().includes(q)),
    );
  }, [states, stateSearch]);

  const exactStateMatch = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    return states.some((s) => s.stateName.toLowerCase() === q);
  }, [states, stateSearch]);

  // City filtering
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.cityName.toLowerCase().includes(q));
  }, [cities, citySearch]);

  const exactCityMatch = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    return cities.some((c) => c.cityName.toLowerCase() === q);
  }, [cities, citySearch]);

  const handleCountrySelect = (code: string) => {
    const c = countries.find((item) => item.countryCode === code);
    onCountryChange(c ? c.countryName : code, code);
    onStateChange("");
    onCityChange("");
  };

  const handleStateSelect = (selectedState: string) => {
    onStateChange(selectedState);
    onCityChange("");
    setStateOpen(false);
    setStateSearch("");
  };

  const handleCitySelect = (selectedCity: string) => {
    onCityChange(selectedCity);
    setCityOpen(false);
    setCitySearch("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3 w-3" /> Country
          </label>
          <Select
            disabled={disabled || loadingCountries}
            value={activeCountryCode}
            onValueChange={handleCountrySelect}
          >
            <SelectTrigger className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none bg-background focus:border-foreground">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {countries.length > 0 ? (
                countries.map((c) => (
                  <SelectItem key={c.countryCode} value={c.countryCode} className="text-xs">
                    {c.countryName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="IN" className="text-xs">
                  India
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* PIN Code with Live Verification */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {activeCountryCode === "IN" ? "PIN Code (6 digits)" : "Postal / Zip Code"}
            </label>
            {loadingPin && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Verifying...
              </span>
            )}
            {!loadingPin && cleanPin.length === 6 && pinVerification?.valid && !stateMismatch && (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Verified PIN
              </span>
            )}
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={activeCountryCode === "IN" ? 6 : 10}
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value)}
            placeholder={activeCountryCode === "IN" ? "e.g. 400013" : "Postal code"}
            className={cn(
              "w-full h-11 border px-3 text-xs rounded-sm outline-none font-mono transition-colors",
              stateMismatch
                ? "border-amber-500 focus:border-amber-600 bg-amber-50/20"
                : pinVerification && !pinVerification.valid && cleanPin.length === 6
                ? "border-destructive focus:border-destructive bg-destructive/5"
                : "border-border focus:border-foreground bg-background",
            )}
          />
          {/* Mismatch or invalid feedback */}
          {stateMismatch && (
            <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs text-[11px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 truncate">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>
                  PIN {cleanPin} is in <strong>{stateMismatch}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => onStateChange(stateMismatch)}
                className="text-[10px] font-semibold underline text-amber-800 shrink-0 hover:text-amber-950"
              >
                Switch State
              </button>
            </div>
          )}
          {!loadingPin && cleanPin.length === 6 && pinVerification && !pinVerification.valid && (
            <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> {pinVerification.message || "Invalid postal code"}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State Combobox */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> State / Province
          </label>
          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={stateOpen}
                disabled={disabled || loadingStates}
                className={cn(
                  "w-full h-11 justify-between text-xs font-normal border border-border px-3 rounded-sm bg-background hover:bg-secondary/20",
                  !state && "text-muted-foreground",
                )}
              >
                <span className="truncate">
                  {state || (loadingStates ? "Loading states..." : "Select State...")}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search state..."
                  value={stateSearch}
                  onValueChange={setStateSearch}
                  className="h-9 text-xs"
                />
                <CommandList className="max-h-[220px]">
                  {filteredStates.length === 0 && !stateSearch.trim() && (
                    <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
                      No states found.
                    </CommandEmpty>
                  )}
                  {filteredStates.length > 0 && (
                    <CommandGroup heading="Available States">
                      {filteredStates.map((s) => (
                        <CommandItem
                          key={s.stateName}
                          value={s.stateName}
                          onSelect={() => handleStateSelect(s.stateName)}
                          className="text-xs cursor-pointer flex items-center justify-between py-2"
                        >
                          <span className="truncate">{s.stateName}</span>
                          {state === s.stateName && <Check className="h-3.5 w-3.5 text-foreground" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {stateSearch.trim() && !exactStateMatch && (
                    <CommandGroup heading="Custom State">
                      <CommandItem
                        value={stateSearch.trim()}
                        onSelect={() => handleStateSelect(stateSearch.trim())}
                        className="text-xs cursor-pointer text-foreground font-medium py-2"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        Use "{stateSearch.trim()}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* City Combobox */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="h-3 w-3" /> City / District
          </label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                disabled={disabled || !state}
                className={cn(
                  "w-full h-11 justify-between text-xs font-normal border border-border px-3 rounded-sm bg-background hover:bg-secondary/20",
                  !city && "text-muted-foreground",
                  !state && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="truncate">
                  {city || (!state ? "Select state first" : loadingCities ? "Loading cities..." : "Select City...")}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search city..."
                  value={citySearch}
                  onValueChange={setCitySearch}
                  className="h-9 text-xs"
                />
                <CommandList className="max-h-[220px]">
                  {filteredCities.length === 0 && !citySearch.trim() && (
                    <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
                      No cities pre-listed. Type to add custom city.
                    </CommandEmpty>
                  )}
                  {filteredCities.length > 0 && (
                    <CommandGroup heading="Cities">
                      {filteredCities.map((c) => (
                        <CommandItem
                          key={`${c.stateName}-${c.cityName}`}
                          value={c.cityName}
                          onSelect={() => handleCitySelect(c.cityName)}
                          className="text-xs cursor-pointer flex items-center justify-between py-2"
                        >
                          <span className="truncate">{c.cityName}</span>
                          {city === c.cityName && <Check className="h-3.5 w-3.5 text-foreground" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {citySearch.trim() && !exactCityMatch && (
                    <CommandGroup heading="Custom City">
                      <CommandItem
                        value={citySearch.trim()}
                        onSelect={() => handleCitySelect(citySearch.trim())}
                        className="text-xs cursor-pointer text-foreground font-medium py-2"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        Use "{citySearch.trim()}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
