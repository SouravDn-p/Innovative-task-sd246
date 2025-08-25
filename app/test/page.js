// import Image from "next/image";
// import React from "react";

// const CollaborationSection = () => {
//   return (
//     <section className="relative isolate overflow-hidden bg-[#0a1b3d] text-white">
//       {/* ---- TOP ARC (white overlay) ---- */}
//       <div
//         className="
//           pointer-events-none absolute inset-x-0
//           -top-[120px]  h-[220px]  md:-top-[160px] md:h-[260px]
//           z-0 bg-white
//         "
//         style={{
//           clipPath: "ellipse(120% 100% at 50% 0%)",
//         }}
//       />

//       {/* ---- CONTENT ---- */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40 flex flex-col md:flex-row items-center justify-between gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <h1 className="text-4xl md:text-6xl font-bold mb-6">
//             Advanced Tech, In Your Corner
//           </h1>
//           <p className="text-lg md:text-xl mb-8">
//             InteroBOT® emulates search engine crawlers, enabling our digital
//             marketing team to view your site just as search engines would.
//           </p>
//           <button className="bg-orange-600 hover:bg-orange-700 text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-lg">
//             See More
//           </button>
//         </div>

//         <div className="flex-1 flex justify-center md:justify-end">
//           <div className="relative w-80 md:w-[28rem]">
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Monitor"
//               className="absolute -top-6 -left-6 w-full h-auto rounded-xl shadow-xl opacity-80"
//             />
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Data Visualization"
//               className="relative w-full h-auto rounded-xl shadow-2xl z-10"
//             />
//           </div>
//         </div>
//       </div>

//       {/* ---- BOTTOM ARC (white overlay) ---- */}
//       <div
//         className="
//           pointer-events-none absolute inset-x-0
//           -bottom-[120px] h-[220px] md:-bottom-[160px] md:h-[260px]
//           z-0 bg-white
//         "
//         style={{
//           clipPath: "ellipse(120% 100% at 50% 100%)",
//         }}
//       />
//     </section>
//   );
// };

// export default CollaborationSection;

import Image from "next/image";
import React from "react";

const CollaborationSection = () => {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a1b3d] text-white">
      {/* ---- TOP ARC (white overlay) ---- */}
      <div
        className="
          pointer-events-none absolute inset-x-0
          -top-[150px]  h-[220px]  md:-top-[160px] md:h-[260px]
          z-0 bg-white
        "
        style={{
          clipPath: "ellipse(150% 80% at 50% 120%)",
        }}
      />

      {/* ---- CONTENT ---- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Advanced Tech, In Your Corner
          </h1>
          <p className="text-lg md:text-xl mb-8">
            InteroBOT® emulates search engine crawlers, enabling our digital
            marketing team to view your site just as search engines would.
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-lg">
            See More
          </button>
        </div>

        <div className="flex-1 flex justify-center md:justify-end">
          <div className="relative w-80 md:w-[28rem]">
            <Image
              width={800}
              height={800}
              src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
              alt="Monitor"
              className="absolute -top-6 -left-6 w-full h-auto rounded-xl shadow-xl opacity-80"
            />
            <Image
              width={800}
              height={800}
              src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
              alt="Data Visualization"
              className="relative w-full h-auto rounded-xl shadow-2xl z-10"
            />
          </div>
        </div>
      </div>

      {/* ---- BOTTOM ARC (white overlay) ---- */}
      <div
        className="
          pointer-events-none absolute inset-x-0
          -bottom-[120px] h-[220px] md:-bottom-[160px] md:h-[260px]
          z-0 bg-white
        "
        style={{
          clipPath: "ellipse(120% 90% at 50% 100%)",
        }}
      />
    </section>
  );
};

export default CollaborationSection;
