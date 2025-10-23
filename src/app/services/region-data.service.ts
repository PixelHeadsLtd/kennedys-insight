import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class RegionDataService {
    readonly palette: Record<string, string> = {
        "orange-100": "rgb(255, 106, 0)", // Asia Pacific
        "green-100": "rgb(0, 177, 64)", // EMEA
        "yellow-100": "rgb(255, 184, 28)", // LATAM
        "red-100": "rgb(213, 0, 50)", // North America
        "blue-100": "rgb(0, 163, 224)", // United Kingdom
    };

    readonly regionNameByCode: Record<string, string> = {
        AP: "Asia Pacific",
        E: "Europe, Middle East & Africa",
        LA: "Latin America & the Caribbean",
        NA: "North America",
        UK: "United Kingdom",
    };

    readonly classByRegionName: Record<string, string> = {
        "Asia Pacific": "orange-100",
        "Europe, Middle East & Africa": "green-100",
        "Latin America & the Caribbean": "yellow-100",
        "North America": "red-100",
        "United Kingdom": "blue-100",
    };

    regions = [
        {
            id: "canada",
            name: "Canada",
            region: "North America",
            pulseColor: "border-red-2",
            markerBgColor: "bg-red-100",
            flag: "ca",
            isDashvertical: true,
            markerIsHollow: true,
            elementColor: "red-100",
            linkColor: "red-100-hover",
            tooltipPosition: "right",
            cities: [
                "Calgary",
                "Guelph",
                "Kelowna",
                "Toronto",
                "Vancouver",
            ],
            layout: {
                align: "align-right",
                dash: "dash-vertical",
            },
        },
        {
            id: "usa",
            name: "United States",
            region: "North America",
            pulseColor: "border-red-2",
            markerBgColor: "bg-red-100",
            flag: "us",
            isDashvertical: true,
            elementColor: "red-100",
            linkColor: "red-100-hover",
            tooltipPosition: "left",
            cities: [
                "Austin",
                "Chicago",
                "Fort Lauderdale",
                "Houston",
                "Los Angeles",
                "Miami",
                "New Jersey",
                "New York",
                "Philadelphia",
                "San Francisco",
                "Seattle",
                "Wilmington",
            ],
            layout: {
                align: "align-left",
                dash: "dash-vertical",
            },
        },
        {
            id: "uk",
            name: "All UK Regions",
            region: "United Kingdom",
            pulseColor: "border-blue-2",
            markerBgColor: "bg-blue-100",
            flag: "gb",
            isDashvertical: true,
            elementColor: "blue-100",
            linkColor: "blue-100-hover",
            tooltipPosition: "right",
            cities: [
                "Belfast",
                "Birmingham",
                "Bristol",
                "Cambridge",
                "Chelmsford",
                "Edinburgh",
                "Glasgow",
                "Leeds",
                "London",
                "Manchester",
                "Newcastle",
                "Sheffield",
                "Taunton",
            ],
            layout: {
                align: "align-right",
                dash: "dash-vertical",
            },
        },
        {
            id: "belgium",
            name: "Belgium",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "be",
            isDashvertical: true,
            markerIsHollow: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            cities: ["Brussels"],
            layout: {
                align: "align-left",
                dash: "dash-vertical",
            },
        },
        {
            id: "norway",
            name: "Norway",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "no",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Oslo"],
            layout: {
                align: "align-left",
                dash: "dash-angled",
            },
        },
        {
            id: "denmark",
            name: "Denmark",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "dk",
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Copenhagen"],
            layout: {
                align: "align-left",
                dash: "dash-angled",
            },
        },
        {
            id: "sweden",
            name: "Sweden",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "se",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Stockholm"],
            layout: {
                align: "align-left",
                dash: "dash-angled",
            },
        },
        {
            id: "poland",
            name: "Poland",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "pl",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Warsaw"],
            layout: {
                align: "align-left",
                dash: "dash-angled",
            },
        },
        {
            id: "china",
            name: "China",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "cn",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [
                "Bejing",
                "Guangzhou",
                "Haikou",
                "Nanjing",
                "Shanghai",
                "Shenzhen",
                "Xiamen",
            ],
            layout: {
                align: "align-left",
                dash: "dash-angled flipped",
            },
        },
        {
            id: "hongkong",
            name: "Hong Kong",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "hk",
            isDashHorizontal: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [""],
            layout: {
                align: "align-left",
                dash: "dash-horizontal",
            },
        },
        {
            id: "singapore",
            name: "Singapore",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "sg",
            isDashHorizontal: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [""],
            layout: {
                align: "align-left",
                dash: "dash-horizontal",
            },
        },
        {
            id: "newzealand",
            name: "New Zealand",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "nz",
            isDashvertical: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Auckland", "Wellington"],
            layout: {
                align: "align-left",
                dash: "dash-vertical",
            },
        },
        {
            id: "australia",
            name: "Australia",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "au",
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Brisbane", "Melbourne", "Perth", "Sydney"],
            layout: {
                align: "align-right",
                dash: "dash-angled-solo",
            },
        },
        {
            id: "mexico",
            name: "Mexico",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "mx",
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Mexico City"],
            layout: {
                align: "align-right",
                dash: "dash-angled dash-angled-rightangle flipped",
            },
        },
        {
            id: "guatemala",
            name: "Guatemala",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "gt",
            isDashHorizontal: true,
            markerIsHollow: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: [""],
            layout: {
                align: "align-right",
                dash: "dash-horizontal flipped",
            },
        },
        {
            id: "colombia",
            name: "Colombia",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "co",
            isDashHorizontal: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Bogotá"],
            layout: {
                align: "align-right",
                dash: "dash-horizontal flipped",
            },
        },
        {
            id: "ecuador",
            name: "Ecuador",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "ec",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Quito"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "peru",
            name: "Peru",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "pe",
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Lima"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "bolivia",
            name: "Bolivia",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "bo",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["La Paz"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "chile",
            name: "Chile",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "cl",
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".5vw",
            cities: ["Santiago"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "ireland",
            name: "Ireland",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "ie",
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Dublin"],
            layout: {
                align: "align-right",
                dash: "dash-angled dash-angled-rightangle rotated",
            },
        },
        {
            id: "france",
            name: "France",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "fr",
            isDashHorizontal: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Paris"],
            layout: {
                align: "align-right",
                dash: "dash-horizontal flipped",
            },
        },
        {
            id: "spain",
            name: "Spain",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "es",
            isDashHorizontal: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Madrid"],
            layout: {
                align: "align-right",
                dash: "dash-horizontal flipped",
            },
        },
        {
            id: "italy",
            name: "Italy",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "it",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Florence", "Milan", "Rome"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
                {
            id: "bermuda",
            name: "Bermuda",
            region: "North America",
            pulseColor: "border-red-2",
            markerBgColor: "bg-red-100",
            flag: "bm",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "red-100",
            linkColor: "red-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            layout: {
                align: "align-left",
                dash: "dash-angled",
            },
        },
        {
            id: "dominican",
            name: "Dominican Republic",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "do",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [""],
            layout: {
                align: "align-left",
                dash: "dash-angled dash-angled-rightangle flipped",
            },
        },
        {
            id: "puertorico",
            name: "Puerto Rico",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "pr",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [""],
            layout: {
                align: "align-left",
                dash: "dash-angled dash-angled-rightangle flipped",
            },
        },
        {
            id: "panama",
            name: "Panama",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "pa",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: [""],
            layout: {
                align: "align-left",
                dash: "dash-angled dash-angled-rightangle flipped",
            },
        },
        {
            id: "brazil",
            name: "Brazil",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "br",
            isDashAngled: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["São Paulo"],
            layout: {
                align: "align-left",
                dash: "dash-angled dash-angled-rightangle flipped",
            },
        },
        {
            id: "argentina",
            name: "Argentina",
            region: "Latin America & the Caribbean",
            pulseColor: "border-yellow-2",
            markerBgColor: "bg-yellow-100",
            flag: "ar",
            markerIsHollow: true,
            isDashHorizontal: true,
            elementColor: "yellow-100",
            linkColor: "yellow-100-hover",
            tooltipPosition: "right",
            tooltipOffsetX: "-.5vw",
            cities: ["Buenos Aires"],
            layout: {
                align: "align-left",
                dash: "dash-horizontal",
            },
        },
        {
            id: "turkey",
            name: "Turkey",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "tr",
            markerIsHollow: true,
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Istanbul"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "israel",
            name: "Israel",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "il",
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Tel Aviv"],
            layout: {
                align: "align-right",
                dash: "dash-angled flipped-x-and-y",
            },
        },
        {
            id: "oman",
            name: "Oman",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "om",
            isDashvertical: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Muscat"],
            layout: {
                align: "align-right",
                dash: "dash-vertical flipped",
            },
        },
        {
            id: "uae",
            name: "UAE",
            region: "Europe, Middle East & Africa",
            pulseColor: "border-green-2",
            markerBgColor: "bg-green-100",
            flag: "ae",
            isDashAngled: true,
            elementColor: "green-100",
            linkColor: "green-100-hover",
            tooltipPosition: "left",
            tooltipOffsetX: ".9vw",
            cities: ["Dubai"],
            layout: {
                align: "align-right",
                dash: "dash-angled dash-angled-rightangle hanging",
            },
        },
        {
            id: "pakistan",
            name: "Pakistan",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "pk",
            markerIsHollow: true,
            isDashvertical: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "left",
            cities: ["Karachi"],
            layout: {
                align: "align-left",
                dash: "dash-vertical flipped",
            },
        },
        {
            id: "india",
            name: "India",
            region: "Asia Pacific",
            pulseColor: "border-orange-2",
            markerBgColor: "bg-orange-100",
            flag: "in",
            markerIsHollow: true,
            isDashvertical: true,
            elementColor: "orange-100",
            linkColor: "orange-100-hover",
            tooltipPosition: "left",
            cities: ["Mumbai", "New Delhi"],
            layout: {
                align: "align-left",
                dash: "dash-vertical flipped",
            },
        },
    ];

    private readonly MATTER_URL = "/KennedysWorldMapAPI/MatterData";
    private readonly MATTER_TTL_MS = 60_000; // 1 min cache
    private _matterCache: { data: any[]; fetchedAt: number } | null = null;
    private _inFlight: Promise<any[]> | null = null;

    private async fetchWithRetry(url: string, retries = 2): Promise<any[]> {
        let lastErr: any;
        for (let i = 0; i <= retries; i++) {
            try {
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                const json = await res.json();
                return Array.isArray(json) ? json : [];
            } catch (e) {
                lastErr = e;
                const backoff = (i + 1) * 400;
                console.warn(
                    `[MatterData] try ${
                        i + 1
                    } failed, retrying in ${backoff}ms`,
                    e
                );
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
        console.error("[MatterData] all retries failed:", lastErr);
        throw lastErr;
    }

    /** Returns last good data, retrying on failure. Falls back to cache (if any). */
    async getMatterData(force = false): Promise<any[]> {
        const now = Date.now();
        if (
            !force &&
            this._matterCache &&
            now - this._matterCache.fetchedAt < this.MATTER_TTL_MS
        ) {
            return this._matterCache.data;
        }
        if (this._inFlight) return this._inFlight;

        this._inFlight = this.fetchWithRetry(this.MATTER_URL, 2)
            .then((data) => {
                this._matterCache = { data, fetchedAt: Date.now() };
                this._inFlight = null;
                return data;
            })
            .catch((err) => {
                this._inFlight = null;
                console.warn("[MatterData] serving cached data after error.");
                return this._matterCache ? this._matterCache.data : [];
            });

        return this._inFlight;
    }

    getRegions() {
        return this.regions;
    }

    colorFromClass(cls?: string) {
        return (cls && this.palette[cls]) || "#808080";
    }
    colorFromRegionName(name: string) {
        return this.colorFromClass(this.classByRegionName[name]);
    }

    getRegionBy(key: string) {
        const k = (key || "").toLowerCase();
        return this.regions.find(
            (r) => r.id === k || r.name.toLowerCase() === k
        );
    }

    clearMattersCounts() {
        this.regions = this.regions.map(r => ({
            ...r,
            mattersCount: undefined
        }));
    }

}
