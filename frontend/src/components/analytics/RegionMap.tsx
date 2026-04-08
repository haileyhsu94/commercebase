import React, { useState } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { scaleLinear } from "d3-scale"
import { regionRevenueDistribution } from "@/lib/mock-data"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export function RegionMap() {
  const [tooltipData, setTooltipData] = useState<{ name: string; revenue: number } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const colorScale = scaleLinear<string>()
    .domain([0, 16000])
    .range(["#f1f5f9", "#0ea5e9"]) // slate-100 to sky-500

  const revenueData = React.useMemo(() => {
    const dataMap: Record<string, number> = {}
    regionRevenueDistribution.forEach((d) => {
      dataMap[d.name] = d.revenue
    })
    return dataMap
  }, [])

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center bg-transparent overflow-hidden rounded-md">
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 160 }}>
        <ZoomableGroup zoom={1} maxZoom={4} minZoom={1}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name
              const value = revenueData[stateName]

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={value ? colorScale(value) : "#f1f5f9"}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  onMouseEnter={() => {
                    if (value) {
                      setTooltipData({ name: stateName, revenue: value })
                    }
                  }}
                  onMouseMove={(e) => {
                    if (value) {
                      setTooltipPos({ x: e.clientX, y: e.clientY })
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltipData(null)
                  }}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { outline: "none", fill: "#0369a1", transition: "all 250ms" },
                    pressed: { outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Floating Tooltip */}
      {tooltipData && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 mt-4 ml-4"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          <div className="font-semibold">{tooltipData.name}</div>
          <div>${tooltipData.revenue.toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}
