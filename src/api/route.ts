import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

type AnyObj = Record<string,any>;

export async function GET(req : Request) {

    try {
        const url = new URL(req.url);
        const params = url.searchParams;

        const page = Math.max(Number(params.get("page")?? 1),1);
        const limit =Math.max(Number(params.get("limit")?? 10),1);
        const search = (params.get("search") ?? "").toLowerCase();

        const sortParam = params.get("sort") ?? "";

        const reserved = new Set(["page","limit","search","sort"]);

        const filters: Record<string,string> = {};

        for(const [k,v] of params.entries()) {
            if(!reserved.has(k)) filters[k] = v;
        }

        const filePath = path.join(process.cwd(), "data","data.json");
        const raw = await fs.readFile(filePath,"utf-8");
        const allData: AnyObj[] = JSON.parse(raw);

        // Apply Search
        let filtered = allData.filter((item) => {

            if(search) {
                let matched = false;
                for(const key in item) {
                    const val = item[key];
                    if(typeof val === 'string' && val.toLowerCase().includes(search)) {
                        matched = true;
                        break;
                    }

                    if(typeof val === 'number' && String(val).includes(search)) {
                        matched = true;
                        break;
                    }

                }
                if(!matched) return false;
            }

            // Filters : key  = value
            for(const key in filters) {
                const val = filters[key];
                if(item[key] == null) return false;
                if(String(item[key]).toLowerCase() !== String(val).toLowerCase()) 
                    return false;
            }
            return true;
        });

         // Sorting
        if (sortParam) {
        const [field, dir = "asc"] = sortParam.split(":");
        filtered.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
  
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
  
      // Pagination
      const total = filtered.length;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);
  
      return NextResponse.json({ total, page, limit, data });
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  