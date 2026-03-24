import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  sportTypeLabel,
} from "./strava";

describe("Strava formatting helpers", () => {
  it("formatDistance converts metres to km for distances >= 1000m", () => {
    expect(formatDistance(52400)).toBe("52.4 km");
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(89500)).toBe("89.5 km");
  });

  it("formatDistance shows metres for distances < 1000m", () => {
    expect(formatDistance(500)).toBe("500 m");
    expect(formatDistance(0)).toBe("0 m");
  });

  it("formatDuration formats seconds into hours and minutes", () => {
    expect(formatDuration(3600)).toBe("1h 0m");
    expect(formatDuration(3661)).toBe("1h 1m");
    expect(formatDuration(2091)).toBe("34m");
    expect(formatDuration(60)).toBe("1m");
  });

  it("formatElevation rounds metres to nearest integer", () => {
    expect(formatElevation(122.7)).toBe("123 m");
    expect(formatElevation(0)).toBe("0 m");
    expect(formatElevation(1005.98)).toBe("1006 m");
  });

  it("sportTypeLabel maps known sport types to human-readable labels", () => {
    expect(sportTypeLabel("Ride")).toBe("Road Ride");
    expect(sportTypeLabel("MountainBikeRide")).toBe("MTB Ride");
    expect(sportTypeLabel("GravelRide")).toBe("Gravel Ride");
    expect(sportTypeLabel("VirtualRide")).toBe("Virtual Ride");
    expect(sportTypeLabel("Run")).toBe("Run");
  });

  it("sportTypeLabel returns the original string for unknown types", () => {
    expect(sportTypeLabel("Kayaking")).toBe("Kayaking");
    expect(sportTypeLabel("")).toBe("");
  });
});
