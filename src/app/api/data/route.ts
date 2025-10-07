// app/api/data/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

type AnyObj = Record<string, any>;

interface Patient {
  patient_id: number;
  patient_name: string;
  age: number;
  photo_url: string | null;
  contact: Array<{
    address: string | null;
    number: string | null;
    email: string | null;
  }>;
  medical_issue: string;
}

interface ApiResponse {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  data: Patient[];
  error?: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // Enhanced pagination parameters
    const page = Math.max(Number(params.get("page") ?? 1), 1);
    const limit = Math.max(Math.min(Number(params.get("limit") ?? 10), 100), 1); // Max 100 items per page
    const offset = Number(params.get("offset") ?? (page - 1) * limit);

    // Enhanced search parameters
    const search = (params.get("search") ?? "").toLowerCase().trim();
    const searchFields = params.get("searchFields")?.split(",") ?? [
      "patient_name",
      "medical_issue",
      "contact",
    ];
    const sortParam = params.get("sort") ?? "";
    const sortFields = params.get("sortFields")?.split(",") ?? [];

    // Collect filters: any param except reserved ones
    const reserved = new Set([
      "page",
      "limit",
      "offset",
      "search",
      "searchFields",
      "sort",
      "sortFields",
    ]);
    const filters: Record<string, string[]> = {};
    for (const [k, v] of params.entries()) {
      if (!reserved.has(k)) {
        if (!filters[k]) filters[k] = [];
        filters[k].push(v);
      }
    }

    const filePath = path.join(process.cwd(), "data", "data.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const allData: Patient[] = JSON.parse(raw);

    // Enhanced search functionality
    let filtered = allData.filter((item) => {
      // Multi-field search
      if (search) {
        let matched = false;
        for (const field of searchFields) {
          if (field === "contact") {
            // Search in contact fields (address, number, email)
            if (item.contact && Array.isArray(item.contact)) {
              for (const contact of item.contact) {
                if (
                  contact.address?.toLowerCase().includes(search) ||
                  contact.number?.includes(search) ||
                  contact.email?.toLowerCase().includes(search)
                ) {
                  matched = true;
                  break;
                }
              }
            }
          } else if (field in item) {
            const val = item[field as keyof Patient];
            if (typeof val === "string" && val.toLowerCase().includes(search)) {
              matched = true;
              break;
            }
            if (typeof val === "number" && String(val).includes(search)) {
              matched = true;
              break;
            }
          }
        }
        if (!matched) return false;
      }

      // Enhanced filtering - support multiple values for same field
      for (const [key, values] of Object.entries(filters)) {
        if (!values.length) continue;

        if (key === "medical_issue") {
          if (
            !values.some(
              (val) => item.medical_issue.toLowerCase() === val.toLowerCase()
            )
          ) {
            return false;
          }
        } else if (key === "age_range") {
          // Support age range filtering (e.g., "18-30", "65+")
          const ageMatch = values.some((range) => {
            if (range.includes("-")) {
              const [min, max] = range.split("-").map(Number);
              return item.age >= min && item.age <= max;
            } else if (range.endsWith("+")) {
              const min = Number(range.slice(0, -1));
              return item.age >= min;
            }
            return false;
          });
          if (!ageMatch) return false;
        } else if (key in item) {
          const val = item[key as keyof Patient];
          if (
            !values.some(
              (filterVal) =>
                String(val).toLowerCase() === String(filterVal).toLowerCase()
            )
          ) {
            return false;
          }
        }
      }

      return true;
    });

    // Enhanced sorting with multiple fields
    if (sortParam) {
      const [field, dir = "asc"] = sortParam.split(":");
      filtered.sort((a, b) => {
        const av = a[field as keyof Patient];
        const bv = b[field as keyof Patient];

        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;

        if (typeof av === "number" && typeof bv === "number") {
          return dir === "desc" ? bv - av : av - bv;
        }
        const sa = String(av).localeCompare(String(bv));
        return dir === "desc" ? -sa : sa;
      });
    }

    // Calculate pagination info
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = Math.min(offset, total);
    const end = Math.min(start + limit, total);
    const data = filtered.slice(start, end);

    const response: ApiResponse = {
      total,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalPages,
      data,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error:", error);

    // Enhanced error handling
    const errorResponse: ApiResponse = {
      total: 0,
      page: 1,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 0,
      data: [],
      error: error instanceof Error ? error.message : "Internal Server Error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
