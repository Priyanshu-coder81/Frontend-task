"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IoIosSearch } from "react-icons/io";
import { CiFilter } from "react-icons/ci";

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

const getMedicalIssueColor = (issue: string) => {
  const colors: Record<string, string> = {
    fever: "bg-red-500",
    headache: "bg-orange-500",
    "sore throat": "bg-orange-500",
    "sprained ankle": "bg-green-500",
    rash: "bg-pink-500",
    "ear infection": "bg-blue-400",
    sinusitis: "bg-purple-500",
    "allergic reaction": "bg-yellow-500",
  };
  return colors[issue.toLowerCase()] || "bg-gray-500";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function PatientDirectory() {
  const [data, setData] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      searchFields: "patient_name,medical_issue,contact",
      ...(sortField && { sort: `${sortField}:${sortDirection}` }),
    });

    // Add filters as query parameters
    Object.entries(filters).forEach(([key, values]) => {
      values.forEach((value: string) => {
        params.append(key, value);
      });
    });

    try {
      const res = await fetch(`/api/data?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: ApiResponse = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      setData(json.data);
      setTotal(json.total);
      setHasNextPage(json.hasNextPage);
      setHasPrevPage(json.hasPrevPage);
      setTotalPages(json.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setData([]);
      setTotal(0);
      setHasNextPage(false);
      setHasPrevPage(false);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortField, sortDirection, filters]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Other effects
  useEffect(() => {
    fetchData();
  }, [page, limit, sortField, sortDirection, filters]);

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
      <div className='px-8 py-6'>
        {/* Table view Button (future--> to add card view) */}
        <div className='flex gap-8 mb-6'>
          <button
            className={`pb-2 text-lg font-medium border-b-2 transition-colors text-black border-blue-600`}
          >
            Table View
          </button>
        </div>

        {/* Search and filter bar */}

        <div className='mb-4'>
          <div className='flex flex-col lg:flex-row lg:items-center gap-4 mb-3 text-black'>
            <div className='relative flex-1'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <IoIosSearch className='text-xl text-blue-600' />
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
                <CiFilter className='text-xl' />
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

        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <span className='ml-3 text-gray-600'>Loading patients...</span>
          </div>
        ) : data.length === 0 ? (
          <div className='text-center py-12'>
            <svg
              className='mx-auto h-12 w-12 text-black'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No patients found
            </h3>
            <p className='mt-1 text-sm text-black'>
              {search || getActiveFiltersCount() > 0
                ? "Try adjusting your search or filters"
                : "No patient data available"}
            </p>
          </div>
        ) : (
          <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-full divide-y divide-gray-600'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                      ID
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider hidden sm:table-cell'>
                      Age
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider'>
                      Medical Issue
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider hidden lg:table-cell'>
                      Address
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider hidden md:table-cell'>
                      Phone
                    </th>
                    <th className='px-3 lg:px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider hidden lg:table-cell'>
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {data.map((patient) => (
                    <tr key={patient.patient_id} className='hover:bg-gray-50'>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ID-{String(patient.patient_id).padStart(4, "0")}
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10'>
                            <div className='h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs lg:text-sm'>
                              {getInitials(patient.patient_name)}
                            </div>
                          </div>
                          <div className='ml-2 lg:ml-4'>
                            <div className='text-sm font-medium text-gray-900 truncate'>
                              {patient.patient_name}
                            </div>
                            <div className='text-xs text-black sm:hidden'>
                              Age: {patient.age} |{" "}
                              {patient.contact[0]?.number || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell'>
                        {patient.age}
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() =>
                            addFilter("medical_issue", patient.medical_issue)
                          }
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white hover:opacity-80 transition-opacity ${getMedicalIssueColor(
                            patient.medical_issue
                          )}`}
                        >
                          <span className='truncate max-w-20'>
                            {patient.medical_issue}
                          </span>
                        </button>
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell'>
                        <span
                          className=' block max-w-32'
                          title={patient.contact[0]?.address || "N/A"}
                        >
                          {patient.contact[0]?.address || "N/A"}
                        </span>
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell'>
                        {patient.contact[0]?.number || "N/A"}
                      </td>
                      <td className='px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell'>
                        <span
                          className=' block max-w-32'
                          title={patient.contact[0]?.email || "N/A"}
                        >
                          {patient.contact[0]?.email || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
            <div className='text-sm text-gray-700'>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} patients
            </div>

            <div className='flex items-center gap-2'>
              <button
                disabled={!hasPrevPage}
                onClick={() => setPage(page - 1)}
                className='md:px-3 px-1 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={!hasNextPage}
                onClick={() => setPage(page + 1)}
                className='md:px-3 px-2 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
