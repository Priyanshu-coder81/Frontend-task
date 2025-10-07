"use client";

import {  useState } from "react";

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


export default function PatientDirectory() {
  const [total, setTotal] = useState(0);

  return (
    <div className=' min-h-screen bg-white'>
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
      
    </div>
  );
}
