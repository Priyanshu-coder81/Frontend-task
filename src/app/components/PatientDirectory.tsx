"use client";

import {  useCallback, useEffect, useRef, useState } from "react";

import { IoIosSearch } from "react-icons/io";


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

  
interface FilterState {
    medical_issue: string[];
    age_range: string[];
  }

export default function PatientDirectory() {
    const [data, setData] = useState<Patient[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterState>({
    medical_issue: [],
    age_range: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

      const handleSort = (field: string) => {
        if (sortField === field) {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          setSortField(field);
          setSortDirection("asc");
        }
      };

  
  const addFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: [...prev[type], value],
    }));
    setPage(1);
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((f) => f !== value),
    }));
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      medical_issue: [],
      age_range: [],
    });
    setPage(1);
  };

  const getActiveFiltersCount = () => {
    return filters.medical_issue.length + filters.age_range.length;
  };

  const getActiveFilters = () => {
    return [...filters.medical_issue, ...filters.age_range];
  };

  return (
    <div className=' min-h-screen bg-white'>
    {/* Header Section */}
      <div
        className='bg-blue-600 relative overflow-hidden
      '
      >
        <div
          className='absolute right-[-15%] top-0 h-full lg:w-[60%] md:w-[80%]  bg-no-repeat bg-contain'
          style={{ backgroundImage: "url('/bg-image.png')" }}
        ></div>
        <div className='absolute inset-0 opacity-10'></div>
        <div className=' px-6 py-6'>
          <h1 className='md:text-4xl text-3xl font-bold text-white/80 mb-2'>
            Patient Directory
          </h1>
          <p className='text-white/80 text-lg'>{total} Patient Found</p>
        </div>
      </div>

{/* Hero Section */}
<div className="px-8 py-6"> 

    {/* Table view Button (future--> to add card view) */}
    <div className="flex gap-8 mb-6">
        <button className={`pb-2 text-lg font-medium border-b-2 transition-colors text-black border-blue-600`}>
            Table View
        </button>
    </div>



{/* Search and filter bar */}

<div className='mb-4'>
          <div className='flex flex-col lg:flex-row lg:items-center gap-4 mb-3 text-black'>
            <div className='relative flex-1'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <IoIosSearch className="text-xl text-blue-600"/>
              </div>
              <input
                type='text'
                placeholder='Search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-black/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-600 '
              />
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className='flex items-center gap-2 px-3 py-2 border border-black/80 rounded-lg text-sm hover:bg-gray-50'
              >
                <svg
                  className='h-4 w-4 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z'
                  />
                </svg>
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className='bg-blue-500 text-black text-xs px-2 py-0.5 rounded-full'>
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              <div className='flex items-center gap-2'>
                <span className='text-sm text-black hidden sm:inline'>
                  Sort:
                </span>
                <select
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value);
                    setSortDirection("asc");
                  }}
                  className='border border-black rounded px-3 py-1 text-sm'
                >
                  <option value=''>None</option>
                  <option value='patient_name'>Name</option>
                  <option value='age'>Age</option>
                  <option value='medical_issue'>Medical Issue</option>
                </select>
                {sortField && (
                  <button
                    onClick={() => handleSort(sortField)}
                    className='border border-black rounded px-2 py-1 text-sm flex items-center gap-1 hover:bg-gray-50'
                    title={`Sort ${
                      sortDirection === "asc" ? "descending" : "ascending"
                    }`}
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                      />
                    </svg>
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </button>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-sm text-black hidden sm:inline'>
                  Per page:
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className='border border-black rounded px-2 py-1 text-sm'
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Medical Issue
                  </label>
                  <div className='space-y-1 max-h-32 overflow-y-auto text-black'>
                    {[
                      "fever",
                      "headache",
                      "sore throat",
                      "sprained ankle",
                      "rash",
                      "ear infection",
                      "sinusitis",
                      "allergic reaction",
                    ].map((issue) => (
                      <label key={issue} className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={filters.medical_issue.includes(issue)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFilter("medical_issue", issue);
                            } else {
                              removeFilter("medical_issue", issue);
                            }
                          }}
                          className='mr-2'
                        />
                        <span className='text-sm capitalize'>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Age Range
                  </label>
                  <div className='space-y-1 text-black'>
                    {[
                      { label: "0-18", value: "0-18" },
                      { label: "19-30", value: "19-30" },
                      { label: "31-50", value: "31-50" },
                      { label: "51-65", value: "51-65" },
                      { label: "65+", value: "65+" },
                    ].map((range) => (
                      <label key={range.value} className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={filters.age_range.includes(range.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addFilter("age_range", range.value);
                            } else {
                              removeFilter("age_range", range.value);
                            }
                          }}
                          className='mr-2'
                        />
                        <span className='text-sm'>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='flex items-end'>
                  <button
                    onClick={clearAllFilters}
                    className='w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applied Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className='flex flex-wrap gap-2 mb-4'>
              {getActiveFilters().map((filter) => (
                <span
                  key={filter}
                  className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                >
                  {filter}
                  <button
                    onClick={() => {
                      if (filters.medical_issue.includes(filter)) {
                        removeFilter("medical_issue", filter);
                      } else {
                        removeFilter("age_range", filter);
                      }
                    }}
                    className='ml-1 hover:text-blue-600 '
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      
</div>
    </div>
  );
}
